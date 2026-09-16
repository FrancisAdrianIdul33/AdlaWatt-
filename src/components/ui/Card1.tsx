import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";

export type SolarStatus = "Low" | "Moderate" | "High";

export interface Card1Props {
  solarStatus?: SolarStatus;
  solarTimer?: string;
  solarInput?: number | string;
  solarVoltage?: number | string;
  solarCurrent?: number | string;
  totalEnergy?: number | string;
  loading?: boolean;
}

interface MetricCellProps {
  label: string;
  value: string;
  badge?: string;
  badgeStyle?: object;
  badgeTextStyle?: object;
}

export default function Card1({
  solarStatus = "Low",
  solarTimer = "00:00:00",
  solarInput = 0,
  solarVoltage = 0,
  solarCurrent = 0,
  totalEnergy = 0,
  loading = false,
}: Card1Props) {
  const displayValue = (
    value: number | string,
    unit: string,
  ) => (loading ? "—" : `${value}${unit}`);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons
            name="sunny-outline"
            size={36}
            color="#FACC15"
          />
          <AppText
            variant="heading"
            style={styles.headerTitle}
          >
            Solar Monitoring
          </AppText>
        </View>

        <View style={styles.timer}>
          <AppText
            variant="caption"
            style={styles.timerLabel}
          >
            Timer
          </AppText>
          <AppText
            variant="heading"
            style={styles.timerValue}
          >
            {loading ? "—" : solarTimer}
          </AppText>
        </View>
      </View>

      <View style={styles.grid}>
        <View style={styles.row}>
          <MetricCell
            label="Solar Input"
            value={displayValue(solarInput, "W")}
            badge={solarStatus}
            badgeStyle={getSolarBadgeStyle(solarStatus)}
            badgeTextStyle={getSolarBadgeTextStyle(solarStatus)}
          />
          <MetricCell
            label="Voltage"
            value={displayValue(solarVoltage, "V")}
          />
        </View>

        <View style={styles.row}>
          <MetricCell
            label="Current"
            value={displayValue(solarCurrent, "A")}
          />
          <MetricCell
            label="Total Energy"
            value={displayValue(totalEnergy, "Wh")}
          />
        </View>
      </View>
    </View>
  );
}

function MetricCell({
  label,
  value,
  badge,
  badgeStyle,
  badgeTextStyle,
}: MetricCellProps) {
  return (
    <View style={styles.metricCell}>
      <AppText
        variant="caption"
        style={styles.metricLabel}
      >
        {label}
      </AppText>

      <AppText
        variant="heading"
        style={styles.metricValue}
      >
        {value}
      </AppText>

      <View style={styles.statusSlot}>
        {badge && (
          <View
            style={[
              styles.statusBadge,
              badgeStyle,
            ]}
          >
            <AppText
              variant="caption"
              style={[
                styles.statusBadgeText,
                badgeTextStyle,
              ]}
            >
              {badge}
            </AppText>
          </View>
        )}
      </View>
    </View>
  );
}

function getSolarBadgeStyle(status: SolarStatus) {
  switch (status) {
    case "High":
      return styles.highBadge;
    case "Moderate":
      return styles.moderateBadge;
    case "Low":
    default:
      return styles.lowBadge;
  }
}

function getSolarBadgeTextStyle(status: SolarStatus) {
  return status === "Moderate"
    ? styles.darkBadgeText
    : styles.lightBadgeText;
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    minHeight: 300,
    backgroundColor: Colors.glass.white,
    borderWidth: 3,
    borderColor: Colors.light.primary,
    borderRadius: 15,
    overflow: "hidden",
  },

  header: {
    width: "100%",
    minHeight: 30,
    backgroundColor: Colors.light.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  headerLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 10,
    flexShrink: 1,
  },

  timer: {
    alignItems: "flex-end",
    justifyContent: "center",
    minWidth: 92,
  },

  timerLabel: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 16,
  },

  timerValue: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "600",
    lineHeight: 23,
    textAlign: "right",
  },

  grid: {
    width: "100%",
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },

  row: {
    width: "100%",
    flex: 1,
    flexDirection: "row",
    alignItems: "stretch",
  },

  metricCell: {
    width: "50%",
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    paddingVertical: 8,
  },

  metricLabel: {
    color: "#000000",
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 21,
    flexShrink: 1,
  },

  metricValue: {
    color: "#000000",
    fontSize: 25,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 3,
    lineHeight: 30,
    flexShrink: 1,
  },

  statusSlot: {
    minHeight: 25,
    marginTop: 6,
    alignItems: "center",
    justifyContent: "flex-start",
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
    minWidth: 42,
    height: 25,
    alignItems: "center",
    justifyContent: "center",
  },

  statusBadgeText: {
    fontSize: 9,
    fontWeight: "600",
    textAlign: "center",
  },

  highBadge: {
    backgroundColor: Colors.light.primary,
  },

  moderateBadge: {
    backgroundColor: Colors.light.secondary,
  },

  lowBadge: {
    backgroundColor: Colors.light.error,
  },

  lightBadgeText: {
    color: "#FFFFFF",
  },

  darkBadgeText: {
    color: "#000000",
  },
});
