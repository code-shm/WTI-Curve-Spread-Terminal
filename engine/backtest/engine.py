"""Mean-reversion backtest on a calendar spread's z-score, with real costs.

Signal: go short the spread when z > entry_z (expect reversion down), long
when z < -entry_z, flat out when |z| < exit_z. One contract per leg, no
pyramiding. Costs are charged on every position change, not just at trade
close, so a strategy that flips constantly gets punished immediately.

Validation is a simple in-sample / out-of-sample split: the entry/exit
thresholds are fixed a priori (not fit), but metrics are reported separately
for the two halves so an OOS Sharpe collapse is visible rather than averaged away.
"""
import numpy as np
import pandas as pd

from .costs import TICK_VALUE, EXCHANGE_FEE_PER_CONTRACT, SLIPPAGE_TICKS_PER_LEG
from .metrics import summarize

LEGS_PER_SPREAD = 2


def _position_change_cost(n_contracts_changed: int) -> float:
    per_leg = SLIPPAGE_TICKS_PER_LEG * TICK_VALUE + EXCHANGE_FEE_PER_CONTRACT
    return abs(n_contracts_changed) * LEGS_PER_SPREAD * per_leg


def generate_positions(zscore: pd.Series, entry_z: float = 1.5, exit_z: float = 0.25) -> pd.Series:
    position = pd.Series(0, index=zscore.index, dtype=int)
    current = 0
    for date, z in zscore.items():
        if pd.isna(z):
            position.loc[date] = current
            continue
        if current == 0:
            if z > entry_z:
                current = -1
            elif z < -entry_z:
                current = 1
        else:
            if abs(z) < exit_z:
                current = 0
        position.loc[date] = current
    return position


def run_backtest(spread_price: pd.Series, zscore: pd.Series, entry_z: float = 1.5,
                  exit_z: float = 0.25, contract_size_bbl: int = 1000) -> dict:
    aligned = pd.concat([spread_price, zscore], axis=1).dropna()
    aligned.columns = ["price", "z"]

    position = generate_positions(aligned["z"], entry_z, exit_z)
    price_change = aligned["price"].diff().fillna(0)

    gross_pnl = position.shift(1).fillna(0) * price_change * contract_size_bbl
    position_delta = position.diff().fillna(position.iloc[0])
    costs = position_delta.apply(lambda d: _position_change_cost(d))
    daily_pnl = gross_pnl - costs

    trade_pnls = _closed_trade_pnls(position, daily_pnl)

    split = int(len(daily_pnl) * 0.7)
    in_sample = summarize(daily_pnl.iloc[:split], position.iloc[:split],
                           [p["pnl"] for p in trade_pnls if p["exit_idx"] < split])
    out_sample = summarize(daily_pnl.iloc[split:], position.iloc[split:],
                            [p["pnl"] for p in trade_pnls if p["exit_idx"] >= split])

    return {
        "in_sample": {k: v for k, v in in_sample.items()},
        "out_of_sample": {k: v for k, v in out_sample.items()},
        "full_sample": summarize(daily_pnl, position, [p["pnl"] for p in trade_pnls]),
        "equity_curve": [
            {"date": d.strftime("%Y-%m-%d"), "pnl": round(float(v), 2)}
            for d, v in daily_pnl.cumsum().items()
        ],
        "params": {"entry_z": entry_z, "exit_z": exit_z},
    }


def _closed_trade_pnls(position: pd.Series, daily_pnl: pd.Series) -> list[dict]:
    trades = []
    open_idx = None
    running = 0.0
    idx_list = list(position.index)
    for i, date in enumerate(idx_list):
        pos = position.loc[date]
        if pos != 0 and open_idx is None:
            open_idx = i
            running = 0.0
        if open_idx is not None:
            running += daily_pnl.loc[date]
        if pos == 0 and open_idx is not None:
            trades.append({"exit_idx": i, "pnl": running})
            open_idx = None
    return trades
