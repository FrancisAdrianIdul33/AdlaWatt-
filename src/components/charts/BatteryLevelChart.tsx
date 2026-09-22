import React, {
  useEffect,
  useMemo,
} from "react";
import {
  View,
} from "react-native";
import {
  Canvas,
  DashPathEffect,
  Line,
  LinearGradient,
  Path,
  vec,
} from "@shopify/react-native-skia";
import {
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  ChartPoint,
} from "@/services/analyticsService";
import {
  AxisLabels,
  useChartWidth,
  ChartEmpty,
} from "@/components/charts/ChartBits";
import {
  areaPath,
  CHART_COLORS,
  chartPlot,
  CHART_HEIGHT,
  decimate,
  smoothPath,
} from "@/components/charts/chartMath";

/* ============================================================
   BATTERY LEVEL OVER TIME (AREA + DASHED 20% FLOOR)
   ============================================================ */

export default function BatteryLevelChart({
  points,
}: {
  points: ChartPoint[];
}) {
  const { width, onLayout } =
    useChartWidth();

  const progress =
    useSharedValue(0);

  useEffect(() => {
    progress.value = 0;

    progress.value = withTiming(
      1,
      {
        duration: 450,
      },
    );
  }, [points, width, progress]);

  const end = useDerivedValue(
    () => progress.value,
  );

  const geometry = useMemo(() => {
    if (
      width <= 0 ||
      points.length < 2
    ) {
      return null;
    }

    const plotWidth =
      width -
      chartPlot.left -
      chartPlot.right;

    const plotHeight =
      CHART_HEIGHT -
      chartPlot.top -
      chartPlot.bottom;

    const sampled =
      decimate(points);

    const mapPoint = (
      index: number,
      value: number,
    ) => {
      const clamped = Math.max(
        0,
        Math.min(100, value),
      );

      const x =
        sampled.length === 1
          ? chartPlot.left +
            plotWidth / 2
          : chartPlot.left +
            (index /
              (sampled.length - 1)) *
              plotWidth;

      const y =
        chartPlot.top +
        (1 - clamped / 100) *
          plotHeight;

      return { x, y };
    };

    const linePoints =
      sampled.map(
        (point, index) =>
          mapPoint(
            index,
            point.value,
          ),
      );

    const baselineY =
      chartPlot.top +
      plotHeight;

    const fill = areaPath(
      linePoints,
      linePoints[0].x,
      linePoints[
        linePoints.length - 1
      ].x,
      baselineY,
    );

    const stroke =
      smoothPath(
        linePoints,
      );

    const dashedY = mapPoint(
      0,
      20,
    ).y;

    const yFor = (value: number) =>
      chartPlot.top +
      (1 - value / 100) *
        plotHeight;

    return {
      linePoints,
      fill,
      stroke,
      dashedY,
      yFor,
      sampled,
      plotWidth,
      plotHeight,
    };
  }, [points, width]);

  if (points.length < 2) {
    return (
      <ChartEmpty message="Not enough battery history for this range." />
    );
  }

  if (!geometry) {
    return (
      <View
        onLayout={onLayout}
        style={{
          width: "100%",
          height: CHART_HEIGHT,
        }}
      />
    );
  }

  const {
    fill,
    stroke,
    dashedY,
    yFor,
    plotWidth,
    plotHeight,
    sampled,
  } = geometry;

  return (
    <View
      style={{
        width: "100%",
      }}
    >
      <View
        onLayout={onLayout}
        style={{
          width: "100%",
          height: CHART_HEIGHT,
        }}
      >
        {width > 0 && (
          <Canvas
            style={{
              width,
              height: CHART_HEIGHT,
            }}
          >
            {[0, 25, 50, 75, 100].map(
              (tick) => (
                <Line
                  key={tick}
                  p1={vec(
                    chartPlot.left,
                    yFor(tick),
                  )}
                  p2={vec(
                    chartPlot.left +
                      plotWidth,
                    yFor(tick),
                  )}
                  color={
                    CHART_COLORS.grid
                  }
                  strokeWidth={1}
                />
              ),
            )}

            {/* 20% safety floor */}
            <Line
              p1={vec(
                chartPlot.left,
                dashedY,
              )}
              p2={vec(
                chartPlot.left +
                  plotWidth,
                dashedY,
              )}
              color={
                CHART_COLORS.red
              }
              style="stroke"
              strokeWidth={1.5}
            >
              <DashPathEffect
                intervals={[4, 4]}
              />
            </Line>

            {/* Gradient area fill */}
            <Path
              path={fill}
              style="fill"
              opacity={0.32}
            >
              <LinearGradient
                start={vec(
                  0,
                  chartPlot.top,
                )}
                end={vec(
                  0,
                  chartPlot.top +
                    plotHeight,
                )}
                colors={[
                  CHART_COLORS.green,
                  CHART_COLORS.red,
                ]}
                positions={[0, 1]}
              />
            </Path>

            {/* Animated draw-in line */}
            <Path
              path={stroke}
              style="stroke"
              color={
                CHART_COLORS.green
              }
              strokeWidth={2.5}
              strokeJoin="round"
              strokeCap="round"
              start={0}
              end={end}
            />
          </Canvas>
        )}
      </View>

      <AxisLabels
        width={width}
        left={chartPlot.left}
        right={chartPlot.right}
        labels={sampled.map(
          (point) =>
            point.label ?? "",
        )}
      />
    </View>
  );
}