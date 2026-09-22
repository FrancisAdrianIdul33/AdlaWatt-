import { Skia } from "@shopify/react-native-skia";

import { Colors } from "@/constants/colors";

/* ============================================================
   SHARED CHART CONSTANTS / COLORS
   ============================================================ */

export const CHART_COLORS = {
  green: Colors.light.primary,
  red: Colors.light.error,
  yellow: Colors.light.warning,
  orange: "#F97316",
  grid: "rgba(46, 46, 46, 0.10)",
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

export interface PlotPoint {
  x: number;
  y: number;
}

/* ============================================================
   DATA HELPERS
   ============================================================ */

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

export function smoothPath(
  points: PlotPoint[],
): ReturnType<typeof Skia.Path.Make> {
  const path =
    Skia.Path.Make();

  if (points.length === 0) {
    return path;
  }

  path.moveTo(
    points[0].x,
    points[0].y,
  );

  for (
    let index = 0;
    index < points.length - 1;
    index += 1
  ) {
    if (index === 0) {
      path.lineTo(
        points[1].x,
        points[1].y,
      );

      continue;
    }

    const previous =
      points[index - 1];

    const current =
      points[index];

    const next =
      points[index + 1];

    const following =
      points[
        Math.min(
          points.length - 1,
          index + 2,
        )
      ];

    const controlOne = {
      x:
        current.x +
        (next.x - previous.x) / 6,
      y:
        current.y +
        (next.y - previous.y) / 6,
    };

    const controlTwo = {
      x:
        next.x -
        (following.x - current.x) / 6,
      y:
        next.y -
        (following.y - current.y) / 6,
    };

    path.cubicTo(
      controlOne.x,
      controlOne.y,
      controlTwo.x,
      controlTwo.y,
      next.x,
      next.y,
    );
  }

  return path;
}

export function areaPath(
  points: PlotPoint[],
  baselineXStart: number,
  baselineXEnd: number,
  baselineY: number,
): ReturnType<typeof Skia.Path.Make> {
  const path =
    smoothPath(
      points,
    );

  if (points.length === 0) {
    return path;
  }

  path.lineTo(
    baselineXEnd,
    baselineY,
  );

  path.lineTo(
    baselineXStart,
    baselineY,
  );

  path.close();

  return path;
}