"""
News Collector - Finnhub
Fetches market news and company-specific news for signal scoring.
"""
import httpx
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any
from app.config import settings

FINNHUB_BASE = "https://finnhub.io/api/v1"

POSITIVE_KEYWORDS = [
    "contract", "awarded", "acquisition", "buyout", "beat", "record",
    "partnership", "approval", "fda", "upgrade", "raised", "guidance"
]
NEGATIVE_KEYWORDS = [
    "downgrade", "miss", "loss", "lawsuit", "investigation", "recall",
    "cut", "layoff", "fraud", "warning", "default"
]


async def fetch_company_news(ticker: str, days_back: int = 3) -> List[Dict[str, Any]]:
    """Fetch recent news for a specific ticker from Finnhub."""
    if not settings.FINNHUB_API_KEY:
        return []

    since = (datetime.utcnow() - timedelta(days=days_back)).strftime("%Y-%m-%d")
    today = datetime.utcnow().strftime("%Y-%m-%d")

    signals = []
    async with httpx.AsyncClient(timeout=30) as client:
        try:
            resp = await client.get(
                f"{FINNHUB_BASE}/company-news",
                params={
                    "symbol": ticker,
                    "from": since,
                    "to": today,
                    "token": settings.FINNHUB_API_KEY,
                }
            )
            if resp.status_code != 200:
                return []

            articles = resp.json()
            for article in articles[:5]:  # Top 5 per ticker
                headline = article.get("headline", "").lower()
                sentiment = _classify_sentiment(headline)
                if not sentiment:
                    continue

                signals.append({
                    "ticker": ticker,
                    "signal_type": f"news_{sentiment}",
                    "source": "Finnhub News",
                    "actor": article.get("source", ""),
                    "description": article.get("headline", ""),
                    "amount_usd": None,
                    "shares": None,
                    "filed_at": datetime.fromtimestamp(
                        article.get("datetime", 0)
                    ).strftime("%Y-%m-%d") if article.get("datetime") else "",
                    "raw_data": json.dumps(article),
                })

        except Exception as e:
            print(f"[Finnhub News] Error for {ticker}: {e}")

    return signals


def _classify_sentiment(headline: str) -> str:
    """Return 'positive', 'negative', or empty string."""
    if any(kw in headline for kw in POSITIVE_KEYWORDS):
        return "positive"
    if any(kw in headline for kw in NEGATIVE_KEYWORDS):
        return "negative"
    return ""
