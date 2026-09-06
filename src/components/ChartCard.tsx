import { Ionicons } from "@expo/vector-icons";

import React, {
  useEffect,
  useState,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Svg, {
  Circle,
} from "react-native-svg";

import AppText from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";
import { supabase } from "@/lib/supabase";

// ============================================================
// TYPES
// ============================================================

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

type NonBatteryChartType =
  Exclude<ChartType, "battery">;

// ============================================================
// MONITORING DATA
// ============================================================

interface MonitoringData {
  battery_level: number;
  battery_status: BatteryStatus;
  time_remaining: string;

  solar_input: number;
  solar_status: SolarStatus;

  current_load: number;

  device_status: DeviceStatus;

  battery_temperature: number;
  battery_temperature_status:
    TemperatureStatus;

  dod_status: DoDStatus;

  solar_temp: number;
  solar_temperature_status:
    TemperatureStatus;
}

// ============================================================
// CARD DATA
// ============================================================

interface CardData {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  badge?: string;
  badgeStyle?: object;
  badgeTextStyle?: object;
}

// ============================================================
// PROPS
// ============================================================

interface ChartCardProps {
  type: ChartType;
}

// ============================================================
// BATTERY GAUGE CONFIGURATION
// ============================================================

const RING_SIZE = 150;
const RADIUS = 60;
const STROKE = 11;

const CENTER =
  RING_SIZE / 2;

const CIRCUMFERENCE =
  2 * Math.PI * RADIUS;

const LOW_BATTERY_THRESHOLD = 20;

// ============================================================
// COMPONENT
// ============================================================

export default function ChartCard({
  type,
}: ChartCardProps) {

  const [
    monitoring,
    setMonitoring,
  ] = useState<
    MonitoringData | null
  >(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  // ==========================================================
  // LOAD MONITORING DATA + REALTIME
  // ==========================================================

  useEffect(() => {

    let mounted = true;

    const loadMonitoring =
      async () => {

        try {

          // ----------------------------------------------------
          // GET CURRENT USER
          // ----------------------------------------------------

          const {
            data: { user },
            error: userError,
          } =
            await supabase.auth.getUser();

          if (!mounted) {
            return;
          }

          if (userError) {

            console.error(
              "Error getting user:",
              userError.message,
            );

            setMonitoring(null);
            return;
          }

          if (!user) {

            setMonitoring(null);

            return;
          }

          // ----------------------------------------------------
          // GET INITIAL MONITORING DATA
          // ----------------------------------------------------

          const {
            data,
            error,
          } = await supabase
            .from("monitoring")
            .select(`
              battery_level,
              battery_status,
              time_remaining,
              solar_input,
              solar_status,
              current_load,
              device_status,
              battery_temperature,
              battery_temperature_status,
              dod_status,
              solar_temp,
              solar_temperature_status
            `)
            .eq(
              "user_id",
              user.id,
            )
            .maybeSingle();

          if (!mounted) {
            return;
          }

          if (error) {

            console.error(
              "Error loading monitoring data:",
              error.message,
            );

            setMonitoring(null);

            return;
          }

          setMonitoring(
            data as MonitoringData | null,
          );

          // ----------------------------------------------------
          // SUPABASE REALTIME
          // ----------------------------------------------------
          //
          // Listen for changes to this user's
          // monitoring row.
          //
          // "*" allows the component to respond to:
          //
          // INSERT
          // UPDATE
          //
          // UPDATE is the expected event for the
          // current ESP32 implementation.
          //
          // ----------------------------------------------------

          const channel =
            supabase
              .channel(
                `monitoring-${user.id}-${Date.now()}`,
              )
              .on(
                "postgres_changes",
                {
                  event: "*",
                  schema: "public",
                  table: "monitoring",
                  filter:
                    `user_id=eq.${user.id}`,
                },
                (payload) => {

                  if (!mounted) {
                    return;
                  }

                  if (
                    payload.eventType ===
                    "DELETE"
                  ) {

                    setMonitoring(null);

                    return;
                  }

                  setMonitoring(
                    payload.new as MonitoringData,
                  );
                },
              )
              .subscribe(
                (status) => {

                  if (
                    status ===
                    "CHANNEL_ERROR"
                  ) {

                    console.error(
                      "Monitoring Realtime channel error.",
                    );

                  }

                  if (
                    status ===
                    "TIMED_OUT"
                  ) {

                    console.error(
                      "Monitoring Realtime connection timed out.",
                    );

                  }

                },
              );

          // ----------------------------------------------------
          // CLEANUP CHANNEL
          // ----------------------------------------------------

          return () => {

            supabase.removeChannel(
              channel,
            );

          };

        } catch (error) {

          console.error(
            "Unexpected monitoring error:",
            error,
          );

          if (mounted) {

            setMonitoring(null);

          }

        } finally {

          if (mounted) {

            setLoading(false);

          }

        }

      };

    let cleanupChannel:
      | (() => void)
      | undefined;

    loadMonitoring()
      .then((cleanup) => {

        cleanupChannel = cleanup;

      });

    // ==========================================================
    // CLEANUP
    // ==========================================================

    return () => {

      mounted = false;

      if (cleanupChannel) {

        cleanupChannel();

      }

    };

  }, []);

  // ==========================================================
  // BATTERY CARD
  // ==========================================================

  if (type === "battery") {

    const level =
      monitoring?.battery_level ?? 0;

    const progress =
      Math.max(
        0,
        Math.min(100, level),
      ) / 100;

    const isLowBattery =
      level <=
      LOW_BATTERY_THRESHOLD;

    const batteryColor =
      isLowBattery
        ? "#EF4444"
        : Colors.light.primary;

    const dashOffset =
      CIRCUMFERENCE *
      (1 - progress);

    const batteryTransform =
      `translate(${RING_SIZE} 0) ` +
      `scale(-1 1) ` +
      `rotate(-90 ${CENTER} ${CENTER})`;

    return (

      <View
        style={styles.batterySection}
      >

        <View
          style={styles.batteryCircle}
        >

          <Svg
            width={RING_SIZE}
            height={RING_SIZE}
            viewBox={
              `0 0 ${RING_SIZE} ${RING_SIZE}`
            }
          >

            {/* Background Ring */}

            <Circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              stroke="#D8D6CC"
              strokeWidth={STROKE}
              fill="none"
            />

            {/* Battery Progress */}

            <Circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              stroke={batteryColor}
              strokeWidth={STROKE}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={
                `${CIRCUMFERENCE} ${CIRCUMFERENCE}`
              }
              strokeDashoffset={
                dashOffset
              }
              transform={
                batteryTransform
              }
            />

          </Svg>

          {/* Battery Center */}

          <View
            style={
              styles.batteryCenter
            }
          >

            <AppText
              variant="heading"
              style={[
                styles.batteryPercentage,
                isLowBattery &&
                  styles.lowBatteryText,
              ]}
            >

              {loading
                ? "—"
                : `${level}%`}

            </AppText>

            <AppText
              variant="caption"
              style={
                styles.batteryLabel
              }
            >

              Battery

            </AppText>

            <View
              style={
                styles.batteryStatus
              }
            >

              <AppText
                variant="caption"
                style={
                  styles.batteryStatusText
                }
              >

                {
                  monitoring
                    ?.battery_status ??
                  "Idle"
                }

              </AppText>

            </View>

          </View>

        </View>

        <AppText
          variant="caption"
          style={
            styles.remainingText
          }
        >

          Time Remaining:{" "}

          {loading
            ? "—"
            : monitoring
                ?.time_remaining ??
              "—"}

        </AppText>

      </View>

    );

  }

  // ==========================================================
  // OTHER MONITORING CARDS
  // ==========================================================

  const data =
    getCardData(
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

    <View
      style={styles.monitorCard}
    >

      <Ionicons
        name={data.icon}
        size={23}
        color={
          isOffline
            ? Colors.light.error
            : Colors.light.primary
        }
        style={styles.icon}
      />

      <AppText
        variant="caption"
        style={
          styles.monitorLabel
        }
      >

        {data.label}

      </AppText>

      {data.value !==
        undefined && (

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

      {/* Status Badge */}

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

// ============================================================
// CARD DATA
// ============================================================

function getCardData(
  type: NonBatteryChartType,
  monitoring:
    | MonitoringData
    | null,
  loading: boolean,
): CardData {

  switch (type) {

    // ========================================================
    // SOLAR INPUT
    // ========================================================

    case "solar": {

      const solarStatus =
        monitoring?.solar_status ??
        "Low";

      return {

        icon:
          "sunny-outline",

        label:
          "Solar Input",

        value:
          loading
            ? "—"
            : `${monitoring?.solar_input ?? 0}W`,

        badge:
          solarStatus,

        badgeStyle:
          solarStatus === "High"
            ? styles.normalBadge
            : solarStatus ===
                "Moderate"
              ? styles.moderateBadge
              : styles.lowBadge,

        badgeTextStyle:
          solarStatus ===
          "Moderate"
            ? styles.darkBadgeText
            : styles.lightBadgeText,

      };

    }

    // ========================================================
    // CURRENT LOAD
    // ========================================================

    case "load":

      return {

        icon:
          "flash-outline",

        label:
          "Load Now",

        value:
          loading
            ? "—"
            : `${monitoring?.current_load ?? 0}W`,

      };

    // ========================================================
    // DEVICE STATUS
    // ========================================================

    case "device":

      return {

        icon:
          "hardware-chip-outline",

        label:
          "Device",

        value:
          monitoring?.device_status ??
          "Offline",

      };

    // ========================================================
    // DEPTH OF DISCHARGE
    // ========================================================

    case "dod":

      return {

        icon:
          "shield-checkmark-outline",

        label:
          "DoD Status",

        value:
          monitoring?.dod_status ??
          "Safe",

      };

    // ========================================================
    // BATTERY TEMPERATURE
    // ========================================================

    case "temperature": {

      const status =
        monitoring
          ?.battery_temperature_status ??
        "Normal";

      return {

        icon:
          "thermometer-outline",

        label:
          "Battery Temp",

        value:
          loading
            ? "—"
            : `${monitoring
                ?.battery_temperature ??
              0}°C`,

        badge:
          status,

        badgeStyle:
          getTemperatureBadgeStyle(
            status,
          ),

        badgeTextStyle:
          status === "Moderate"
            ? styles.darkBadgeText
            : styles.lightBadgeText,

      };

    }

    // ========================================================
    // SOLAR PANEL TEMPERATURE
    // ========================================================

    case "solar_temperature": {

      const status =
        monitoring
          ?.solar_temperature_status ??
        "Normal";

      return {

        icon:
          "thermometer-outline",

        label:
          "Solar Panel Temp",

        value:
          loading
            ? "—"
            : `${monitoring
                ?.solar_temp ??
              0}°C`,

        badge:
          status,

        badgeStyle:
          getTemperatureBadgeStyle(
            status,
          ),

        badgeTextStyle:
          status === "Moderate"
            ? styles.darkBadgeText
            : styles.lightBadgeText,

      };

    }

  }

}

// ============================================================
// TEMPERATURE BADGE STYLE
// ============================================================

function getTemperatureBadgeStyle(
  status: TemperatureStatus,
) {

  switch (status) {

    case "Normal":

      return styles.normalBadge;

    case "Moderate":

      return styles.moderateBadge;

    case "Alarming":

      return styles.alarmingBadge;

  }

}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({

  // ==========================================================
  // BATTERY
  // ==========================================================

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

  lowBatteryText: {

    color: Colors.light.error,

  },

  batteryLabel: {

    color:
      Colors.light.textSecondary,

    fontWeight: "600",

    marginTop: 1,

  },

  batteryStatus: {

    backgroundColor:
      Colors.light.primary,

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

    color:
      Colors.light.textSecondary,

    marginTop: 6,

  },

  // ==========================================================
  // MONITORING CARDS
  // ==========================================================

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

    color:
      Colors.light.error,

  },

  safeValue: {

    color:
      Colors.light.primary,

  },

  unsafeValue: {

    color:
      Colors.light.error,

  },

  // ==========================================================
  // STATUS BADGES
  // ==========================================================

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

  lowBadge: {

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