import React, {
  useMemo,
  useState,
} from "react";
import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import {
  Canvas,
  Circle,
  Group,
} from "@shopify/react-native-skia";
import AppText from "@/components/ui/AppText";
import {
  HealthCell,
} from "@/services/analyticsService";
import {
  ChartEmpty,
  ChartLegend,
  useChartWidth,
} from "@/components/charts/ChartBits";
import { CHART_COLORS } from "@/components/charts/chartMath";

/* ============================================================
   TEMPERATURE STATUS COLORS
   ============================================================ */

const STATUS_COLORS: Record<
  string,
  string
> = {
  Nominal: CHART_COLORS.green,
  Elevated: CHART_COLORS.yellow,
  High: CHART_COLORS.orange,
  Critical: CHART_COLORS.red,
};

const STATUS_LABELS: Record<
  string,
  string
> = {
  Nominal: "Nominal",
  Elevated: "Elevated",
  High: "High",
  Critical: "Critical",
};

const CELL_SIZE = 34;

const MAX_ROWS = 8;

/* ============================================================
   BATTERY TEMPERATURE HEALTH HEATMAP
   ============================================================ */

export default function TemperatureHealthChart({
  cells,
}: {
  cells: HealthCell[];
}) {
  const { width, onLayout } =
    useChartWidth();

  const [selected, setSelected] =
    useState<number | null>(
      null,
    );

  const cellsShown = useMemo(
    () => {
      const visible =
        width > 0
          ? cells.slice(-(MAX_ROWS * columnsFor(width)))
          : cells.slice(
              -(
                MAX_ROWS * 7
              ),
            );

      return visible;
    },
    [cells, width],
  );

  if (cells.length === 0) {
    return (
      <ChartEmpty message="No battery temperature history for this range." />
    );
  }

  const columns = columnsFor(
    Math.max(width, 238),
  );

  const rows = Math.max(
    1,
    Math.ceil(
      cellsShown.length / columns,
    ),
  );

  const gridWidth =
    columns * CELL_SIZE;

  const gridHeight =
    rows * CELL_SIZE;

  const selectedCell =
    selected !== null
      ? cellsShown[selected]
      : null;

  return (
    <View
      style={{
        width: "100%",
      }}
    >
      <View
        onLayout={onLayout}
        style={[
          styles.gridContainer,
          {
            height: gridHeight,
          },
        ]}
      >
        {width > 0 && (
          <Canvas
            style={{
              width: gridWidth,
              height: gridHeight,
            }}
          >
            {cellsShown.map(
              (cell, index) => {
                const column =
                  index % columns;

                const row =
                  Math.floor(
                    index / columns,
                  );

                const cx =
                  column * CELL_SIZE +
                  CELL_SIZE / 2;

                const cy =
                  row * CELL_SIZE +
                  CELL_SIZE / 2;

                const isSelected =
                  index ===
                  selected;

                return (
                  <Group
                    key={index}
                  >
                    <Circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 10 : 8}
                      color={
                        STATUS_COLORS[
                          cell.status
                        ] ??
                        CHART_COLORS.green
                      }
                    />
                  </Group>
                );
              },
            )}
          </Canvas>
        )}

        {/* Tap targets */}
        {cellsShown.map(
          (cell, index) => {
            const column =
              index % columns;

            const row =
              Math.floor(
                index / columns,
              );

            return (
              <Pressable
                key={`${cell.date.getTime()}-${index}`}
                onPress={() =>
                  setSelected(
                    index === selected
                      ? null
                      : index,
                  )
                }
                accessibilityRole="button"
                accessibilityLabel={`${cell.date.toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                  },
                )}, ${cell.status}`}
                style={[
                  styles.cellTarget,
                  {
                    left:
                      column * CELL_SIZE,
                    top:
                      row * CELL_SIZE,
                  },
                ]}
              />
            );
          },
        )}
      </View>

      {/* Selected detail */}
      <View
        style={
          styles.detailRow
        }
      >
        {selectedCell ? (
          <>
            <AppText
              variant="caption"
              style={
                styles.detailText
              }
            >
              {selectedCell.date.toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                },
              )}
              {"  ·  "}
              {selectedCell.temperature.toFixed(
                1,
              )}
              °C
            </AppText>

            <AppText
              variant="caption"
              style={[
                styles.statusChip,
                {
                  color:
                    STATUS_COLORS[
                      selectedCell.status
                    ] ?? CHART_COLORS.green,
                  fontWeight: "700",
                },
              ]}
            >
              {STATUS_LABELS[
                selectedCell.status
              ] ?? selectedCell.status}
            </AppText>
          </>
        ) : (
          <AppText
            variant="caption"
            style={
              styles.detailText
            }
          >
            Tap a day for temperature details.
          </AppText>
        )}
      </View>

      <ChartLegend
        items={[
          {
            color:
              CHART_COLORS.green,
            label: "Nominal",
          },
          {
            color:
              CHART_COLORS.yellow,
            label: "Elevated",
          },
          {
            color:
              CHART_COLORS.orange,
            label: "High",
          },
          {
            color:
              CHART_COLORS.red,
            label: "Critical",
          },
        ]}
      />
    </View>
  );
}

function columnsFor(
  width: number,
): number {
  return Math.max(
    4,
    Math.min(
      10,
      Math.floor(
        (width - 12) / CELL_SIZE,
      ),
    ),
  );
}

/* ============================================================
   STYLES
   ============================================================ */

const styles =
  StyleSheet.create({
    gridContainer: {
      width: "100%",
      alignItems: "flex-start",
    },

    cellTarget: {
      position: "absolute",
      width: CELL_SIZE,
      height: CELL_SIZE,
      alignItems: "center",
      justifyContent: "center",
    },

    detailRow: {
      width: "100%",
      minHeight: 24,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 8,
    },

    detailText: {
      color:
        "#000000",
      fontSize: 13,
      fontWeight: "600",
    },

    statusChip: {
      fontSize: 13,
    },
  });