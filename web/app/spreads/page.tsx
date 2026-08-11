import { EmptyState } from "@/components/EmptyState";
import { SpreadsChart } from "@/components/SpreadsChart";
import { ZScoreChart } from "@/components/ZScoreChart";
import { getSpreadsData } from "@/lib/data";

const SPREAD_LABELS: Record<string, string> = {
  spread_1_2: "M1 - M2",
  spread_2_3: "M2 - M3",
  spread_3_4: "M3 - M4",
};
const SPREAD_COLOR_VARS = {
  spread_1_2: "--series-1",
  spread_2_3: "--series-2",
  spread_3_4: "--series-3",
} as const;

export default function SpreadsPage() {
  const data = getSpreadsData();

  if (!data) {
    return (
      <EmptyState
        title="Spread data not available"
        detail="This page needs EIA_API_KEY set so the pipeline can pull contracts 1-4 and derive calendar spreads. See the README for setup."
      />
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Calendar spreads</h1>
        <p className="text-secondary text-sm">
          Adjacent contract-month spreads, their rolling z-score, and a cointegration sanity check on the front leg.
        </p>
      </div>

      <div className="card p-4">
        <h2 className="text-sm font-medium mb-2">Spread levels ($/bbl)</h2>
        <SpreadsChart series={data.series} />
      </div>

      <div className="grid md:grid-cols-3 gap-4 text-sm">
        {Object.entries(data.cointegration).map(([key, result]) => (
          <div className="card p-4" key={key}>
            <p className="text-muted text-xs mb-1">Cointegration ({SPREAD_LABELS[key] ?? key} legs)</p>
            <p className="font-medium">p = {result.p_value.toFixed(4)}</p>
            <p className="text-secondary text-xs mt-1">
              {result.p_value < 0.05
                ? "Legs cointegrate at 5% — mean-reversion assumption holds up statistically."
                : "Not significant at 5% — treat mean-reversion signals on this leg with caution."}
            </p>
          </div>
        ))}
      </div>

      {Object.entries(data.series).map(([key, points]) => (
        <div className="card p-4" key={key}>
          <h2 className="text-sm font-medium mb-2">
            {SPREAD_LABELS[key] ?? key} &mdash; 60d rolling z-score
          </h2>
          <ZScoreChart points={points} colorVar={SPREAD_COLOR_VARS[key as keyof typeof SPREAD_COLOR_VARS] ?? "--series-1"} />
        </div>
      ))}
    </div>
  );
}
