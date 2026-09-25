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
  orange: "#F97316",
  grid: "rgba(46, 46, 46, 0.10)",
  axisLabel: "#8E8E93",
  muted: "#D8D2C2",
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
