"""Event study: how does the front calendar spread move around weekly EIA
crude stock reports, conditioned on whether the change surprised to the
build or draw side relative to its own trailing trend."""
import pandas as pd

WINDOW_DAYS = 3


def build_event_study(stocks: pd.Series, spread: pd.Series, lookback_weeks: int = 8) -> dict:
    stock_change = stocks.diff()
    trailing_avg_change = stock_change.rolling(lookback_weeks).mean()
    surprise = stock_change - trailing_avg_change

    spread_daily = spread.reindex(pd.date_range(spread.index.min(), spread.index.max(), freq="D"))
    spread_daily = spread_daily.ffill()

    rows = []
    for event_date, surprise_val in surprise.dropna().items():
        window = spread_daily.loc[event_date: event_date + pd.Timedelta(days=WINDOW_DAYS)]
        if len(window) < 2 or window.isna().any():
            continue
        move = float(window.iloc[-1] - window.iloc[0])
        rows.append({
            "event_date": event_date.strftime("%Y-%m-%d"),
            "stock_change_kbbl": round(float(stock_change.loc[event_date]), 1),
            "surprise_kbbl": round(float(surprise_val), 1),
            "spread_move_next_3d": round(move, 3),
        })

    df = pd.DataFrame(rows)
    if df.empty:
        return {"events": [], "summary": None}

    builds = df[df["surprise_kbbl"] > 0]["spread_move_next_3d"]
    draws = df[df["surprise_kbbl"] < 0]["spread_move_next_3d"]
    summary = {
        "n_events": len(df),
        "avg_spread_move_on_surprise_build": round(float(builds.mean()), 3) if len(builds) else None,
        "avg_spread_move_on_surprise_draw": round(float(draws.mean()), 3) if len(draws) else None,
    }
    return {"events": rows[-40:], "summary": summary}
