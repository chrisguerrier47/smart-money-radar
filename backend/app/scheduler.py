"""
Daily scheduler - collects signals, scores them, runs Gemini analysis.
Runs at 6AM UTC daily + once on startup.
"""
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from app.database import SessionLocal
from app.collectors.sec_form4 import fetch_insider_trades_finnhub, fetch_activist_filings
from app.collectors.news import fetch_company_news
from app.services.signal_engine import (
    save_signals, get_recent_signals, score_signals,
    upsert_ticker_score,
)
from app.services.llm_analyst import analyze_ticker_signals
from app.models.signal import TickerScore
from app.config import settings

scheduler = AsyncIOScheduler()

WATCHLIST = [
    "AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA",
    "INTC", "AMD", "PLTR", "BAC", "JPM", "XOM", "GLD"
]


async def run_daily_collection():
    print("[Scheduler] Starting daily collection...")
    all_signals = []

    # 1. Insider trades via Finnhub
    try:
        insider = await fetch_insider_trades_finnhub()
        all_signals.extend(insider)
        print(f"[Scheduler] {len(insider)} insider signals")
    except Exception as e:
        print(f"[Scheduler] Insider collection failed: {e}")

    # 2. Activist 13D/G from EDGAR
    try:
        activist = await fetch_activist_filings(days_back=5)
        all_signals.extend(activist)
        print(f"[Scheduler] {len(activist)} activist signals")
    except Exception as e:
        print(f"[Scheduler] Activist collection failed: {e}")

    # 3. News for watchlist tickers
    try:
        for ticker in WATCHLIST:
            news = await fetch_company_news(ticker)
            all_signals.extend(news)
        print(f"[Scheduler] News collected for {len(WATCHLIST)} tickers")
    except Exception as e:
        print(f"[Scheduler] News collection failed: {e}")

    if not all_signals:
        print("[Scheduler] No signals collected")
        return

    db = SessionLocal()
    try:
        saved = save_signals(db, all_signals)
        print(f"[Scheduler] Saved {saved} new signals")

        recent = get_recent_signals(db)
        recent_dicts = [
            {
                "ticker": s.ticker,
                "signal_type": s.signal_type,
                "actor": s.actor,
                "description": s.description,
                "amount_usd": s.amount_usd,
                "filed_at": str(s.filed_at) if s.filed_at else "",
            }
            for s in recent
        ]

        scored = score_signals(recent_dicts)
        print(f"[Scheduler] Scored {len(scored)} tickers")

        for ticker, data in scored.items():
            if data["score"] >= settings.MIN_SCORE_THRESHOLD:
                upsert_ticker_score(db, ticker, data)

                # LLM analysis for clusters
                if data["score"] >= 55 and data.get("cluster_detected"):
                    try:
                        ts = db.query(TickerScore).filter(
                            TickerScore.ticker == ticker
                        ).first()
                        if ts:
                            analysis = await analyze_ticker_signals(
                                ticker=ticker,
                                company_name=ts.company_name or ticker,
                                score=data["score"],
                                signal_summary=data["signal_summary"],
                                cluster_detected=data["cluster_detected"],
                            )
                            ts.llm_analysis = analysis
                            db.commit()
                    except Exception as e:
                        print(f"[Scheduler] Gemini failed for {ticker}: {e}")

        print("[Scheduler] Done ✓")
    finally:
        db.close()


def start_scheduler():
    scheduler.add_job(
        run_daily_collection,
        CronTrigger(hour=6, minute=0),
        id="daily_collection",
        replace_existing=True,
    )
    scheduler.add_job(
        run_daily_collection,
        "date",
        id="startup_collection",
    )
    scheduler.start()
    print("[Scheduler] Started — runs daily at 06:00 UTC")
