"""
LLM Analyst - Google Gemini
Explains signal clusters in plain English. Acts as analyst, not stock picker.
"""
import google.generativeai as genai
from app.config import settings

SYSTEM_PROMPT = """You are a financial signal analyst. Explain smart-money activity 
patterns in plain English. You do NOT give buy/sell recommendations. You explain 
what signals mean, how unusual they are, and what patterns you observe. Be concise 
(3-5 sentences). Use hedged language. Never recommend buying or selling."""


def _get_model():
    genai.configure(api_key=settings.GEMINI_API_KEY)
    return genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        system_instruction=SYSTEM_PROMPT,
    )


async def analyze_ticker_signals(
    ticker: str,
    company_name: str,
    score: int,
    signal_summary: str,
    cluster_detected: bool,
) -> str:
    if not settings.GEMINI_API_KEY:
        return "LLM analysis unavailable — set GEMINI_API_KEY."

    try:
        model = _get_model()
        prompt = f"""Analyze these smart-money signals for {ticker} ({company_name}).

Conviction Score: {score}/100
Cluster (2+ independent sources in 30 days): {"YES" if cluster_detected else "NO"}

Signals:
{signal_summary}

Provide analyst commentary (3-5 sentences):
1. Which signal is most significant and why
2. Whether the convergence is unusual
3. Any caveats or alternative explanations
Do NOT recommend buying or selling."""

        response = model.generate_content(prompt)
        return response.text

    except Exception as e:
        print(f"[Gemini] Analysis failed for {ticker}: {e}")
        return "Analysis unavailable."


async def generate_daily_summary(top_tickers: list) -> str:
    if not settings.GEMINI_API_KEY or not top_tickers:
        return ""

    try:
        model = _get_model()
        lines = [
            f"- {t['ticker']}: score {t['score']}/100, {t['signal_count']} signals"
            + (" [CLUSTER]" if t.get("cluster_detected") else "")
            for t in top_tickers[:10]
        ]
        prompt = f"""Today's top smart-money signals:

{chr(10).join(lines)}

Write a 2-3 sentence briefing on notable patterns. Focus on themes and signal types. 
Do not recommend any stocks."""

        response = model.generate_content(prompt)
        return response.text

    except Exception as e:
        print(f"[Gemini] Daily summary failed: {e}")
        return ""
