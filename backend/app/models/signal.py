from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func
from app.database import Base


class Signal(Base):
    __tablename__ = "signals"

    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String(10), index=True, nullable=False)
    signal_type = Column(String(50), nullable=False)
    source = Column(String(100))
    actor = Column(String(200))
    description = Column(Text)
    amount_usd = Column(Float, nullable=True)
    shares = Column(Float, nullable=True)
    raw_score = Column(Integer, default=0)
    filed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    raw_data = Column(Text, nullable=True)


class TickerScore(Base):
    __tablename__ = "ticker_scores"

    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String(10), unique=True, index=True, nullable=False)
    company_name = Column(String(200), nullable=True)
    score = Column(Integer, default=0)
    signal_count = Column(Integer, default=0)
    signal_summary = Column(Text)
    llm_analysis = Column(Text)
    cluster_detected = Column(Integer, default=0)
    last_updated = Column(DateTime, server_default=func.now(), onupdate=func.now())
