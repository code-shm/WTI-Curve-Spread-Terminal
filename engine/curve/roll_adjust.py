"""Back-adjusted (Panama method) continuous front-month WTI series.

Splicing raw contract_1 settlements month over month leaves a jump at every
roll (the day contract_1 becomes what used to be contract_2). For return-based
work (backtests, z-scores) that jump is a fake return and has to be removed.

Roll dates are approximated from the standard NYMEX WTI calendar rule
(expiry = 3 business days before the 25th of the month preceding delivery,
US exchange holidays not modeled) rather than inferred from the price series
itself, since we don't have per-contract IDs from the EIA series.
"""
import pandas as pd


def _wti_expiry_dates(start: pd.Timestamp, end: pd.Timestamp) -> list[pd.Timestamp]:
    dates = []
    month = pd.Timestamp(start.year, start.month, 1)
    end_scan = end + pd.DateOffset(months=2)
    while month <= end_scan:
        the_25th = month + pd.DateOffset(days=24)
        expiry = the_25th - pd.tseries.offsets.BDay(3)
        dates.append(expiry)
        month += pd.DateOffset(months=1)
    return [d for d in dates if start <= d <= end]


def build_adjusted_continuous(curve_df: pd.DataFrame) -> pd.DataFrame:
    """Returns a DataFrame with columns: raw_front, adjusted_front."""
    df = curve_df.dropna(subset=["contract_1", "contract_2"]).copy()
    df["raw_front"] = df["contract_1"]
    adjusted = df["contract_1"].copy()

    roll_dates = _wti_expiry_dates(df.index.min(), df.index.max())
    cumulative_adj = 0.0
    for roll_date in sorted(roll_dates, reverse=True):
        idx = df.index[df.index <= roll_date]
        if idx.empty:
            continue
        anchor = idx[-1]
        jump = df.loc[anchor, "contract_2"] - df.loc[anchor, "contract_1"]
        cumulative_adj += jump
        before_mask = df.index < anchor
        adjusted.loc[before_mask] = df.loc[before_mask, "contract_1"] + cumulative_adj

    df["adjusted_front"] = adjusted
    return df[["raw_front", "adjusted_front"]]
