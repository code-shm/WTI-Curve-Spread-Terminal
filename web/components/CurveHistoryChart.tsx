"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useThemeColors } from "@/lib/useThemeColors";
import type { CurveHistoryPoint } from "@/lib/data";

export function CurveHistoryChart({ history }: { history: CurveHistoryPoint[] }) {
  const c = useThemeColors();
  const data = history.map((h) => ({
    date: h.date,
    slope_1_4: h.slope_1_4,
    pos: h.slope_1_4 > 0 ? h.slope_1_4 : 0,
    neg: h.slope_1_4 < 0 ? h.slope_1_4 : 0,
  }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={c["--gridline"]} strokeWidth={1} vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: c["--text-muted"], fontSize: 11 }}
            axisLine={{ stroke: c["--baseline"] }}
            tickLine={false}
            minTickGap={40}
          />
          <YAxis
            tick={{ fill: c["--text-muted"], fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <ReferenceLine y={0} stroke={c["--baseline"]} strokeWidth={1} />
          <Tooltip
            contentStyle={{ background: c["--surface-1"], border: `1px solid ${c["--gridline"]}`, fontSize: 12 }}
            formatter={(value) => [`$${Number(value).toFixed(2)}`, "Contract4 - Contract1"]}
          />
          <Area type="monotone" dataKey="pos" stroke="none" fill={c["--diverge-pos"]} fillOpacity={0.12} isAnimationActive={false} />
          <Area type="monotone" dataKey="neg" stroke="none" fill={c["--diverge-neg"]} fillOpacity={0.12} isAnimationActive={false} />
          <Line type="monotone" dataKey="slope_1_4" stroke={c["--text-secondary"]} strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
      <p className="text-xs text-muted mt-2">
        <span style={{ color: c["--diverge-pos"] }}>●</span> contango (above zero) &nbsp;
        <span style={{ color: c["--diverge-neg"] }}>●</span> backwardation (below zero)
      </p>
    </div>
  );
}
