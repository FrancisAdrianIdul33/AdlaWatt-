import React, {
  useEffect,
  useMemo,
} from "react";
import {
  View,
} from "react-native";
import {
  Canvas,
  Path,
  Skia,
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
  ChartEmpty,
  ChartLegend,
  useChartWidth,
} from "@/components/charts/ChartBits";
import {
  CHART_COLORS,
  chartPlot,
  CHART_HEIGHT,
  decimate,
  smoothPath,
} from "@/components/charts/chartMath";

interface FillRun {
  color: string;
  path: ReturnType<typeof Skia.Path.Make>;
}

/* ============================================================
   SOLAR INPUT VS LOAD CONSUMPTION
   ============================================================ */

export default function SolarLoadChart({
  solar,
  load,
}: {
  solar: ChartPoint[];
  load: ChartPoint[];
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
  }, [solar, load, width, progress]);

  const end = useDerivedValue(
    () => progress.value,
  );

  const geometry = useMemo(() => {
    const count =
      Math.max(
        solar.length,
        load.length,
      );

    if (width <= 0 || count < 2) {
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

    const sampledSolar =
      decimate(solar);

    const sampledLoad =
      decimate(load);

    const maximum =
      Math.max(
        ...sampledSolar.map(
          (point) => point.value,
        ),
        ...sampledLoad.map(
          (point) => point.value,
        ),
        1,
      ) * 1.05;

    const xOf = (
      index: number,
      length: number,
    ) =>
      chartPlot.left +
      (index / (length - 1)) *
        plotWidth;

    const yOf = (value: number) =>
      chartPlot.top +
      (1 - value / maximum) *
        plotHeight;

    const solarPoints =
      sampledSolar.map(
        (point, index) => ({
          x: xOf(
            index,
            sampledSolar.length,
          ),
          y: yOf(point.value),
          value: point.value,
        }),
      );

    const loadPoints =
      sampledLoad.map(
        (point, index) => ({
          x: xOf(
            index,
            sampledLoad.length,
          ),
          y: yOf(point.value),
          value: point.value,
        }),
      );

    const fillRuns =
      buildFillRuns(
        solarPoints,
        loadPoints,
      );

    return {
      solarLine: smoothPath(
        solarPoints,
      ),
      loadLine: smoothPath(
        loadPoints,
      ),
      fillRuns,
      plotWidth,
      plotHeight,
      sampledSolar,
      sampledLoad,
    };
  }, [solar, load, width]);

  if (
    Math.max(solar.length, load.length) <
    2
  ) {
    return (
      <ChartEmpty message="Not enough solar and load history for this range." />
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
    solarLine,
    loadLine,
    fillRuns,
    sampledSolar,
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
            {fillRuns.map(
              (run, index) => (
                <Path
                  key={index}
                  path={run.path}
                  style="fill"
                  color={run.color}
                  opacity={0.22}
                />
              ),
            )}

            <Path
              path={solarLine}
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

            <Path
              path={loadLine}
              style="stroke"
              color={
                CHART_COLORS.red
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
        labels={sampledSolar.map(
          (point) =>
            point.label ?? "",
        )}
      />

      <ChartLegend
        items={[
          {
            color:
              CHART_COLORS.green,
            label: "Solar input",
          },
          {
            color:
              CHART_COLORS.red,
            label: "Load consumption",
          },
        ]}
      />
    </View>
  );
}

/* ============================================================
   FILL-BETWEEN RUNS (GREEN SURPLUS / RED DEFICIT)
   ============================================================ */

interface SampledPoint {
  x: number;
  y: number;
  value: number;
}

function pointAt(
  series: SampledPoint[],
  segmentCount: number,
  index: number,
): SampledPoint {
  if (series.length === 1) {
    return series[0];
  }

  if (segmentCount === 1) {
    return series[0];
  }

  const position =
    (index / (segmentCount - 1)) *
    (series.length - 1);

  const lower =
    Math.floor(position);

  const upper =
    Math.min(
      series.length - 1,
      lower + 1,
    );

  const fraction =
    position - lower;

  const lowerPoint =
    series[lower];

  const upperPoint =
    series[upper];

  return {
    x:
      lowerPoint.x +
      (upperPoint.x - lowerPoint.x) *
        fraction,
    y:
      lowerPoint.y +
      (upperPoint.y - lowerPoint.y) *
        fraction,
    value:
      lowerPoint.value +
      (upperPoint.value -
        lowerPoint.value) *
        fraction,
  };
}

function buildFillRuns(
  solar: SampledPoint[],
  load: SampledPoint[],
): FillRun[] {
  const fills: FillRun[] = [];

  const segmentCount =
    Math.max(
      solar.length,
      load.length,
    );

  let index = 0;

  while (index < segmentCount - 1) {
    const startSolar = pointAt(
      solar,
      segmentCount,
      index,
    );

    const startLoad = pointAt(
      load,
      segmentCount,
      index,
    );

    const surplus =
      startSolar.value >=
      startLoad.value;

    let end = index;

    while (
      end < segmentCount - 1
    ) {
      const atSolar = pointAt(
        solar,
        segmentCount,
        end,
      );

      const atLoad = pointAt(
        load,
        segmentCount,
        end,
      );

      if (
        (atSolar.value >=
          atLoad.value) !==
        surplus
      ) {
        break;
      }

      end += 1;
    }

    const path =
      Skia.Path.Make();

    const firstSolar = pointAt(
      solar,
      segmentCount,
      index,
    );

    path.moveTo(
      firstSolar.x,
      firstSolar.y,
    );

    for (
      let step = index;
      step <= end;
      step += 1
    ) {
      const current =
        pointAt(
          solar,
          segmentCount,
          step,
        );

      path.lineTo(
        current.x,
        current.y,
      );
    }

    const lastLoad = pointAt(
      load,
      segmentCount,
      end,
    );

    path.lineTo(
      lastLoad.x,
      lastLoad.y,
    );

    for (
      let step = end;
      step >= index;
      step -= 1
    ) {
      const current =
        pointAt(
          load,
          segmentCount,
          step,
        );

      path.lineTo(
        current.x,
        current.y,
      );
    }

    const anchorLoad = pointAt(
      load,
      segmentCount,
      index,
    );

    path.lineTo(
      anchorLoad.x,
      anchorLoad.y,
    );

    path.close();

    fills.push({
      color: surplus
        ? CHART_COLORS.green
        : CHART_COLORS.red,
      path,
    });

    index = end;
  }

  return fills;
}