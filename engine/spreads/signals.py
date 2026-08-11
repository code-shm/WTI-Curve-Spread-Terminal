"""Signal layer on top of a spread series: rolling z-score, seasonality,
cointegration sanity check between the two legs, and a simple vol regime flag."""
import numpy as np
import pandas as pd
from statsmodels.tsa.stattools import coint


def rolling_zscore(series: pd.Series, window: int = 60) -> pd.Series:
    mean = series.rolling(window).mean()
    std = series.rolling(window).std()
    return (series - mean) / std.replace(0, np.nan)


def seasonality_by_month(series: pd.Series) -> pd.DataFrame:
    """Average spread level and daily-change stdev by calendar month,
    across all years in the sample."""
    df = series.to_frame("value")
    df["month"] = df.index.month
    df["change"] = df["value"].diff()
    grouped = df.groupby("month").agg(
        avg_level=("value", "mean"),
        vol_of_change=("change", "std"),
        n_obs=("value", "count"),
    )
    return grouped.reset_index()


def cointegration_check(leg_near: pd.Series, leg_far: pd.Series) -> dict:
    aligned = pd.concat([leg_near, leg_far], axis=1).dropna()
    score, pvalue, _ = coint(aligned.iloc[:, 0], aligned.iloc[:, 1])
    return {"coint_stat": round(float(score), 4), "p_value": round(float(pvalue), 4)}


def vol_regime(series: pd.Series, window: int = 20, lookback_pct: int = 252) -> pd.Series:
    """Rolling realized vol of the spread, percentile-ranked against its own
    trailing history -> 'low' / 'normal' / 'high'."""
    realized_vol = series.diff().rolling(window).std()
    pct_rank = realized_vol.rolling(lookback_pct, min_periods=window).rank(pct=True)
    regime = pd.cut(pct_rank, bins=[0, 0.33, 0.66, 1.0], labels=["low", "normal", "high"])
    return regime
