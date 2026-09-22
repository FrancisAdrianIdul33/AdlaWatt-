import React, {
  useEffect,
  useMemo,
} from "react";
import {
  StyleSheet,
  View,
} from "react-native";
import {
  Canvas,
  Circle,
  DashPathEffect,
  Group,
  Line,
  Rect,
  vec,
} from "@shopify/react-native-skia";
import {
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import AppText from "@/components/ui/AppText";
import {
  ChartPoint,
  getDoDStatus,
} from "@/services/analyticsService";
import {
  ChartEmpty,
  ChartLegend,
  useChartWidth,
} from "@/components/charts/ChartBits";
import {
  CHART_COLORS,
  chartPlot,
  CHART_HEIGHT,
  decimate,
} from "@/components/charts/chartMath";

const VOLTAGE_MIN = 10.0;

const VOLTAGE_MAX = 12.9;

const SAFE_VOLTAGE_LO = 10.65;

const SAFE_VOLTAGE_HI = 12.6;

const DOT_LANES = 5;

/* ============================================================
   DOD & VOLTAGE DISTRIBUTION
   ============================================================ */

export default function VoltageDoDChart({
  voltage,
  levels,
}: {
  voltage: ChartPoint[];
  levels: number[];
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
        duration: 400,
      },
    );
  }, [voltage, levels, width, progress]);

  const opacity = useDerivedValue(
    () => progress.value,
  );

  const geometry = useMemo(() => {
    if (width <= 0 || voltage.length === 0) {
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

    const xOf = (value: number) =>
      chartPlot.left +
      ((Math.max(
        VOLTAGE_MIN,
        Math.min(
          VOLTAGE_MAX,
          value,
        ),
      ) -
        VOLTAGE_MIN) /
        (VOLTAGE_MAX - VOLTAGE_MIN)) *
        plotWidth;

    const sampled =
      decimate(voltage, 60);

    const dots = sampled.map(
      (point, index) => {
        const lane =
          index % DOT_LANES;

        const y =
          chartPlot.top +
          (index === 0
            ? 0
            : (lane / (DOT_LANES - 1)) *
              plotHeight);

        return {
          x: xOf(point.value),
          y,
          safe:
            getDoDStatus(
              levels[index] ?? 0,
            ) === "Safe",
          inBand:
            point.value >=
              SAFE_VOLTAGE_LO &&
            point.value <=
              SAFE_VOLTAGE_HI,
        };
      },
    );

    const inBandCount =
      dots.filter(
        (dot) => dot.inBand,
      ).length;

    return {
      xOf,
      plotWidth,
      plotHeight,
      dots,
      inBandCount,
    };
  }, [voltage, levels, width]);

  if (voltage.length === 0) {
    return (
      <ChartEmpty message="No voltage history for this range." />
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

  const { xOf, plotHeight, dots, inBandCount } =
    geometry;

  const safeBandPercent = Math.round(
    (inBandCount / Math.max(1, dots.length)) *
      100,
  );

  return (
    <View
      style={{
        width: "100%",
      }}
    >
      {/* Summary */}
      <View
        style={
          styles.summaryRow
        }
      >
        <AppText
          variant="caption"
          style={
            styles.summaryText
          }
        >
          {safeBandPercent}% of readings in the safe
          band (10.65V – 12.6V)
        </AppText>
      </View>

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
            <Group
              opacity={opacity}
            >
              {/* Safe voltage band */}
              <Rect
                x={xOf(
                  SAFE_VOLTAGE_LO,
                )}
                y={chartPlot.top}
                width={
                  xOf(SAFE_VOLTAGE_HI) -
                  xOf(SAFE_VOLTAGE_LO)
                }
                height={plotHeight}
                color="rgba(0, 168, 107, 0.14)"
              />

              {/* Band boundaries */}
              <Line
                p1={vec(
                  xOf(SAFE_VOLTAGE_LO),
                  chartPlot.top,
                )}
                p2={vec(
                  xOf(SAFE_VOLTAGE_LO),
                  chartPlot.top +
                    plotHeight,
                )}
                color="#00A86B"
                style="stroke"
                strokeWidth={1}
              >
                <DashPathEffect
                  intervals={[3, 4]}
                />
              </Line>

              <Line
                p1={vec(
                  xOf(SAFE_VOLTAGE_HI),
                  chartPlot.top,
                )}
                p2={vec(
                  xOf(SAFE_VOLTAGE_HI),
                  chartPlot.top +
                    plotHeight,
                )}
                color="#00A86B"
                style="stroke"
                strokeWidth={1}
              >
                <DashPathEffect
                  intervals={[3, 4]}
                />
              </Line>

              {/* Scatter dots */}
              {dots.map(
                (dot, index) => (
                  <Circle
                    key={index}
                    cx={dot.x}
                    cy={dot.y}
                    r={
                      dot.inBand ? 4.5 : 4
                    }
                    color={
                      dot.safe
                        ? CHART_COLORS.green
                        : CHART_COLORS.red
                    }
                  />
                ),
              )}
            </Group>
          </Canvas>
        )}
      </View>

      {/* Axis labels */}
      <AxisTicks
        width={width}
        ticks={[
          {
            value: VOLTAGE_MIN,
            label: "10.0",
          },
          {
            value: SAFE_VOLTAGE_LO,
            label: "10.65",
          },
          {
            value: SAFE_VOLTAGE_HI,
            label: "12.6",
          },
          {
            value: VOLTAGE_MAX,
            label: "12.9",
          },
        ]}
      />

      <ChartLegend
        items={[
          {
            color:
              CHART_COLORS.green,
            label: "Safe DoD",
          },
          {
            color:
              CHART_COLORS.red,
            label: "Unsafe DoD",
          },
        ]}
      />
    </View>
  );
}

/* ============================================================
   AXIS TICKS
   ============================================================ */

function AxisTicks({
  width,
  ticks,
}: {
  width: number;
  ticks: {
    value: number;
    label: string;
  }[];
}) {
  if (width <= 0) {
    return <View style={{ height: 24 }} />;
  }

  const plotWidth =
    width -
    chartPlot.left -
    chartPlot.right;

  return (
    <View
      style={[
        styles.axisRow,
        { width },
      ]}
    >
      {ticks.map((tick) => {
        const x =
          chartPlot.left +
          ((tick.value - VOLTAGE_MIN) /
            (VOLTAGE_MAX - VOLTAGE_MIN)) *
            plotWidth;

        return (
          <AppText
            key={tick.label}
            variant="caption"
            style={[
              styles.axisLabel,
              {
                left: x,
              },
            ]}
          >
            {tick.label}
          </AppText>
        );
      })}
    </View>
  );
}

/* ============================================================
   STYLES
   ============================================================ */

const styles =
  StyleSheet.create({
    summaryRow: {
      width: "100%",
      marginBottom: 10,
    },

    summaryText: {
      color: "#000000",
      fontSize: 13,
      fontWeight: "600",
    },

    axisRow: {
      height: 20,
      marginTop: 4,
    },

    axisLabel: {
      position: "absolute",
      top: 0,
      transform: [
        {
          translateX: -20,
        },
      ],
      width: 40,
      textAlign: "center",
      color:
        "#000000",
      fontSize: 11,
      fontWeight: "600",
    },
  });