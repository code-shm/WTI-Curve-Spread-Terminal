"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useThemeColors } from "@/lib/useThemeColors";
import type { SpreadSeriesPoint } from "@/lib/data";

const SERIES_META = [
  { key: "spread_1_2", label: "M1-M2", colorVar: "--series-1" as const },
  { key: "spread_2_3", label: "M2-M3", colorVar: "--series-2" as const },
  { key: "spread_3_4", label: "M3-M4", colorVar: "--series-3" as const },
];

function mergeSeries(series: Record<string, SpreadSeriesPoint[]>) {
  const dateSet = new Set<string>();
  for (const key of Object.keys(series)) {
    for (const point of series[key]) dateSet.add(point.date);
  }
  const dates = Array.from(dateSet).sort();
  return dates.map((date) => {
    const row: Record<string, string | number | null> = { date };
    for (const key of Object.keys(series)) {
      const point = series[key].find((p) => p.date === date);
      row[key] = point ? point.value : null;
    }
    return row;
  });
}

export function SpreadsChart({ series }: { series: Record<string, SpreadSeriesPoint[]> }) {
  const c = useThemeColors();
  const data = mergeSeries(series);

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={c["--gridline"]} strokeWidth={1} vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: c["--text-muted"], fontSize: 11 }}
          axisLine={{ stroke: c["--baseline"] }}
          tickLine={false}
          minTickGap={40}
        />
        <YAxis tick={{ fill: c["--text-muted"], fontSize: 12 }} axisLine={false} tickLine={false} width={48} />
        <Tooltip
          contentStyle={{ background: c["--surface-1"], border: `1px solid ${c["--gridline"]}`, fontSize: 12 }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: c["--text-secondary"] }} />
        {SERIES_META.map((s) =>
          s.key in series ? (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={c[s.colorVar]}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          ) : null
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
