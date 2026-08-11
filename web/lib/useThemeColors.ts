"use client";

import { useEffect, useState } from "react";

const VAR_NAMES = [
  "--series-1",
  "--series-2",
  "--series-3",
  "--diverge-pos",
  "--diverge-neg",
  "--diverge-mid",
  "--gridline",
  "--baseline",
  "--text-secondary",
  "--text-muted",
  "--surface-1",
  "--good",
  "--critical",
] as const;

type ThemeColors = Record<(typeof VAR_NAMES)[number], string>;

function readVars(): ThemeColors {
  const style = getComputedStyle(document.documentElement);
  const out = {} as ThemeColors;
  for (const name of VAR_NAMES) {
    out[name] = style.getPropertyValue(name).trim();
  }
  return out;
}

const FALLBACK: ThemeColors = {
  "--series-1": "#2a78d6",
  "--series-2": "#eb6834",
  "--series-3": "#1baf7a",
  "--diverge-pos": "#2a78d6",
  "--diverge-neg": "#e34948",
  "--diverge-mid": "#f0efec",
  "--gridline": "#e1e0d9",
  "--baseline": "#c3c2b7",
  "--text-secondary": "#52514e",
  "--text-muted": "#898781",
  "--surface-1": "#fcfcfb",
  "--good": "#0ca30c",
  "--critical": "#d03b3b",
};

export function useThemeColors(): ThemeColors {
  const [colors, setColors] = useState<ThemeColors>(FALLBACK);

  useEffect(() => {
    setColors(readVars());
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setColors(readVars());
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return colors;
}
