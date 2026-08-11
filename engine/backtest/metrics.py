"""Performance metrics computed off a daily P&L series and a trade log."""
import numpy as np
import pandas as pd

TRADING_DAYS_PER_YEAR = 252


def sharpe_ratio(daily_pnl: pd.Series) -> float:
    if daily_pnl.std() == 0 or daily_pnl.dropna().empty:
        return 0.0
    return float(daily_pnl.mean() / daily_pnl.std() * np.sqrt(TRADING_DAYS_PER_YEAR))


def max_drawdown(cumulative_pnl: pd.Series) -> float:
    running_max = cumulative_pnl.cummax()
    drawdown = cumulative_pnl - running_max
    return float(drawdown.min())


def trade_stats(trade_pnls: list[float]) -> dict:
    if not trade_pnls:
        return {"n_trades": 0, "hit_rate": None, "avg_win": None, "avg_loss": None}
    arr = np.array(trade_pnls)
    wins = arr[arr > 0]
    losses = arr[arr <= 0]
    return {
        "n_trades": len(arr),
        "hit_rate": round(float(len(wins) / len(arr)), 4),
        "avg_win": round(float(wins.mean()), 2) if len(wins) else 0.0,
        "avg_loss": round(float(losses.mean()), 2) if len(losses) else 0.0,
    }


def annual_turnover(position: pd.Series) -> float:
    """Number of position changes (contracts flipped) per year of sample."""
    n_changes = int((position.diff().fillna(0) != 0).sum())
    years = max(len(position) / TRADING_DAYS_PER_YEAR, 1e-9)
    return round(n_changes / years, 2)


def summarize(daily_pnl: pd.Series, position: pd.Series, trade_pnls: list[float]) -> dict:
    cumulative = daily_pnl.cumsum()
    return {
        "sharpe": round(sharpe_ratio(daily_pnl), 3),
        "total_pnl": round(float(cumulative.iloc[-1]) if len(cumulative) else 0.0, 2),
        "max_drawdown": round(max_drawdown(cumulative), 2),
        "annual_turnover": annual_turnover(position),
        **trade_stats(trade_pnls),
    }
