"""
EIA v2 API client for WTI futures curve points and Cushing crude stocks.

Series used (EIA "Petroleum & Other Liquids" daily futures prices):
  RCLC1..RCLC4 = Cushing, OK Crude Oil Futures Contract 1-4 (near month .. 4th month), $/bbl
Weekly fundamentals:
  WCESTUS1 = Weekly U.S. Ending Stocks of Crude Oil, thousand barrels

Requires a free key from https://www.eia.gov/opendata/register.php
set as EIA_API_KEY in the environment (see .env.example).
"""
import os
import requests
import pandas as pd

BASE = "https://api.eia.gov/v2"
CONTRACT_SERIES = ["RCLC1", "RCLC2", "RCLC3", "RCLC4"]


class EiaKeyMissing(RuntimeError):
    pass


def _api_key() -> str:
    key = os.environ.get("EIA_API_KEY", "").strip()
    if not key:
        raise EiaKeyMissing(
            "EIA_API_KEY not set. Get a free key at "
            "https://www.eia.gov/opendata/register.php and put it in .env"
        )
    return key


def _get(route: str, series: list[str], frequency: str) -> pd.DataFrame:
    params = {
        "api_key": _api_key(),
        "frequency": frequency,
        "data[0]": "value",
        "sort[0][column]": "period",
        "sort[0][direction]": "asc",
        "length": 5000,
    }
    for i, s in enumerate(series):
        params[f"facets[series][{i}]"] = s

    resp = requests.get(f"{BASE}/{route}/data/", params=params, timeout=30)
    resp.raise_for_status()
    payload = resp.json()
    rows = payload.get("response", {}).get("data", [])
    if not rows:
        raise ValueError(
            f"EIA returned no rows for route={route} series={series}. "
            f"Raw response: {payload}"
        )
    df = pd.DataFrame(rows)
    df["period"] = pd.to_datetime(df["period"])
    return df


def fetch_wti_contract_curve() -> pd.DataFrame:
    """Daily settlement for WTI futures contracts 1-4. Returns wide DataFrame
    indexed by date with columns contract_1..contract_4 (USD/bbl)."""
    df = _get("petroleum/pri/fut", CONTRACT_SERIES, frequency="daily")
    wide = df.pivot_table(index="period", columns="series", values="value")
    wide = wide.rename(columns={s: f"contract_{i+1}" for i, s in enumerate(CONTRACT_SERIES)})
    wide = wide[[f"contract_{i+1}" for i in range(len(CONTRACT_SERIES))]]
    wide.index.name = "date"
    return wide.sort_index()


def fetch_crude_stocks() -> pd.DataFrame:
    """Weekly U.S. crude ending stocks, thousand barrels."""
    df = _get("petroleum/stoc/wstk", ["WCESTUS1"], frequency="weekly")
    out = df[["period", "value"]].rename(columns={"period": "date", "value": "stocks_kbbl"})
    return out.set_index("date").sort_index()
