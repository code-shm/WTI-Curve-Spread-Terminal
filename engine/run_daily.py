"""Single entrypoint: refreshes all data, runs the analysis, exports JSON.
Called manually (`python engine/run_daily.py`) or by the GitHub Actions cron.

Degrades gracefully without EIA_API_KEY: still produces a front-month
backtest off free yfinance data, but skips curve/spread/event-study
artifacts that need the multi-contract EIA series, and says so in status.json.
"""
import traceback
from datetime import datetime, timezone

from dotenv import load_dotenv

from ingest.eia import fetch_wti_contract_curve, fetch_crude_stocks, EiaKeyMissing
from ingest.yfinance_loader import fetch_continuous_wti
from curve.build_chain import latest_snapshot, curve_history
from curve.roll_adjust import build_adjusted_continuous
from spreads.calendar import build_calendar_spreads
from spreads.signals import rolling_zscore, seasonality_by_month, cointegration_check
from backtest.engine import run_backtest
from events.inventory_event_study import build_event_study
import export as exporter

load_dotenv()


def main() -> None:
    status = {"run_at": datetime.now(timezone.utc).isoformat(), "sources": {}, "warnings": []}

    print("Fetching continuous WTI (yfinance)...")
    continuous = fetch_continuous_wti()
    status["sources"]["yfinance_continuous_wti"] = {"ok": True, "rows": len(continuous)}

    eia_ok = False
    try:
        print("Fetching EIA contract 1-4 curve...")
        curve_df = fetch_wti_contract_curve()
        status["sources"]["eia_curve"] = {"ok": True, "rows": len(curve_df)}
        eia_ok = True
    except EiaKeyMissing as e:
        print(f"[skip] {e}")
        status["warnings"].append(str(e))
        status["sources"]["eia_curve"] = {"ok": False, "reason": "missing_api_key"}
    except Exception as e:
        print(f"[error] EIA curve fetch failed: {e}")
        traceback.print_exc()
        status["warnings"].append(f"EIA curve fetch failed: {e}")
        status["sources"]["eia_curve"] = {"ok": False, "reason": str(e)}

    if eia_ok:
        snapshot = latest_snapshot(curve_df)
        history_df = curve_history(curve_df)
        exporter.write_curve(snapshot, history_df)

        adjusted = build_adjusted_continuous(curve_df)
        spread_df = build_calendar_spreads(curve_df)

        zscore_map = {col: rolling_zscore(spread_df[col]) for col in spread_df.columns}
        seasonality_map = {col: seasonality_by_month(spread_df[col]).to_dict(orient="records")
                            for col in spread_df.columns}
        coint_map = {
            "spread_1_2": cointegration_check(curve_df["contract_1"], curve_df["contract_2"])
        }
        exporter.write_spreads(spread_df, zscore_map, seasonality_map, coint_map)

        bt = run_backtest(spread_df["spread_1_2"], zscore_map["spread_1_2"])
        exporter.write_backtest(bt)

        try:
            print("Fetching EIA weekly crude stocks...")
            stocks = fetch_crude_stocks()
            status["sources"]["eia_stocks"] = {"ok": True, "rows": len(stocks)}
            event_study = build_event_study(stocks["stocks_kbbl"], spread_df["spread_1_2"])
            exporter.write_event_study(event_study)
        except Exception as e:
            print(f"[error] EIA stocks fetch failed: {e}")
            status["warnings"].append(f"EIA stocks fetch failed: {e}")
            status["sources"]["eia_stocks"] = {"ok": False, "reason": str(e)}
    else:
        print("Running front-month-only backtest off yfinance continuous series "
              "(no curve/spread data without an EIA key).")
        proxy_zscore = rolling_zscore(continuous["close"])
        bt = run_backtest(continuous["close"], proxy_zscore)
        exporter.write_backtest(bt)

    exporter.write_status(status)
    print("Done.")


if __name__ == "__main__":
    main()
