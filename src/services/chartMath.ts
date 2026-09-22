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

export const AXIS_LABEL_SPACE = 24;

export const chartPlot = {
  top: 10,
  right: 8,
  bottom: AXIS_LABEL_SPACE,
  left: 8,
} as const;

export const MAX_PLOT_POINTS = 48;

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

export function decimate<T>(
  points: T[],
  max = MAX_PLOT_POINTS,
): T[] {
  if (points.length <= max) {
    return points;
  }

  const step =
    points.length / max;

  const result: T[] = [];

  for (
    let index = 0;
    index < max;
    index += 1
  ) {
    result.push(
      points[
        Math.min(
          points.length - 1,
          Math.floor(index * step),
        )
      ],
    );
  }

  result[max - 1] =
    points[points.length - 1];

  return result;
}
