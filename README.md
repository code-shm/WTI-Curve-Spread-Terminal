# WTI Curve & Spread Terminal

Term structure, calendar spreads, and a cost-aware backtest for NYMEX WTI crude
futures (contracts 1–4). A Python engine refreshes the data daily and exports
JSON; a Next.js dashboard on Vercel reads it. No database, no Python at request
time on Vercel — the heavy analysis runs offline on a schedule.

## Architecture

```
engine/          Python: ingestion, curve construction, spreads, signals, backtest
  ingest/        EIA (contracts 1-4 + weekly crude stocks) and yfinance (continuous front-month fallback)
  curve/         Daily curve snapshot + back-adjusted continuous front-month series
  spreads/       Calendar spreads, rolling z-score, seasonality, cointegration
  backtest/      Mean-reversion signal with real slippage/fee costs, in/out-of-sample split
  events/        EIA inventory-surprise event study
  export.py      Writes web/public/data/*.json
  run_daily.py   Single entrypoint (local run or GitHub Actions)

web/             Next.js (App Router, TypeScript) — deploy this directory to Vercel
  app/           Overview, /curve, /spreads, /backtest pages (server components read the JSON via fs)
  components/    Recharts-based chart components
  public/data/   The JSON artifacts the pages read

.github/workflows/daily-refresh.yml   Runs run_daily.py on a schedule, commits the refreshed JSON.
                                       That push triggers Vercel's normal auto-deploy — no separate
                                       cron on the Vercel side.
```

## One external dependency: an EIA API key

The multi-contract curve (M1–M4) and everything downstream of it — spreads,
z-scores, seasonality, cointegration, the event study — comes from the EIA's
daily futures settlement series (`RCLC1`–`RCLC4`) and weekly crude stocks
(`WCESTUS1`). That needs a **free** key:

1. Register at https://www.eia.gov/opendata/register.php (instant, no cost).
2. Copy `.env.example` to `.env` in the repo root and set `EIA_API_KEY=...`.

Without a key, the pipeline still runs — it falls back to a continuous
front-month series from `yfinance` (no key needed) and backtests that instead,
clearly labeled as a fallback in the dashboard. The curve and spreads pages
show a "data not available" message until you add the key and rerun.

## Run the engine locally

```bash
cd engine
pip install -r requirements.txt
python run_daily.py
```

This writes/refreshes everything under `web/public/data/`.

## Run the dashboard locally

```bash
cd web
npm install
npm run dev
```

## Deploy

**Vercel (the dashboard):**
1. Push this repo to GitHub.
2. In Vercel, "Add New Project" → import the repo → set **Root Directory to `web`**.
3. Deploy. Every subsequent push (including the daily Action's data-refresh commit) auto-redeploys.

**GitHub Actions (the daily refresh):**
1. In the repo's Settings → Secrets and variables → Actions, add a secret named
   `EIA_API_KEY` with your key.
2. The workflow in `.github/workflows/daily-refresh.yml` runs on weekday mornings
   (UTC) and on manual dispatch; it commits refreshed JSON, which triggers the
   Vercel redeploy above.
3. Note: GitHub disables a scheduled workflow automatically after 60 days with
   no commits to the repo — irrelevant while you're actively building, but if
   you step away for two months and come back, re-enable it from the Actions tab.

## Honesty notes (read before quoting numbers from this in an interview)

- **Costs are illustrative**, not live-fetched from CME's fee schedule (`engine/backtest/costs.py`).
  Update them from the actual fee schedule before treating the backtest Sharpe as real.
- **Roll dates are calendar-approximated**, not read from a contract-ID field
  (EIA's series don't expose one) — see the docstring in `engine/curve/roll_adjust.py`.
  US exchange holidays aren't modeled, so a roll date can be off by a session or two
  around a holiday.
- **The backtest thresholds (entry_z=1.5, exit_z=0.25) are fixed, not fit** — the
  in-sample/out-of-sample split exists to show whether a fixed rule survives out
  of the window it was chosen on, not to claim a tuned edge. A negative
  out-of-sample Sharpe is a real, reportable result, not a bug.
