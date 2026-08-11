"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useThemeColors } from "@/lib/useThemeColors";
import type { CurvePoint } from "@/lib/data";

export function CurveSnapshotChart({ points }: { points: CurvePoint[] }) {
  const c = useThemeColors();

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={points} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={c["--gridline"]} strokeWidth={1} vertical={false} />
        <XAxis
          dataKey="month"
          type="number"
          domain={[1, 4]}
          ticks={[1, 2, 3, 4]}
          tickFormatter={(m) => `M${m}`}
          tick={{ fill: c["--text-muted"], fontSize: 12 }}
          axisLine={{ stroke: c["--baseline"] }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: c["--text-muted"], fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={56}
          tickFormatter={(v) => `$${v.toFixed(0)}`}
        />
        <Tooltip
          contentStyle={{ background: c["--surface-1"], border: `1px solid ${c["--gridline"]}`, fontSize: 12 }}
          formatter={(value) => [`$${Number(value).toFixed(2)}`, "Settlement"]}
          labelFormatter={(m) => `Contract month ${m}`}
        />
        <Line
          type="monotone"
          dataKey="price"
          stroke={c["--series-1"]}
          strokeWidth={2}
          dot={{ r: 4, fill: c["--series-1"], stroke: c["--surface-1"], strokeWidth: 2 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
