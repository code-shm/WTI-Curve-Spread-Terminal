"""Calendar spreads between adjacent WTI contract months."""
import pandas as pd

PAIRS = [(1, 2), (2, 3), (3, 4)]


def build_calendar_spreads(curve_df: pd.DataFrame) -> pd.DataFrame:
    df = curve_df.dropna(subset=[f"contract_{i}" for i in range(1, 5)]).copy()
    out = pd.DataFrame(index=df.index)
    for near, far in PAIRS:
        out[f"spread_{near}_{far}"] = df[f"contract_{near}"] - df[f"contract_{far}"]
    return out
