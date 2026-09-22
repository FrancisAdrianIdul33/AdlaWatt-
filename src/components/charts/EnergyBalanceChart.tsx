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
  Group,
  RoundedRect,
} from "@shopify/react-native-skia";
import {
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import AppText from "@/components/ui/AppText";
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
} from "@/components/charts/chartMath";

interface Bar {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

/* ============================================================
   ENERGY IN VS ENERGY OUT (GROUPED BARS)
   ============================================================ */

export default function EnergyBalanceChart({
  input,
  output,
}: {
  input: ChartPoint[];
  output: ChartPoint[];
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
  }, [input, output, width, progress]);

  const opacity = useDerivedValue(
    () => progress.value,
  );

  const totalInput = useMemo(
    () =>
      input.reduce(
        (sum, point) =>
          sum + point.value,
        0,
      ),
    [input],
  );

  const totalOutput = useMemo(
    () =>
      output.reduce(
        (sum, point) =>
          sum + point.value,
        0,
      ),
    [output],
  );

  const net =
    totalInput - totalOutput;

  const bars = useMemo(() => {
    const count = Math.max(
      input.length,
      output.length,
    );

    if (width <= 0 || count < 1) {
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

    const sampledInput =
      decimate(input);

    const sampledOutput =
      decimate(output);

    const maximum =
      Math.max(
        ...sampledInput.map(
          (point) => point.value,
        ),
        ...sampledOutput.map(
          (point) => point.value,
        ),
        1,
      ) * 1.1;

    const baselineY =
      chartPlot.top +
      plotHeight;

    const slotWidth =
      plotWidth / count;

    const barWidth = Math.min(
      22,
      Math.max(4, slotWidth * 0.3),
    );

    const result: Bar[] = [];

    const pairAt = (
      series: ChartPoint[],
      index: number,
    ): number => {
      if (series.length === 1) {
        return series[0].value;
      }

      if (count === 1) {
        return series[0].value;
      }

      const position =
        (index / (count - 1)) *
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

      return (
        series[lower].value *
          (1 - fraction) +
        series[upper].value *
          fraction
      );
    };

    for (
      let index = 0;
      index < count;
      index += 1
    ) {
      const centerX =
        chartPlot.left +
        ((index + 0.5) / count) *
          plotWidth;

      const inputValue = Math.max(
        0,
        pairAt(sampledInput, index),
      );

      const outputValue = Math.max(
        0,
        pairAt(sampledOutput, index),
      );

      const inputHeight =
        (inputValue / maximum) *
        plotHeight;

      const outputHeight =
        (outputValue / maximum) *
        plotHeight;

      result.push(
        {
          x:
            centerX -
            barWidth -
            1,
          y:
            baselineY -
            inputHeight,
          width: barWidth,
          height:
            Math.max(
              2,
              inputHeight,
            ),
          color:
            CHART_COLORS.green,
        },
        {
          x: centerX + 1,
          y:
            baselineY -
            outputHeight,
          width: barWidth,
          height:
            Math.max(
              2,
              outputHeight,
            ),
          color:
            CHART_COLORS.red,
        },
      );
    }

    return {
      bars: result,
      sampledInput,
    };
  }, [input, output, width]);

  if (
    Math.max(input.length, output.length) <
    1
  ) {
    return (
      <ChartEmpty message="Not enough energy history for this range." />
    );
  }

  if (!bars) {
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

  const { sampledInput } = bars;

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
        <View
          style={
            styles.summaryChip
          }
        >
          <AppText
            variant="caption"
            style={{
              ...styles.summaryLabel,
              color:
                CHART_COLORS.green,
            }}
          >
            In {(totalInput / 1000).toFixed(1)} kWh
          </AppText>
        </View>

        <View
          style={
            styles.summaryChip
          }
        >
          <AppText
            variant="caption"
            style={{
              ...styles.summaryLabel,
              color: CHART_COLORS.red,
            }}
          >
            Out {(totalOutput / 1000).toFixed(1)} kWh
          </AppText>
        </View>

        <View
          style={
            styles.summaryChip
          }
        >
          <AppText
            variant="caption"
            style={{
              ...styles.summaryLabel,
              color:
                net >= 0
                  ? CHART_COLORS.green
                  : CHART_COLORS.red,
              fontWeight: "800",
            }}
          >
            Net {(net / 1000).toFixed(1)} kWh
          </AppText>
        </View>
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
              {bars.bars.map(
                (bar, index) => (
                  <RoundedRect
                    key={index}
                    x={bar.x}
                    y={bar.y}
                    width={bar.width}
                    height={bar.height}
                    r={2}
                    color={bar.color}
                  />
                ),
              )}
            </Group>
          </Canvas>
        )}
      </View>

      <AxisLabels
        width={width}
        left={chartPlot.left}
        right={chartPlot.right}
        labels={sampledInput.map(
          (point) =>
            point.label ?? "",
        )}
      />

      <ChartLegend
        items={[
          {
            color:
              CHART_COLORS.green,
            label: "Energy in",
          },
          {
            color:
              CHART_COLORS.red,
            label: "Energy out",
          },
        ]}
      />
    </View>
  );
}

const styles =
  StyleSheet.create({
    summaryRow: {
      width: "100%",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 10,
    },

    summaryChip: {
      backgroundColor:
        "rgba(0, 0, 0, 0.05)",
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },

    summaryLabel: {
      fontSize: 12,
      fontWeight: "700",
    },
  });