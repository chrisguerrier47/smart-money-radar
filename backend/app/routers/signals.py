from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models.signal import Signal, TickerScore
from pydantic import BaseModel

router = APIRouter(prefix="/signals", tags=["signals"])


class SignalOut(BaseModel):
    id: int
    ticker: str
    signal_type: str
    source: Optional[str]
    actor: Optional[str]
    description: Optional[str]
    amount_usd: Optional[float]
    shares: Optional[float]
    raw_score: int
    filed_at: Optional[datetime]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


class TickerScoreOut(BaseModel):
    id: int
    ticker: str
    company_name: Optional[str]
    score: int
    signal_count: int
    signal_summary: Optional[str]
    llm_analysis: Optional[str]
    cluster_detected: int
    last_updated: Optional[datetime]

    class Config:
        from_attributes = True


@router.get("/", response_model=List[TickerScoreOut])
def get_top_signals(
    min_score: int = Query(default=40, ge=0, le=100),
    limit: int = Query(default=20, le=100),
    cluster_only: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    query = db.query(TickerScore).filter(TickerScore.score >= min_score)
    if cluster_only:
        query = query.filter(TickerScore.cluster_detected == 1)
    return query.order_by(TickerScore.score.desc()).limit(limit).all()


@router.get("/{ticker}", response_model=TickerScoreOut)
def get_ticker_score(ticker: str, db: Session = Depends(get_db)):
    result = db.query(TickerScore).filter(
        TickerScore.ticker == ticker.upper()
    ).first()
    if not result:
        raise HTTPException(status_code=404, detail=f"No data for {ticker}")
    return result


@router.get("/{ticker}/raw", response_model=List[SignalOut])
def get_ticker_raw_signals(
    ticker: str,
    limit: int = Query(default=50, le=200),
    db: Session = Depends(get_db),
):
    return (
        db.query(Signal)
        .filter(Signal.ticker == ticker.upper())
        .order_by(Signal.created_at.desc())
        .limit(limit)
        .all()
    )
