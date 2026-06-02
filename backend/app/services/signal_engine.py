"""
Signal Scoring Engine
Aggregates signals by ticker and computes a 0-100 conviction score.
"""
from datetime import datetime, timedelta
from typing import List, Dict, Any
from collections import defaultdict
from sqlalchemy.orm import Session
from app.models.signal import Signal, TickerScore
from app.config import settings

SIGNAL_WEIGHTS = {
    "insider_buy": 30,
    "activist_13d": 25,
    "activist_13g": 15,
    "news_positive": 10,
    "insider_sell": -10,
    "news_negative": -8,
}

CLUSTER_BONUS = 20
LARGE_INSIDER_THRESHOLD = 1_000_000
LARGE_INSIDER_BONUS = 10


def score_signals(signals: List[Dict[str, Any]]) -> Dict[str, Dict]:
    by_ticker: Dict[str, List[Dict]] = defaultdict(list)
    for sig in signals:
        ticker = sig.get("ticker", "").upper()
        if ticker:
            by_ticker[ticker].append(sig)

    results = {}
    for ticker, ticker_signals in by_ticker.items():
        score, cluster, summary = _compute_score(ticker_signals)
        results[ticker] = {
            "ticker": ticker,
            "score": min(score, 100),
            "signal_count": len(ticker_signals),
            "cluster_detected": cluster,
            "signal_summary": summary,
            "signals": ticker_signals,
        }
    return results


def _compute_score(signals: List[Dict]) -> tuple:
    total = 0
    source_types = set()
    summary_lines = []

    for sig in signals:
        sig_type = sig.get("signal_type", "")
        weight = SIGNAL_WEIGHTS.get(sig_type, 0)

        amount = sig.get("amount_usd") or 0
        if sig_type == "insider_buy" and amount >= LARGE_INSIDER_THRESHOLD:
            weight += LARGE_INSIDER_BONUS

        total += weight
        source_types.add(_source_category(sig_type))

        actor = sig.get("actor", "Unknown")
        desc = sig.get("description", "")
        filed = sig.get("filed_at", "")
        line = f"[{sig_type.upper()}] {actor}: {desc}"
        if filed:
            line += f" ({filed})"
        summary_lines.append(line)

    cluster_detected = len(source_types) >= 2
    if cluster_detected:
        total += CLUSTER_BONUS
        summary_lines.append(f"⚡ CLUSTER: {len(source_types)} independent source types")

    return max(total, 0), cluster_detected, "\n".join(summary_lines)


def _source_category(signal_type: str) -> str:
    mapping = {
        "insider_buy": "insider",
        "insider_sell": "insider",
        "activist_13d": "activist",
        "activist_13g": "activist",
        "news_positive": "news",
        "news_negative": "news",
    }
    return mapping.get(signal_type, "other")


def save_signals(db: Session, signals: List[Dict[str, Any]]) -> int:
    saved = 0
    for sig in signals:
        existing = (
            db.query(Signal)
            .filter(
                Signal.ticker == sig.get("ticker", ""),
                Signal.signal_type == sig.get("signal_type", ""),
                Signal.actor == sig.get("actor", ""),
                Signal.filed_at == sig.get("filed_at"),
            )
            .first()
        )
        if existing:
            continue

        db.add(Signal(
            ticker=sig.get("ticker", ""),
            signal_type=sig.get("signal_type", ""),
            source=sig.get("source", ""),
            actor=sig.get("actor", ""),
            description=sig.get("description", ""),
            amount_usd=sig.get("amount_usd"),
            shares=sig.get("shares"),
            raw_score=SIGNAL_WEIGHTS.get(sig.get("signal_type", ""), 0),
            filed_at=sig.get("filed_at"),
            raw_data=sig.get("raw_data"),
        ))
        saved += 1

    db.commit()
    return saved


def get_recent_signals(db: Session) -> List[Signal]:
    cutoff = datetime.utcnow() - timedelta(days=settings.CLUSTER_WINDOW_DAYS)
    return db.query(Signal).filter(Signal.created_at >= cutoff).all()


def upsert_ticker_score(db: Session, ticker: str, score_data: Dict) -> None:
    existing = db.query(TickerScore).filter(TickerScore.ticker == ticker).first()
    if existing:
        existing.score = score_data["score"]
        existing.signal_count = score_data["signal_count"]
        existing.signal_summary = score_data["signal_summary"]
        existing.cluster_detected = 1 if score_data["cluster_detected"] else 0
        existing.last_updated = datetime.utcnow()
    else:
        db.add(TickerScore(
            ticker=ticker,
            score=score_data["score"],
            signal_count=score_data["signal_count"],
            signal_summary=score_data["signal_summary"],
            cluster_detected=1 if score_data["cluster_detected"] else 0,
        ))
    db.commit()
