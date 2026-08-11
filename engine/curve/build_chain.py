"""Build daily curve snapshots from the EIA contract_1..contract_4 wide frame."""
import pandas as pd

CONTRACT_COLS = ["contract_1", "contract_2", "contract_3", "contract_4"]


def latest_snapshot(curve_df: pd.DataFrame) -> dict:
    """Most recent complete curve point, plus shape classification."""
    row = curve_df.dropna(subset=CONTRACT_COLS).iloc[-1]
    points = [{"month": i + 1, "price": round(float(row[c]), 3)} for i, c in enumerate(CONTRACT_COLS)]
    shape = "contango" if row["contract_4"] > row["contract_1"] else "backwardation"
    return {
        "date": row.name.strftime("%Y-%m-%d"),
        "points": points,
        "shape": shape,
        "front_minus_far": round(float(row["contract_1"] - row["contract_4"]), 3),
    }


def curve_history(curve_df: pd.DataFrame) -> pd.DataFrame:
    """Per-day shape metrics: slope (contract_4 - contract_1) and its sign."""
    df = curve_df.dropna(subset=CONTRACT_COLS).copy()
    df["slope_1_4"] = df["contract_4"] - df["contract_1"]
    df["is_contango"] = df["slope_1_4"] > 0
    return df
