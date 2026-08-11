"""Continuous front-month WTI series from Yahoo Finance. No key required.
Used as (a) a live backup when EIA_API_KEY is not set, and (b) the outright
price series driving the backtest's front-month leg."""
import pandas as pd
import yfinance as yf

WTI_CONTINUOUS_TICKER = "CL=F"


def fetch_continuous_wti(period: str = "10y") -> pd.DataFrame:
    df = yf.download(WTI_CONTINUOUS_TICKER, period=period, progress=False)
    if df.empty:
        raise ValueError(f"yfinance returned no data for {WTI_CONTINUOUS_TICKER}")
    df.columns = [c[0] if isinstance(c, tuple) else c for c in df.columns]
    out = df[["Close"]].rename(columns={"Close": "close"})
    out.index.name = "date"
    return out
