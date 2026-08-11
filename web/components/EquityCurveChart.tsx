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

export function EquityCurveChart({ equityCurve }: { equityCurve: { date: string; pnl: number }[] }) {
  const c = useThemeColors();

  let peak = -Infinity;
  const data = equityCurve.map((p) => {
    peak = Math.max(peak, p.pnl);
    return { ...p, drawdown: p.pnl - peak };
  });

  return (
    <ResponsiveContainer width="100%" height={320}>
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
          width={64}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
        />
        <ReferenceLine y={0} stroke={c["--baseline"]} strokeWidth={1} />
        <Tooltip
          contentStyle={{ background: c["--surface-1"], border: `1px solid ${c["--gridline"]}`, fontSize: 12 }}
          formatter={(value, name) => [`$${Number(value).toFixed(0)}`, name === "pnl" ? "Cumulative P&L" : "Drawdown"]}
        />
        <Area type="monotone" dataKey="drawdown" stroke="none" fill={c["--critical"]} fillOpacity={0.1} isAnimationActive={false} />
        <Line type="monotone" dataKey="pnl" stroke={c["--series-1"]} strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
