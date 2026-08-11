"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useThemeColors } from "@/lib/useThemeColors";
import type { SpreadSeriesPoint } from "@/lib/data";

export function ZScoreChart({
  points,
  entryZ = 1.5,
  exitZ = 0.25,
  colorVar = "--series-1",
}: {
  points: SpreadSeriesPoint[];
  entryZ?: number;
  exitZ?: number;
  colorVar?: "--series-1" | "--series-2" | "--series-3";
}) {
  const c = useThemeColors();
  const data = points.filter((p) => p.zscore !== null);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={c["--gridline"]} strokeWidth={1} vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: c["--text-muted"], fontSize: 11 }}
          axisLine={{ stroke: c["--baseline"] }}
          tickLine={false}
          minTickGap={40}
        />
        <YAxis tick={{ fill: c["--text-muted"], fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
        <ReferenceLine y={0} stroke={c["--baseline"]} strokeWidth={1} />
        <ReferenceLine y={entryZ} stroke={c["--text-muted"]} strokeDasharray="4 4" strokeWidth={1} />
        <ReferenceLine y={-entryZ} stroke={c["--text-muted"]} strokeDasharray="4 4" strokeWidth={1} />
        <ReferenceLine y={exitZ} stroke={c["--gridline"]} strokeDasharray="2 3" strokeWidth={1} />
        <ReferenceLine y={-exitZ} stroke={c["--gridline"]} strokeDasharray="2 3" strokeWidth={1} />
        <Tooltip
          contentStyle={{ background: c["--surface-1"], border: `1px solid ${c["--gridline"]}`, fontSize: 12 }}
          formatter={(value) => [Number(value).toFixed(2), "z-score"]}
        />
        <Line type="monotone" dataKey="zscore" stroke={c[colorVar]} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
