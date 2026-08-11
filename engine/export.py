"""Writes the JSON artifacts the Next.js frontend reads. Nothing here talks
to the network -- it only shapes DataFrames/dicts already computed by
run_daily.py into the files under web/public/data/."""
import json
from pathlib import Path

OUT_DIR = Path(__file__).resolve().parent.parent / "web" / "public" / "data"


def _write(name: str, payload) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUT_DIR / name
    with open(path, "w") as f:
        json.dump(payload, f, indent=2, default=str)
    print(f"wrote {path} ({path.stat().st_size} bytes)")


def write_curve(snapshot: dict, history_df) -> None:
    history = [
        {"date": d.strftime("%Y-%m-%d"), "slope_1_4": round(float(row["slope_1_4"]), 3),
         "contango": bool(row["is_contango"])}
        for d, row in history_df.iterrows()
    ]
    _write("curve_latest.json", {"snapshot": snapshot, "history": history[-500:]})


def write_spreads(spread_df, zscore_map: dict, seasonality_map: dict, coint_map: dict) -> None:
    series = {}
    for col in spread_df.columns:
        series[col] = [
            {"date": d.strftime("%Y-%m-%d"), "value": round(float(v), 3),
             "zscore": None if col not in zscore_map or pd_isna(zscore_map[col].get(d)) else round(float(zscore_map[col][d]), 3)}
            for d, v in spread_df[col].dropna().items()
        ][-750:]
    _write("spreads_timeseries.json", {
        "series": series,
        "seasonality": seasonality_map,
        "cointegration": coint_map,
    })


def write_backtest(results: dict) -> None:
    _write("backtest_results.json", results)


def write_event_study(results: dict) -> None:
    _write("event_study.json", results)


def write_status(meta: dict) -> None:
    _write("status.json", meta)


def pd_isna(x):
    import pandas as pd
    return pd.isna(x)
