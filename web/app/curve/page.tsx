import { CurveHistoryChart } from "@/components/CurveHistoryChart";
import { CurveSnapshotChart } from "@/components/CurveSnapshotChart";
import { EmptyState } from "@/components/EmptyState";
import { getCurveData } from "@/lib/data";

export default function CurvePage() {
  const curve = getCurveData();

  if (!curve) {
    return (
      <EmptyState
        title="Curve data not available"
        detail="This page needs EIA_API_KEY set so the pipeline can pull contracts 1-4. See the README for setup."
      />
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Term structure</h1>
        <p className="text-secondary text-sm">
          As of {curve.snapshot.date} the curve is in{" "}
          <span className="font-medium">{curve.snapshot.shape}</span>, M1&ndash;M4 ={" "}
          ${curve.snapshot.front_minus_far.toFixed(2)}.
        </p>
      </div>

      <div className="card p-4">
        <h2 className="text-sm font-medium mb-2">Today&apos;s curve (contracts 1&ndash;4)</h2>
        <CurveSnapshotChart points={curve.snapshot.points} />
      </div>

      <div className="card p-4">
        <h2 className="text-sm font-medium mb-2">Curve slope over time (contract 4 &minus; contract 1)</h2>
        <CurveHistoryChart history={curve.history} />
      </div>
    </div>
  );
}
