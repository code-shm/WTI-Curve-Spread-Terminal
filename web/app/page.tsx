import Link from "next/link";
import { StatTile } from "@/components/StatTile";
import { EmptyState } from "@/components/EmptyState";
import { getBacktestData, getCurveData, getStatusData } from "@/lib/data";

export default function OverviewPage() {
  const curve = getCurveData();
  const backtest = getBacktestData();
  const status = getStatusData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-1">WTI Curve &amp; Spread Terminal</h1>
        <p className="text-secondary text-sm">
          Term structure, calendar spreads, and a cost-aware backtest for NYMEX WTI crude
          (contracts 1&ndash;4). Updated daily from EIA and Yahoo Finance.
        </p>
      </div>

      {status && status.warnings.length > 0 && (
        <div className="card p-4 text-sm" style={{ borderColor: "var(--critical)" }}>
          <p className="font-medium mb-1">Data notice</p>
          <ul className="list-disc pl-5 text-secondary space-y-0.5">
            {status.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTile
          label="Curve shape"
          value={curve ? curve.snapshot.shape : "—"}
          delta={curve ? `M1-M4: $${curve.snapshot.front_minus_far.toFixed(2)}` : undefined}
        />
        <StatTile
          label="Full-sample Sharpe"
          value={backtest ? backtest.full_sample.sharpe.toFixed(2) : "—"}
          direction={backtest && backtest.full_sample.sharpe > 0 ? "up-good" : "up-bad"}
        />
        <StatTile
          label="Out-of-sample Sharpe"
          value={backtest ? backtest.out_of_sample.sharpe.toFixed(2) : "—"}
          delta="70/30 split, fixed thresholds"
          direction={backtest && backtest.out_of_sample.sharpe > 0 ? "up-good" : "up-bad"}
        />
        <StatTile
          label="Max drawdown"
          value={backtest ? `$${backtest.full_sample.max_drawdown.toFixed(0)}` : "—"}
          direction="up-bad"
        />
      </div>

      {!curve && (
        <EmptyState
          title="Curve data not available yet"
          detail="Add a free EIA_API_KEY (eia.gov/opendata/register.php) to .env and rerun the pipeline to populate the contract 1-4 term structure and calendar spreads."
        />
      )}

      <div className="grid md:grid-cols-3 gap-4 text-sm">
        <Link href="/curve" className="card p-4 hover:opacity-80">
          <p className="font-medium mb-1">Curve →</p>
          <p className="text-secondary">Today's term structure and its shape over time.</p>
        </Link>
        <Link href="/spreads" className="card p-4 hover:opacity-80">
          <p className="font-medium mb-1">Spreads →</p>
          <p className="text-secondary">Calendar spreads, z-scores, seasonality, cointegration.</p>
        </Link>
        <Link href="/backtest" className="card p-4 hover:opacity-80">
          <p className="font-medium mb-1">Backtest →</p>
          <p className="text-secondary">Mean-reversion strategy with real transaction costs.</p>
        </Link>
      </div>
    </div>
  );
}
