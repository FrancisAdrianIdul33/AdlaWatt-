import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import AppText from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";

type ChartType =
  | "battery"
  | "solar"
  | "load"
  | "device"
  | "temperature";

type TemperatureStatus =
  | "Normal"
  | "Moderate"
  | "Alarming";

type DeviceStatus = "Online" | "Offline";

interface ChartCardProps {
  type: ChartType;
  value?: number | string;
  status?: string;
  timeRemaining?: string;
}

const RING_SIZE = 150;
const RADIUS = 60;
const STROKE = 11;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ChartCard({
  type,
  value,
  status,
  timeRemaining,
}: ChartCardProps) {
  if (type === "battery") {
    const level =
      typeof value === "number" ? value : 50;

    const progress =
      Math.max(0, Math.min(100, level)) / 100;

    return (
      <View style={styles.batterySection}>
        <View style={styles.batteryCircle}>
          <Svg
            width={RING_SIZE}
            height={RING_SIZE}
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
          >
            {/* Background Ring */}
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke="#D8D6CC"
              strokeWidth={STROKE}
              fill="none"
            />

            {/* Progress Ring */}
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke={Colors.light.primary}
              strokeWidth={STROKE}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
              strokeDashoffset={
                CIRCUMFERENCE * (1 - progress)
              }
            />
          </Svg>

          <View style={styles.batteryCenter}>
            <AppText
              variant="heading"
              style={styles.batteryPercentage}
            >
              {level}%
            </AppText>

            <AppText
              variant="caption"
              style={styles.batteryLabel}
            >
              Battery
            </AppText>

            <View style={styles.batteryStatus}>
              <AppText
                variant="caption"
                style={styles.batteryStatusText}
              >
                {status || "Discharging"}
              </AppText>
            </View>
          </View>
        </View>

        <AppText
          variant="caption"
          style={styles.remainingText}
        >
          Time Remaining: {timeRemaining || "4h 12m"}
        </AppText>
      </View>
    );
  }

  const data = getCardData(type, value, status);

  return (
    <View style={styles.monitorCard}>
      <Ionicons
        name={data.icon}
        size={23}
        color={Colors.light.primary}
        style={styles.icon}
      />

      <AppText
        variant="caption"
        style={styles.monitorLabel}
      >
        {data.label}
      </AppText>

      {data.value !== undefined && (
        <AppText
          variant="heading"
          style={[
            styles.monitorValue,
            type === "device" &&
              data.value === "Offline" &&
              styles.offlineValue,
          ]}
        >
          {data.value}
        </AppText>
      )}

      {data.badge && (
        <View
          style={[
            styles.statusBadge,
            data.badgeStyle,
          ]}
        >
          <AppText
            variant="caption"
            style={[
              styles.statusBadgeText,
              data.badgeTextStyle,
            ]}
          >
            {data.badge}
          </AppText>
        </View>
      )}
    </View>
  );
}

function getCardData(
  type: Exclude<ChartType, "battery">,
  value?: number | string,
  status?: string,
) {
  switch (type) {
    case "solar":
      return {
        icon: "sunny-outline" as keyof typeof Ionicons.glyphMap,
        label: "Solar Input",
        value: value ?? "46W",
        badge: status ?? "Moderate",
        badgeStyle: styles.moderateBadge,
        badgeTextStyle: styles.darkBadgeText,
      };

    case "load":
      return {
        icon: "flash-outline" as keyof typeof Ionicons.glyphMap,
        label: "Load Now",
        value: value ?? "170W",
      };

    case "device": {
      const deviceStatus =
        (status as DeviceStatus) || "Online";

      return {
        icon: "hardware-chip-outline" as keyof typeof Ionicons.glyphMap,
        label: "Device",
        value: deviceStatus,
      };
    }

    case "temperature": {
      const tempStatus =
        (status as TemperatureStatus) || "Normal";

      const badgeStyle =
        tempStatus === "Alarming"
          ? styles.alarmingBadge
          : tempStatus === "Moderate"
            ? styles.moderateBadge
            : styles.normalBadge;

      const badgeTextStyle =
        tempStatus === "Moderate"
          ? styles.darkBadgeText
          : styles.lightBadgeText;

      return {
        icon: "thermometer-outline" as keyof typeof Ionicons.glyphMap,
        label: "Battery Temp",
        value:
          typeof value === "number"
            ? `${value}°C`
            : value ?? "20°C",
        badge: tempStatus,
        badgeStyle,
        badgeTextStyle,
      };
    }
  }
}

const styles = StyleSheet.create({
  /* Battery */
  batterySection: {
    width: "100%",
    alignItems: "center",
    marginBottom: 14,
  },

  batteryCircle: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },

  batteryCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },

  batteryPercentage: {
    color: "#000000",
    fontSize: 26,
    fontWeight: "700",
  },

  batteryLabel: {
    color: "#000000",
    marginTop: -2,
  },

  batteryStatus: {
    backgroundColor: Colors.light.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 3,
  },

  batteryStatusText: {
    color: "#FFFFFF",
    fontSize: 9,
  },

  remainingText: {
    color: Colors.light.textSecondary,
    marginTop: 8,
  },

  /* Monitoring Cards */
  monitorCard: {
    width: "48%",
    minHeight: 95,

    backgroundColor: Colors.glass.white,

    borderWidth: 3,
    borderColor: Colors.light.primary,
    borderRadius: 16,

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 8,
    paddingVertical: 10,
  },

  icon: {
    marginBottom: 3,
  },

  monitorLabel: {
    color: "#000000",
    textAlign: "center",
    fontWeight: "600",
  },

  monitorValue: {
    color: "#000000",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 3,
  },

  offlineValue: {
    color: Colors.light.error,
  },

  /* Status Badges */
  statusBadge: {
    marginTop: 4,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
  },

  statusBadgeText: {
    fontSize: 9,
    fontWeight: "600",
  },

  normalBadge: {
    backgroundColor: Colors.light.primary,
  },

  moderateBadge: {
    backgroundColor: Colors.light.secondary,
  },

  alarmingBadge: {
    backgroundColor: Colors.light.error,
  },

  lightBadgeText: {
    color: "#FFFFFF",
  },

  darkBadgeText: {
    color: "#000000",
  },
});