import React, {
  useCallback,
  useState,
} from "react";
import {
  ActivityIndicator,
  LayoutChangeEvent,
  StyleSheet,
  View,
} from "react-native";
import AppText from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";

export const CHART_EMPTY_HEIGHT = 120;

/* ============================================================
   X-AXIS LABELS
   ============================================================ */

export interface AxisLabelsProps {
  width: number;
  left: number;
  right: number;
  labels: string[];
}

export function AxisLabels({
  width,
  left,
  right,
  labels,
}: AxisLabelsProps) {
  if (labels.length === 0) {
    return null;
  }

  const plotWidth =
    width - left - right;

  const firstIndex = 0;

  const lastIndex =
    labels.length - 1;

  const middleIndex =
    Math.floor(
      lastIndex / 2,
    );

  const positions = [
    {
      label: labels[firstIndex],
      x: left,
      textAlign:
        "left" as const,
    },
    {
      label: labels[middleIndex],
      x: left + plotWidth / 2,
      textAlign:
        "center" as const,
    },
    {
      label: labels[lastIndex],
      x: left + plotWidth,
      textAlign:
        "right" as const,
    },
  ];

  return (
    <View
      style={{
        width,
        height: 20,
        marginTop: 4,
      }}
    >
      {positions.map(
        ({ label, x, textAlign }) => (
          <AppText
            key={`${label}-${x}`}
            variant="caption"
            style={[
              styles.axisLabel,
              {
                left: x,
                textAlign,
              },
            ]}
          >
            {label}
          </AppText>
        ),
      )}
    </View>
  );
}

/* ============================================================
   LEGEND
   ============================================================ */

export interface LegendItem {
  color: string;
  label: string;
}

export function ChartLegend({
  items,
}: {
  items: LegendItem[];
}) {
  return (
    <View
      style={
        styles.legendRow
      }
    >
      {items.map((item) => (
        <View
          key={item.label}
          style={
            styles.legendItem
          }
        >
          <View
            style={[
              styles.legendDot,
              {
                backgroundColor:
                  item.color,
              },
            ]}
          />

          <AppText
            variant="caption"
            style={
              styles.legendText
            }
          >
            {item.label}
          </AppText>
        </View>
      ))}
    </View>
  );
}

/* ============================================================
   EMPTY STATE
   ============================================================ */

export function ChartEmpty({
  message = "No data available for the selected range.",
}: {
  message?: string;
}) {
  return (
    <View
      style={
        styles.emptyContainer
      }
    >
      <AppText
        variant="caption"
        style={
          styles.emptyText
        }
      >
        {message}
      </AppText>
    </View>
  );
}

/* ============================================================
   LAZY LOADING PLACEHOLDER
   Rendered inside a card while its chart data loads.
   ============================================================ */

export function ChartAreaFallback({
  label = "Loading chart...",
}: {
  label?: string;
}) {
  return (
    <View
      style={
        styles.emptyContainer
      }
    >
      <ActivityIndicator
        size="small"
        color={Colors.light.primary}
      />

      <AppText
        variant="caption"
        style={[
          styles.emptyText,
          styles.fallbackLabel,
        ]}
      >
        {label}
      </AppText>
    </View>
  );
}

/* ============================================================
   STYLES
   ============================================================ */

const styles =
  StyleSheet.create({
    axisLabel: {
      position: "absolute",
      top: 0,
      color:
        Colors.light.textSecondary,
      fontSize: 11,
      fontWeight: "600",
    },

    legendRow: {
      width: "100%",
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 12,
      marginTop: 8,
    },

    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },

    legendDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },

    legendText: {
      color:
        Colors.light.textSecondary,
      fontSize: 12,
      fontWeight: "600",
    },

    emptyContainer: {
      width: "100%",
      height: CHART_EMPTY_HEIGHT,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "rgba(0, 0, 0, 0.03)",
      borderRadius: 12,
    },

    emptyText: {
      color:
        Colors.light.textSecondary,
      textAlign: "center",
      paddingHorizontal: 12,
    },

    fallbackLabel: {
      marginTop: 8,
    },
  });

/* ============================================================
   LAYOUT HOOK
   ============================================================ */

export function useChartWidth() {
  const [width, setWidth] =
    useState(0);

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      setWidth(
        event.nativeEvent.layout
          .width,
      );
    },
    [],
  );

  return {
    width,
    onLayout,
  };
}