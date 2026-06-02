"""
Insider Trade Collector
- SEC EDGAR: activist 13D/G filings (free)
- Finnhub: insider transactions (free tier)
"""
import httpx
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any
from app.config import settings

EDGAR_SEARCH = "https://efts.sec.gov/LATEST/search-index"
FINNHUB_BASE = "https://finnhub.io/api/v1"
HEADERS = {"User-Agent": settings.SEC_USER_AGENT}

MIN_BUY_AMOUNT = 50_000


async def fetch_insider_trades_finnhub(ticker: str = None) -> List[Dict[str, Any]]:
    """
    Fetch insider transactions from Finnhub.
    Free tier supports per-ticker lookups.
    """
    if not settings.FINNHUB_API_KEY:
        print("[Finnhub] No FINNHUB_API_KEY set")
        return []

    # If no ticker specified, pull a watchlist of high-activity stocks
    tickers = [ticker] if ticker else [
        "AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA",
        "INTC", "AMD", "PLTR", "BAC", "JPM", "XOM", "GLD", "SPY"
    ]

    signals = []
    async with httpx.AsyncClient(timeout=30) as client:
        for t in tickers:
            try:
                resp = await client.get(
                    f"{FINNHUB_BASE}/stock/insider-transactions",
                    params={"symbol": t, "token": settings.FINNHUB_API_KEY}
                )
                if resp.status_code != 200:
                    continue

                data = resp.json()
                transactions = data.get("data", [])

                for tx in transactions:
                    # Only purchases
                    if tx.get("transactionType") != "P - Purchase":
                        continue

                    shares = float(tx.get("share", 0) or 0)
                    price = float(tx.get("transactionPrice", 0) or 0)
                    amount = shares * price

                    if amount < MIN_BUY_AMOUNT:
                        continue

                    signals.append({
                        "ticker": t,
                        "signal_type": "insider_buy",
                        "source": "Finnhub",
                        "actor": f"{tx.get('name', 'Unknown')} ({tx.get('officerTitle', '')})",
                        "description": f"Purchased {shares:,.0f} shares at ${price:.2f}",
                        "amount_usd": amount,
                        "shares": shares,
                        "filed_at": tx.get("filingDate", ""),
                        "raw_data": json.dumps(tx),
                    })

            except Exception as e:
                print(f"[Finnhub] Error for {t}: {e}")

    return signals


async def fetch_activist_filings(days_back: int = 10) -> List[Dict[str, Any]]:
    """
    Fetch 13D/G activist filings directly from SEC EDGAR.
    13D = intent to influence (high conviction)
    13G = passive stake >5%
    Must be filed within 10 days of crossing 5% threshold.
    """
    since = (datetime.utcnow() - timedelta(days=days_back)).strftime("%Y-%m-%d")
    signals = []

    for form_type in ["SC 13D", "SC 13G"]:
        url = (
            f"{EDGAR_SEARCH}?forms={form_type.replace(' ', '+')}"
            f"&dateRange=custom&startdt={since}"
        )
        async with httpx.AsyncClient(headers=HEADERS, timeout=30) as client:
            try:
                resp = await client.get(url)
                resp.raise_for_status()
                data = resp.json()
                hits = data.get("hits", {}).get("hits", [])

                for hit in hits:
                    src = hit.get("_source", {})
                    filer = src.get("entity_name", "Unknown")
                    filed = src.get("file_date", "")
                    is_13d = form_type == "SC 13D"

                    # Try to extract ticker
                    ticker = ""
                    display = src.get("display_names", [])
                    if isinstance(display, list):
                        for item in display:
                            if isinstance(item, dict) and item.get("ticker"):
                                ticker = item["ticker"]
                                break

                    if not ticker:
                        continue

                    signals.append({
                        "ticker": ticker.upper(),
                        "signal_type": "activist_13d" if is_13d else "activist_13g",
                        "source": "SEC EDGAR",
                        "actor": filer,
                        "description": (
                            "Activist stake >5% with intent to influence"
                            if is_13d else
                            "Passive stake >5% disclosed"
                        ),
                        "amount_usd": None,
                        "shares": None,
                        "filed_at": filed,
                        "raw_data": json.dumps(src),
                    })

            except Exception as e:
                print(f"[EDGAR] Error fetching {form_type}: {e}")

    return signals
