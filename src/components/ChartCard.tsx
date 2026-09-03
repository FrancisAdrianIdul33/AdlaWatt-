import { Ionicons } from "@expo/vector-icons";

import React, {
  useEffect,
  useState,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Svg, { Circle } from "react-native-svg";

import AppText from "@/components/ui/AppText";

import { Colors } from "@/constants/colors";

import { supabase } from "@/lib/supabase";

type ChartType =
  | "battery"
  | "solar"
  | "load"
  | "device"
  | "temperature"
  | "solar_temperature"
  | "dod";

type TemperatureStatus =
  | "Normal"
  | "Moderate"
  | "Alarming";

type DeviceStatus =
  | "Online"
  | "Offline";

type BatteryStatus =
  | "Charging"
  | "Discharging"
  | "Idle";

type SolarStatus =
  | "Low"
  | "Moderate"
  | "High";

type DoDStatus =
  | "Safe"
  | "Unsafe";

interface MonitoringData {
  battery_level: number;
  battery_status: BatteryStatus;
  time_remaining: string;

  solar_input: number;
  solar_status: SolarStatus;

  current_load: number;

  device_status: DeviceStatus;

  battery_temperature: number;
  battery_temperature_status: TemperatureStatus;
}

interface ChartCardProps {
  type: ChartType;
}

/*
  Battery Gauge Configuration
*/

const RING_SIZE = 160;

const RADIUS =
  RING_SIZE / 2 - 12;

const STROKE = 12;

const CIRCUMFERENCE =
  2 * Math.PI * RADIUS;

export default function ChartCard({
  type,
}: ChartCardProps) {
  const [monitoring, setMonitoring] =
    useState<MonitoringData | null>(null);

  const [loading, setLoading] =
    useState(true);

  // ============================================
  // LOAD CURRENT USER'S MONITORING DATA
  // ============================================

  useEffect(() => {
    let mounted = true;

    const loadMonitoring = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (mounted) {
          setMonitoring(null);
          setLoading(false);
        }

        return;
      }

      const { data, error } =
        await supabase
          .from("monitoring")
          .select(
            `
              battery_level,
              battery_status,
              time_remaining,
              solar_input,
              solar_status,
              current_load,
              device_status,
              battery_temperature,
              battery_temperature_status
            `,
          )
          .eq("user_id", user.id)
          .maybeSingle();

      if (error) {
        console.error(
          "Error loading monitoring data:",
          error.message,
        );

        if (mounted) {
          setMonitoring(null);
          setLoading(false);
        }

        return;
      }

      if (mounted) {
        setMonitoring(
          data as MonitoringData | null,
        );

        setLoading(false);
      }
    };

    loadMonitoring();

    return () => {
      mounted = false;
    };
  }, []);

  // ============================================
  // BATTERY CARD
  // ============================================

  if (type === "battery") {
    const level =
      monitoring?.battery_level ?? 0;

    const clamped =
      Math.max(
        0,
        Math.min(100, level),
      );

    const progress =
      clamped / 100;

    const offset =
      CIRCUMFERENCE -
      progress * CIRCUMFERENCE;

    const center =
      RING_SIZE / 2;

    return (
      <View style={styles.batterySection}>
        <View
          style={styles.batteryCircle}
        >
          <Svg
            width={RING_SIZE}
            height={RING_SIZE}
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
          >
            {/* Background Track */}
            <Circle
              cx={center}
              cy={center}
              r={RADIUS}
              stroke="#D8D6CC"
              strokeWidth={STROKE}
              fill="none"
            />

            {/* Battery Progress */}
            <Circle
              cx={center}
              cy={center}
              r={RADIUS}
              stroke={Colors.light.primary}
              strokeWidth={STROKE}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${center} ${center})`}
            />
          </Svg>

          {/* Center Content */}
          <View
            style={styles.batteryCenter}
          >
            <AppText
              variant="heading"
              style={
                styles.batteryPercentage
              }
            >
              {loading
                ? "—"
                : `${Math.round(clamped)}%`}
            </AppText>

            <AppText
              variant="caption"
              style={styles.batteryLabel}
            >
              Battery
            </AppText>

            <View
              style={styles.batteryStatus}
            >
              <AppText
                variant="caption"
                style={
                  styles.batteryStatusText
                }
              >
                {monitoring
                  ?.battery_status ?? "Idle"}
              </AppText>
            </View>
          </View>
        </View>

        <AppText
          variant="caption"
          style={styles.remainingText}
        >
          Time Remaining:{" "}
          {loading
            ? "—"
            : monitoring?.time_remaining ?? "—"}
        </AppText>
      </View>
    );
  }

  // ============================================
  // OTHER MONITORING CARDS
  // ============================================

  const data = getCardData(
    type,
    monitoring,
    loading,
  );

  const isOffline =
    type === "device" &&
    data.value === "Offline";

  const isSafe =
    type === "dod" &&
    data.value === "Safe";

  const isUnsafe =
    type === "dod" &&
    data.value === "Unsafe";

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

            isOffline &&
              styles.offlineValue,

            isSafe &&
              styles.safeValue,

            isUnsafe &&
              styles.unsafeValue,
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

// ============================================
// CARD DATA
// ============================================

function getCardData(
  type: Exclude<
    ChartType,
    "battery"
  >,
  monitoring: MonitoringData | null,
  loading: boolean,
) {
  switch (type) {
    // ==========================================
    // SOLAR INPUT
    // ==========================================

    case "solar": {
      const solarStatus =
        monitoring?.solar_status ?? "Low";

      return {
        icon:
          "sunny-outline" as keyof typeof Ionicons.glyphMap,

        label: "Solar Input",

        value: loading
          ? "—"
          : `${monitoring?.solar_input ?? 0}W`,

        badge: solarStatus,

        badgeStyle:
          solarStatus === "Moderate"
            ? styles.moderateBadge
            : solarStatus === "High"
              ? styles.normalBadge
              : styles.statusBadge,

        badgeTextStyle:
          solarStatus === "Moderate"
            ? styles.darkBadgeText
            : styles.lightBadgeText,
      };
    }

    // ==========================================
    // CURRENT LOAD
    // ==========================================

    case "load":
      return {
        icon:
          "flash-outline" as keyof typeof Ionicons.glyphMap,

        label: "Load Now",

        value: loading
          ? "—"
          : `${monitoring?.current_load ?? 0}W`,
      };

    // ==========================================
    // DEVICE STATUS
    // ==========================================

    case "device": {
      const deviceStatus =
        monitoring?.device_status ??
        "Offline";

      return {
        icon:
          "hardware-chip-outline" as keyof typeof Ionicons.glyphMap,

        label: "Device",

        value: deviceStatus,
      };
    }

    // ==========================================
    // BATTERY TEMPERATURE
    // ==========================================

    case "temperature": {
      const tempStatus =
        monitoring?.battery_temperature_status ??
        "Normal";

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
        icon:
          "thermometer-outline" as keyof typeof Ionicons.glyphMap,

        label: "Battery Temp",

        value: loading
          ? "—"
          : `${monitoring?.battery_temperature ?? 0}°C`,

        badge: tempStatus,

        badgeStyle,

        badgeTextStyle,
      };
    }

    // ==========================================
    // SOLAR PANEL TEMPERATURE
    //
    // Placeholder for future Supabase data.
    // Default:
    // Temperature = 0°C
    // Status = Moderate
    // ==========================================

    case "solar_temperature": {
      const solarTempStatus =
        "Moderate";

      return {
        icon:
          "thermometer-outline" as keyof typeof Ionicons.glyphMap,

        label: "Solar Panel Temp",

        value: "0°C",

        badge: solarTempStatus,

        badgeStyle:
          styles.moderateBadge,

        badgeTextStyle:
          styles.darkBadgeText,
      };
    }

    // ==========================================
    // DEPTH OF DISCHARGE STATUS
    //
    // Placeholder for future Supabase data.
    // Default = Safe
    // ==========================================

    case "dod": {
      const dodStatus: DoDStatus =
        "Safe";

      return {
        icon:
          "flash-outline" as keyof typeof Ionicons.glyphMap,

        label: "DoD Status",

        value: dodStatus,
      };
    }
  }
}

// ============================================
// STYLES
// ============================================

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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 14,
  },

  batteryPercentage: {
    color: "#000000",
    fontSize: 27,
    fontWeight: "800",
    lineHeight: 30,
  },

  batteryLabel: {
    color: Colors.light.textSecondary,
    fontWeight: "600",
    marginTop: 1,
  },

  batteryStatus: {
    backgroundColor: Colors.light.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
  },

  batteryStatusText: {
    color: "#FFFFFF",
    fontSize: 9,
  },

  remainingText: {
    color: Colors.light.textSecondary,
    marginTop: 6,
  },

  /* Monitoring Cards */

  monitorCard: {
    width: "48%",
    minHeight: 95,

    backgroundColor:
      Colors.glass.white,

    borderWidth: 3,
    borderColor:
      Colors.light.primary,

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

  safeValue: {
    color: Colors.light.primary,
  },

  unsafeValue: {
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
    backgroundColor:
      Colors.light.primary,
  },

  moderateBadge: {
    backgroundColor:
      Colors.light.secondary,
  },

  alarmingBadge: {
    backgroundColor:
      Colors.light.error,
  },

  lightBadgeText: {
    color: "#FFFFFF",
  },

  darkBadgeText: {
    color: "#000000",
  },
});