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

// Battery becomes unsafe at
// 20% remaining battery.

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

    let realtimeChannel:
      | ReturnType<
        typeof supabase.channel
      >
      | null = null;

    const loadMonitoring =
      async () => {

        // ------------------------------------------------------
        // GET CURRENT USER
        // ------------------------------------------------------

        const {
          data: {
            user,
          },
          error: userError,
        } =
          await supabase
            .auth
            .getUser();

        // Prevent async operations from
        // continuing after component cleanup.

        if (!mounted) {
          return;
        }

        if (userError) {

          console.error(
            "Error getting user:",
            userError.message
          );

          setMonitoring(null);

          setLoading(false);

          return;
        }

        if (!user) {

          setMonitoring(null);

          setLoading(false);

          return;
        }

        // ------------------------------------------------------
        // GET MONITORING DATA
        // ------------------------------------------------------

        const {
          data,
          error,
        } =
          await supabase
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
              user.id
            )
            .maybeSingle();

        // Again check whether the component
        // was already unmounted.

        if (!mounted) {
          return;
        }

        if (error) {

          console.error(
            "Error loading monitoring data:",
            error.message
          );

          setMonitoring(null);

          setLoading(false);

          return;
        }

        // ------------------------------------------------------
        // SET INITIAL DATA
        // ------------------------------------------------------

        setMonitoring(
          data as MonitoringData | null
        );

        setLoading(false);

        // ------------------------------------------------------
        // STOP IF COMPONENT WAS CLEANED UP
        // ------------------------------------------------------

        if (!mounted) {
          return;
        }

        // ------------------------------------------------------
        // SUPABASE REALTIME
        // ------------------------------------------------------
        //
        // A unique channel name prevents React
        // development / Strict Mode from trying
        // to reuse a previously subscribed channel.
        //
        // IMPORTANT:
        //
        // .on() is called BEFORE .subscribe().
        //
        // This prevents:
        //
        // "cannot add postgres changes callbacks
        // after subscribe()"
        //
        // ------------------------------------------------------

        const channelName =
          `monitoring-${user.id}-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`;

        realtimeChannel =
          supabase.channel(
            channelName
          );

        // Configure callback BEFORE subscribing.

        realtimeChannel.on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "monitoring",
            filter:
              `user_id=eq.${user.id}`,
          },
          (payload) => {

            if (!mounted) {
              return;
            }

            setMonitoring(
              payload.new as MonitoringData
            );

            setLoading(false);

          }
        );

        // Subscribe only after all callbacks
        // have been registered.

        realtimeChannel.subscribe(
          (status) => {

            if (!mounted) {
              return;
            }

            if (
              status === "CHANNEL_ERROR"
            ) {

              console.error(
                "Monitoring Realtime channel error."
              );

            }

            if (
              status === "TIMED_OUT"
            ) {

              console.error(
                "Monitoring Realtime connection timed out."
              );

            }

          }
        );

      };

    loadMonitoring();

    // --------------------------------------------------------
    // CLEANUP
    // --------------------------------------------------------

    return () => {

      mounted = false;

      if (
        realtimeChannel
      ) {

        supabase.removeChannel(
          realtimeChannel
        );

        realtimeChannel = null;

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
        Math.min(
          100,
          level
        )
      ) / 100;

    // --------------------------------------------------------
    // LOW BATTERY CHECK
    // --------------------------------------------------------

    const isLowBattery =
      level <=
      LOW_BATTERY_THRESHOLD;

    const batteryColor =
      isLowBattery
        ? "#EF4444"
        : Colors.light.primary;

    // --------------------------------------------------------
    // GAUGE PROGRESS
    // --------------------------------------------------------
    //
    // Database battery level determines
    // the exact gauge position:
    //
    // 0%   = 12 o'clock
    // 25%  = 9 o'clock
    // 50%  = 6 o'clock
    // 75%  = 3 o'clock
    // 100% = back to 12 o'clock
    //
    // The gauge moves counterclockwise.
    //
    // This remains based entirely on
    // the battery_level from Supabase.
    //
    // --------------------------------------------------------

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

            {/* Battery Progress Ring */}

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

              {
                loading
                  ? "—"
                  : `${level}%`
              }

            </AppText>

            <AppText
              variant="caption"
              style={
                styles.batteryLabel
              }
            >

              Battery

            </AppText>

            <View style={styles.batteryStatus}>

              <AppText
                variant="caption"
                style={styles.batteryStatusText}
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

          {
            loading
              ? "—"
              : monitoring
                ?.time_remaining ??
              "—"
          }

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
      loading
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
        color={Colors.light.primary}
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

  type: Exclude<
    ChartType,
    "battery"
  >,

  monitoring:
    | MonitoringData
    | null,

  loading: boolean

) {

  switch (type) {

    // ========================================================
    // SOLAR INPUT
    // ========================================================

    case "solar": {

      const solarStatus:
        SolarStatus =
        monitoring?.solar_status ??
        "Low";

      return {

        icon:
          "sunny-outline" as keyof
          typeof Ionicons.glyphMap,

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
          "flash-outline" as keyof
          typeof Ionicons.glyphMap,

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

    case "device": {

      const deviceStatus:
        DeviceStatus =
        monitoring?.device_status ??
        "Offline";

      return {

        icon:
          "hardware-chip-outline" as keyof
          typeof Ionicons.glyphMap,

        label:
          "Device",

        value:
          deviceStatus,

      };

    }

    // ========================================================
    // DEPTH OF DISCHARGE
    // ========================================================

    case "dod": {

      const dodStatus:
        DoDStatus =
        monitoring?.dod_status ??
        "Safe";

      return {

        icon:
          "shield-checkmark-outline" as keyof
          typeof Ionicons.glyphMap,

        label:
          "DoD Status",

        value:
          dodStatus,

      };

    }

    // ========================================================
    // BATTERY TEMPERATURE
    // ========================================================

    case "temperature": {

      const tempStatus:
        TemperatureStatus =
        monitoring
          ?.battery_temperature_status ??
        "Normal";

      return {

        icon:
          "thermometer-outline" as keyof
          typeof Ionicons.glyphMap,

        label:
          "Battery Temp",

        value:

          loading
            ? "—"
            : `${monitoring
              ?.battery_temperature ??
            0}°C`,

        badge:
          tempStatus,

        badgeStyle:

          getTemperatureBadgeStyle(
            tempStatus
          ),

        badgeTextStyle:

          tempStatus ===
            "Moderate"

            ? styles.darkBadgeText

            : styles.lightBadgeText,

      };

    }

    // ========================================================
    // SOLAR PANEL TEMPERATURE
    // ========================================================

    case "solar_temperature": {

      const solarTempStatus:
        TemperatureStatus =
        monitoring
          ?.solar_temperature_status ??
        "Normal";

      return {

        icon:
          "thermometer-outline" as keyof
          typeof Ionicons.glyphMap,

        label:
          "Solar Panel Temp",

        value:

          loading
            ? "—"
            : `${monitoring
              ?.solar_temp ??
            0}°C`,

        badge:
          solarTempStatus,

        badgeStyle:

          getTemperatureBadgeStyle(
            solarTempStatus
          ),

        badgeTextStyle:

          solarTempStatus ===
            "Moderate"

            ? styles.darkBadgeText

            : styles.lightBadgeText,

      };

    }

  }

}

// ============================================================
// TEMPERATURE BADGE HELPER
// ============================================================

function getTemperatureBadgeStyle(

  status: TemperatureStatus

) {

  if (
    status ===
    "Alarming"
  ) {

    return styles.alarmingBadge;

  }

  if (
    status ===
    "Moderate"
  ) {

    return styles.moderateBadge;

  }

  return styles.normalBadge;

}

// ============================================================
// STYLES
// ============================================================

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

  lowBatteryText: {

    color: "#EF4444",

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

    backgroundColor: Colors.light.primary,

  },

  moderateBadge: {

    backgroundColor: Colors.light.secondary,

  },

  alarmingBadge: {

    backgroundColor: Colors.light.error,

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