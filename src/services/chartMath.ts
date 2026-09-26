import { Colors } from "@/constants/colors";

/* ============================================================
   SHARED CHART CONSTANTS / COLORS
   Plain data helpers only so charts work on native
   and web with zero engine loading.
   ============================================================ */

export const CHART_COLORS = {
  green: Colors.light.primary,
  red: Colors.light.error,
  yellow: Colors.light.warning,
  orange: Colors.light.chart.orange,
  grid: Colors.light.chart.grid,
  axisLabel: Colors.light.chart.axisLabel,
  muted: Colors.light.border,
} as const;

export const CHART_HEIGHT = 190;

/* ============================================================
   DATA HELPERS
   ============================================================ */

export function clampPercent(
  value: number,
): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(100, value),
  );
}
