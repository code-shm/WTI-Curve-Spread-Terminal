import { EquityCurveChart } from "@/components/EquityCurveChart";
import { StatTile } from "@/components/StatTile";
import { getBacktestData, getCurveData } from "@/lib/data";
import type { BacktestSummary } from "@/lib/data";

function SummaryRow({ title, summary }: { title: string; summary: BacktestSummary }) {
  return (
    <div className="card p-4">
      <p className="text-sm font-medium mb-3">{title}</p>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-xs">
        <div>
          <p className="text-muted">Sharpe</p>
          <p className="font-medium">{summary.sharpe.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-muted">Total P&amp;L</p>
          <p className="font-medium">${summary.total_pnl.toFixed(0)}</p>
        </div>
        <div>
          <p className="text-muted">Max DD</p>
          <p className="font-medium">${summary.max_drawdown.toFixed(0)}</p>
        </div>
        <div>
          <p className="text-muted">Turnover/yr</p>
          <p className="font-medium">{summary.annual_turnover}</p>
        </div>
        <div>
          <p className="text-muted">Trades</p>
          <p className="font-medium">{summary.n_trades}</p>
        </div>
        <div>
          <p className="text-muted">Hit rate</p>
          <p className="font-medium">{summary.hit_rate !== null ? `${(summary.hit_rate * 100).toFixed(0)}%` : "—"}</p>
        </div>
      </div>
    </div>
  );
}

export default function BacktestPage() {
  const backtest = getBacktestData();
  const curve = getCurveData();
  const usingFallback = !curve;

  if (!backtest) {
    return <p className="text-secondary text-sm">No backtest results yet — run the pipeline first.</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Backtest</h1>
        <p className="text-secondary text-sm">
          Mean-reversion on the {usingFallback ? "front-month outright (fallback, no EIA key set)" : "M1-M2 calendar spread"}{" "}
          z-score. Entry |z| &gt; {backtest.params.entry_z}, exit |z| &lt; {backtest.params.exit_z}. Costs (slippage +
          exchange/clearing fees) are charged on every position change, not just at trade close.
        </p>
      </div>

      <EquityCurveChart equityCurve={backtest.equity_curve} />

      <div className="space-y-3">
        <SummaryRow title="In-sample (first 70%)" summary={backtest.in_sample} />
        <SummaryRow title="Out-of-sample (last 30%)" summary={backtest.out_of_sample} />
        <SummaryRow title="Full sample" summary={backtest.full_sample} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTile label="Avg win" value={backtest.full_sample.avg_win !== null ? `$${backtest.full_sample.avg_win.toFixed(0)}` : "—"} direction="up-good" />
        <StatTile label="Avg loss" value={backtest.full_sample.avg_loss !== null ? `$${backtest.full_sample.avg_loss.toFixed(0)}` : "—"} direction="up-bad" />
      </div>

      <p className="text-xs text-muted">
        Honest disclosure: this is a fixed-threshold signal, not a fit/optimized one — the in-sample vs
        out-of-sample split exists to show whether performance survives outside the window it was eyeballed on,
        not to claim a tuned edge.
      </p>
    </div>
  );
}
