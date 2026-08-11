import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "public", "data");

function readJson<T>(filename: string): T | null {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

export type CurvePoint = { month: number; price: number };
export type CurveSnapshot = {
  date: string;
  points: CurvePoint[];
  shape: "contango" | "backwardation";
  front_minus_far: number;
};
export type CurveHistoryPoint = { date: string; slope_1_4: number; contango: boolean };
export type CurveData = { snapshot: CurveSnapshot; history: CurveHistoryPoint[] };

export type SpreadSeriesPoint = { date: string; value: number; zscore: number | null };
export type SpreadsData = {
  series: Record<string, SpreadSeriesPoint[]>;
  seasonality: Record<string, { month: number; avg_level: number; vol_of_change: number; n_obs: number }[]>;
  cointegration: Record<string, { coint_stat: number; p_value: number }>;
};

export type BacktestSummary = {
  sharpe: number;
  total_pnl: number;
  max_drawdown: number;
  annual_turnover: number;
  n_trades: number;
  hit_rate: number | null;
  avg_win: number | null;
  avg_loss: number | null;
};
export type BacktestData = {
  in_sample: BacktestSummary;
  out_of_sample: BacktestSummary;
  full_sample: BacktestSummary;
  equity_curve: { date: string; pnl: number }[];
  params: { entry_z: number; exit_z: number };
};

export type EventStudyData = {
  events: { event_date: string; stock_change_kbbl: number; surprise_kbbl: number; spread_move_next_3d: number }[];
  summary: {
    n_events: number;
    avg_spread_move_on_surprise_build: number | null;
    avg_spread_move_on_surprise_draw: number | null;
  } | null;
};

export type StatusData = {
  run_at: string;
  sources: Record<string, { ok: boolean; rows?: number; reason?: string }>;
  warnings: string[];
};

export const getCurveData = () => readJson<CurveData>("curve_latest.json");
export const getSpreadsData = () => readJson<SpreadsData>("spreads_timeseries.json");
export const getBacktestData = () => readJson<BacktestData>("backtest_results.json");
export const getEventStudyData = () => readJson<EventStudyData>("event_study.json");
export const getStatusData = () => readJson<StatusData>("status.json");
