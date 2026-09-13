import { Ionicons } from "@expo/vector-icons";

import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Svg, {
  Circle,
} from "react-native-svg";

import AppText from "@/components/ui/AppText";

import { Colors } from "@/constants/colors";

import { MonitoringData } from "@/services/monitoringService";

import {
  type WeatherCondition,
} from "@/services/weatherForecast";

// ============================================================
// TYPES
// ============================================================

type ChartType =
  | "battery"
  | "voltage"
  | "watt_hour"
  | "solar"
  | "load"
  | "weather"
  | "temperature"
  | "solar_temperature"
  | "dod";

type TemperatureStatus =
  | "Nominal"
  | "Elevated"
  | "High"
  | "Critical";

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

interface WeatherData {
  city: string;
  temperature: number;
  description: WeatherCondition;
}

type NonBatteryChartType =
  Exclude<ChartType, "battery">;

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
  monitoring: MonitoringData | null;
  weather?: WeatherData | null;
  loading: boolean;
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
  monitoring,
  weather,
  loading,
}: ChartCardProps) {

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

    // --------------------------------------------------------
    // BATTERY GAUGE DIRECTION
    //
    // 0%   = 12 o'clock
    // 25%  = 9 o'clock
    // 50%  = 6 o'clock
    // 75%  = 3 o'clock
    // 100% = back to 12 o'clock
    //
    // Counterclockwise direction.
    // --------------------------------------------------------

    const batteryTransform =
      `translate(${RING_SIZE} 0) ` +
      `scale(-1 1) ` +
      `rotate(-90 ${CENTER} ${CENTER})`;

    const batteryStatus =
      monitoring?.battery_status ??
      "Idle";

    const dodStatus =
      monitoring?.dod_status ??
      "Safe";

    const dodLabel =
      dodStatus === "Unsafe"
        ? "DoD Unsafe"
        : "DoD Safe";

    const isDodUnsafe =
      dodStatus === "Unsafe";

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

        {/* Battery Status and DoD Status */}

        <View
          style={
            styles.batteryStatusRow
          }
        >

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
              {batteryStatus}
            </AppText>

          </View>

          <View
            style={[
              styles.dodStatusBadge,
              isDodUnsafe
                ? styles.dodUnsafeBadge
                : styles.dodSafeBadge,
            ]}
          >

            <AppText
              variant="caption"
              style={[
                styles.dodStatusBadgeText,
                isDodUnsafe
                  ? styles.dodUnsafeBadgeText
                  : styles.dodSafeBadgeText,
              ]}
            >
              {dodLabel}
            </AppText>

          </View>

        </View>

      </View>
    );
  }

  // ==========================================================
  // BATTERY MONITORING GROUP
  //
  // Voltage + Watt-hour + Load Now
  // ==========================================================

  if (type === "voltage") {

    const voltageData =
      getCardData(
        "voltage",
        monitoring,
        weather ?? null,
        loading,
      );

    const wattHourData =
      getCardData(
        "watt_hour",
        monitoring,
        weather ?? null,
        loading,
      );

    const loadData =
      getCardData(
        "load",
        monitoring,
        weather ?? null,
        loading,
      );

    return (

      <View
        style={[
          styles.monitorCard,
          styles.batteryMonitorCard,
        ]}
      >

        {/* Left Icon */}

        <View
          style={
            styles.cardIconContainer
          }
        >

          <Ionicons
            name="flash-outline"
            size={40}
            color={Colors.light.primary}
            style={styles.cardIcon}
          />

        </View>

        {/* Battery Measurements */}

        <View
          style={
            styles.batteryMetrics
          }
        >

          <View
            style={
              styles.metricColumn
            }
          >

            <AppText
              variant="caption"
              style={
                styles.monitorLabel
              }
            >
              {voltageData.label}
            </AppText>

            <AppText
              variant="heading"
              style={
                styles.monitorValue
              }
            >
              {voltageData.value}
            </AppText>

          </View>

          <View
            style={
              styles.metricColumn
            }
          >

            <AppText
              variant="caption"
              style={
                styles.monitorLabel
              }
            >
              {wattHourData.label}
            </AppText>

            <AppText
              variant="heading"
              style={
                styles.monitorValue
              }
            >
              {wattHourData.value}
            </AppText>

          </View>

          <View
            style={
              styles.metricColumn
            }
          >

            <AppText
              variant="caption"
              style={
                styles.monitorLabel
              }
            >
              {loadData.label}
            </AppText>

            <AppText
              variant="heading"
              style={
                styles.monitorValue
              }
            >
              {loadData.value}
            </AppText>

          </View>

        </View>

      </View>
    );
  }

  // ==========================================================
  // SOLAR + WEATHER MONITORING GROUP
  //
  // Solar Input + Weather
  // ==========================================================

  if (type === "solar") {

    const solarData =
      getCardData(
        "solar",
        monitoring,
        weather ?? null,
        loading,
      );

    const weatherData =
      getCardData(
        "weather",
        monitoring,
        weather ?? null,
        loading,
      );

    return (

      <View
        style={[
          styles.monitorCard,
          styles.solarMonitorCard,
        ]}
      >

        {/* Left Weather Icon */}

        <View
          style={
            styles.cardIconContainer
          }
        >

          <Ionicons
            name={weatherData.icon}
            size={40}
            color={Colors.light.primary}
            style={styles.cardIcon}
          />

        </View>

        {/* Solar and Weather Measurements */}

        <View
          style={
            styles.solarMetrics
          }
        >

          {/* Solar Input */}

          <View
            style={
              styles.metricColumn
            }
          >

            <AppText
              variant="caption"
              style={
                styles.monitorLabel
              }
            >
              {solarData.label}
            </AppText>

            <AppText
              variant="heading"
              style={
                styles.monitorValue
              }
            >
              {solarData.value}
            </AppText>

            {solarData.badge && (

              <View
                style={[
                  styles.statusBadge,
                  solarData.badgeStyle,
                ]}
              >

                <AppText
                  variant="caption"
                  style={[
                    styles.statusBadgeText,
                    solarData.badgeTextStyle,
                  ]}
                >
                  {solarData.badge}
                </AppText>

              </View>

            )}

          </View>

          {/* Weather */}

          <View
            style={
              styles.metricColumn
            }
          >

            <AppText
              variant="caption"
              style={
                styles.monitorLabel
              }
            >
              {weatherData.label}
            </AppText>

            <AppText
              variant="heading"
              style={
                styles.monitorValue
              }
            >
              {weatherData.value}
            </AppText>

            {weatherData.badge && (

              <View
                style={[
                  styles.statusBadge,
                  weatherData.badgeStyle,
                ]}
              >

                <AppText
                  variant="caption"
                  style={[
                    styles.statusBadgeText,
                    weatherData.badgeTextStyle,
                  ]}
                >
                  {weatherData.badge}
                </AppText>

              </View>

            )}

          </View>

        </View>

      </View>
    );
  }

  // ==========================================================
  // TEMPERATURE MONITORING GROUP
  //
  // Battery Temperature + Solar Panel Temperature
  // ==========================================================

  if (type === "temperature") {

    const batteryTemperatureData =
      getCardData(
        "temperature",
        monitoring,
        weather ?? null,
        loading,
      );

    const solarTemperatureData =
      getCardData(
        "solar_temperature",
        monitoring,
        weather ?? null,
        loading,
      );

    return (

      <View
        style={[
          styles.monitorCard,
          styles.temperatureMonitorCard,
        ]}
      >

        {/* Left Temperature Icon */}

        <View
          style={
            styles.cardIconContainer
          }
        >

          <Ionicons
            name="thermometer-outline"
            size={40}
            color={Colors.light.primary}
            style={styles.cardIcon}
          />

        </View>

        {/* Temperature Measurements */}

        <View
          style={
            styles.temperatureMetrics
          }
        >

          {/* Battery Temperature */}

          <View
            style={
              styles.metricColumn
            }
          >

            <AppText
              variant="caption"
              style={
                styles.monitorLabel
              }
            >
              Battery
            </AppText>

            <AppText
              variant="heading"
              style={
                styles.monitorValue
              }
            >
              {batteryTemperatureData.value}
            </AppText>

            {batteryTemperatureData.badge && (

              <View
                style={[
                  styles.statusBadge,
                  batteryTemperatureData.badgeStyle,
                ]}
              >

                <AppText
                  variant="caption"
                  style={[
                    styles.statusBadgeText,
                    batteryTemperatureData.badgeTextStyle,
                  ]}
                >
                  {batteryTemperatureData.badge}
                </AppText>

              </View>

            )}

          </View>

          {/* Solar Panel Temperature */}

          <View
            style={
              styles.metricColumn
            }
          >

            <AppText
              variant="caption"
              style={
                styles.monitorLabel
              }
            >
              Solar Panel
            </AppText>

            <AppText
              variant="heading"
              style={
                styles.monitorValue
              }
            >
              {solarTemperatureData.value}
            </AppText>

            {solarTemperatureData.badge && (

              <View
                style={[
                  styles.statusBadge,
                  solarTemperatureData.badgeStyle,
                ]}
              >

                <AppText
                  variant="caption"
                  style={[
                    styles.statusBadgeText,
                    solarTemperatureData.badgeTextStyle,
                  ]}
                >
                  {solarTemperatureData.badge}
                </AppText>

              </View>

            )}

          </View>

        </View>

      </View>
    );
  }

  // ==========================================================
  // HIDDEN GROUP MEMBERS
  //
  // These values are rendered inside their respective
  // grouped monitoring cards above.
  // ==========================================================

  if (
    type === "watt_hour" ||
    type === "load" ||
    type === "weather" ||
    type === "dod" ||
    type === "solar_temperature"
  ) {
    return null;
  }

  // ==========================================================
  // OTHER MONITORING CARDS
  // ==========================================================

  const data =
    getCardData(
      type,
      monitoring,
      weather ?? null,
      loading,
    );

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

      {data.value !==
        undefined && (

        <AppText
          variant="heading"
          style={[
            styles.monitorValue,
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
  monitoring: MonitoringData | null,
  weather: WeatherData | null,
  loading: boolean,
): CardData {

  switch (type) {

    // ========================================================
    // VOLTAGE
    // ========================================================

    case "voltage":
      return {
        icon:
          "flash-outline",
        label:
          "Voltage",
        value:
          loading
            ? "—"
            : `${monitoring?.voltage ?? 0}V`,
      };

    // ========================================================
    // WATT-HOUR
    // ========================================================

    case "watt_hour":
      return {
        icon:
          "battery-charging-outline",
        label:
          "Watt-hour",
        value:
          loading
            ? "—"
            : `${monitoring?.watt_hours ?? 0}Wh`,
      };

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

    case "weather": {

      const description =
        weather?.description ?? "Clear sky";

      return {

        icon:
          getWeatherIcon(description),

        label:
          weather?.city ?? "—",

        value:
          loading
            ? "—"
            : weather
              ? `${weather.temperature}°C`
              : "—",

        badge:
          description,

        badgeStyle:
          getWeatherBadgeStyle(description),

        badgeTextStyle:
          getWeatherBadgeTextStyle(description),

      };
    }

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
        "Nominal";

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
          getTemperatureBadgeTextStyle(
            status,
          ),

      };
    }

    // ========================================================
    // SOLAR PANEL TEMPERATURE
    // ========================================================

    case "solar_temperature": {

      const status =
        monitoring
          ?.solar_temperature_status ??
        "Nominal";

      return {

        icon:
          "thermometer-outline",

        label:
          "Solar Panel Temp",

        value:
          loading
            ? "—"
            : `${monitoring
              ?.solar_temperature ??
            0}°C`,

        badge:
          status,

        badgeStyle:
          getTemperatureBadgeStyle(
            status,
          ),

        badgeTextStyle:
          getTemperatureBadgeTextStyle(
            status,
          ),

      };
    }

  }
}

// ============================================================
// WEATHER ICON
// ============================================================

function getWeatherIcon(
  description: WeatherCondition,
): keyof typeof Ionicons.glyphMap {

  switch (description) {

    case "Clear sky":
    case "Mainly clear":

      return "sunny-outline";

    case "Partly cloudy":

      return "partly-sunny-outline";

    case "Overcast":
    case "Fog":

      return "cloud-outline";

    case "Light drizzle":
    case "Moderate drizzle":
    case "Dense intensity drizzle":
    case "Slight rain":
    case "Moderate rain":
    case "Heavy intensity rain":
    case "Slight rain showers":
    case "Moderate rain showers":
    case "Violent rain showers":

      return "rainy-outline";

    case "Slight or moderate thunderstorm":
    case "Thunderstorm with slight hail":
    case "Thunderstorm with heavy hail":

      return "thunderstorm-outline";

  }
}

// ============================================================
// WEATHER BADGE STYLE
// ============================================================

function getWeatherBadgeStyle(
  description: WeatherCondition,
) {

  switch (description) {

    case "Clear sky":
    case "Mainly clear":

      return styles.clearWeatherBadge;

    case "Partly cloudy":

      return styles.partlyCloudyWeatherBadge;

    case "Overcast":

      return styles.overcastWeatherBadge;

    case "Fog":

      return styles.fogWeatherBadge;

    case "Light drizzle":
    case "Moderate drizzle":
    case "Dense intensity drizzle":
    case "Slight rain":
    case "Slight rain showers":

      return styles.yellowWeatherBadge;

    case "Moderate rain":
    case "Moderate rain showers":
    case "Slight or moderate thunderstorm":

      return styles.orangeWeatherBadge;

    case "Heavy intensity rain":
    case "Violent rain showers":
    case "Thunderstorm with slight hail":
    case "Thunderstorm with heavy hail":

      return styles.redWeatherBadge;

  }
}

// ============================================================
// WEATHER BADGE TEXT STYLE
// ============================================================

function getWeatherBadgeTextStyle(
  description: WeatherCondition,
) {

  switch (description) {

    case "Clear sky":
    case "Mainly clear":

      return styles.clearWeatherBadgeText;

    case "Partly cloudy":

      return styles.partlyCloudyWeatherBadgeText;

    case "Overcast":

      return styles.overcastWeatherBadgeText;

    case "Fog":

      return styles.fogWeatherBadgeText;

    case "Light drizzle":
    case "Moderate drizzle":
    case "Dense intensity drizzle":
    case "Slight rain":
    case "Slight rain showers":

      return styles.yellowWeatherBadgeText;

    case "Moderate rain":
    case "Moderate rain showers":
    case "Slight or moderate thunderstorm":

      return styles.orangeWeatherBadgeText;

    case "Heavy intensity rain":
    case "Violent rain showers":
    case "Thunderstorm with slight hail":
    case "Thunderstorm with heavy hail":

      return styles.redWeatherBadgeText;

  }
}

// ============================================================
// TEMPERATURE BADGE STYLE
// ============================================================

function getTemperatureBadgeStyle(
  status: TemperatureStatus,
) {

  switch (status) {

    case "Nominal":

      return styles.nominalTemperatureBadge;

    case "Elevated":

      return styles.elevatedTemperatureBadge;

    case "High":

      return styles.highTemperatureBadge;

    case "Critical":

      return styles.criticalTemperatureBadge;

  }
}

// ============================================================
// TEMPERATURE BADGE TEXT STYLE
// ============================================================

function getTemperatureBadgeTextStyle(
  status: TemperatureStatus,
) {

  switch (status) {

    case "Nominal":

      return styles.nominalTemperatureBadgeText;

    case "Elevated":

      return styles.elevatedTemperatureBadgeText;

    case "High":

      return styles.highTemperatureBadgeText;

    case "Critical":

      return styles.criticalTemperatureBadgeText;

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

    fontSize: 40,

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

  batteryStatusRow: {

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    marginTop: 7,

    gap: 9,
  },

  batteryStatus: {

    backgroundColor:
      Colors.light.primary,

    borderRadius: 10,

    paddingHorizontal: 15,

    paddingVertical: 3,

    minWidth: 10,

    alignItems: "center",

    justifyContent: "center",

    height: 25,

  },

  batteryStatusText: {

    color: "#FFFFFF",

    fontSize: 12,

    fontWeight: "600",
  },

  remainingText: {

    color:
      Colors.light.textSecondary,

    marginTop: 3,

    textAlign: "center",
  },

  // ==========================================================
  // MONITORING CARDS
  // ==========================================================

  monitorCard: {

    width: "100%",

    minHeight: 108,

    backgroundColor:
      Colors.glass.white,

    borderWidth: 2,

    borderColor:
      Colors.light.primary,

    borderRadius: 15,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 12,

    paddingVertical: 12,

    marginBottom: 2,
  },

  // ==========================================================
  // GROUPED MONITORING CARDS
  // ==========================================================

  batteryMonitorCard: {

    minHeight: 116,
  },

  solarMonitorCard: {

    minHeight: 108,
  },

  temperatureMonitorCard: {

    minHeight: 108,
  },

  cardIconContainer: {

    width: 38,

    alignItems: "center",

    justifyContent: "center",

    flexShrink: 0,
  },

  cardIcon: {

    marginRight: 0,
  },

  batteryMetrics: {

    flex: 1,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    paddingLeft: 4,

    paddingRight: 2,

  },

  solarMetrics: {

    flex: 1,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    paddingLeft: 4,

    paddingRight: 2,

  },

  temperatureMetrics: {

    flex: 1,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    paddingLeft: 4,

    paddingRight: 2,

  },

  metricColumn: {

    flex: 1,

    alignItems: "center",

    justifyContent: "center",

    minWidth: 0,

    paddingHorizontal: 3,
  },

  // ==========================================================
  // GENERAL CARD CONTENT
  // ==========================================================

  icon: {

    marginBottom: 3,
  },

  monitorLabel: {

    color: "#000000",

    textAlign: "center",

    fontWeight: "600",

    lineHeight: 17,
  },

  monitorValue: {

    color: "#000000",

    fontSize: 20,

    fontWeight: "700",

    textAlign: "center",

    marginTop: 3,

    lineHeight: 24,
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

    marginTop: 6,

    paddingHorizontal: 9,

    paddingVertical: 3,

    borderRadius: 10,

    minWidth: 42,

    alignItems: "center",

    justifyContent: "center",

  },

  statusBadgeText: {

    fontSize: 9,

    fontWeight: "600",

    textAlign: "center",
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

  // ==========================================================
  // DOD STATUS BADGES
  // ==========================================================

  dodStatusBadge: {

    borderRadius: 10,

    paddingHorizontal: 9,

    paddingVertical: 3,

    minWidth: 58,

    alignItems: "center",

    justifyContent: "center",

    height: 25,
  },

  dodSafeBadge: {

    backgroundColor:
      Colors.light.primary,
  },

  dodUnsafeBadge: {

    backgroundColor:
      Colors.light.error,
  },

  dodStatusBadgeText: {

    fontSize: 12,

    fontWeight: "600",

    textAlign: "center",
  },

  dodSafeBadgeText: {

    color: "#FFFFFF",
  },

  dodUnsafeBadgeText: {

    color: "#FFFFFF",
  },

  // ==========================================================
  // TEMPERATURE BADGES
  // ==========================================================

  nominalTemperatureBadge: {

    backgroundColor: "#E4EAD9",

    borderWidth: 1,

    borderColor: "#14532D",
  },

  nominalTemperatureBadgeText: {

    color: "#14532D",
  },

  elevatedTemperatureBadge: {

    backgroundColor: "#EBE8CD",

    borderWidth: 1,

    borderColor: "#713F12",
  },

  elevatedTemperatureBadgeText: {

    color: "#713F12",
  },

  highTemperatureBadge: {

    backgroundColor: "#EFE2CC",

    borderWidth: 1,

    borderColor: "#7C2D12",
  },

  highTemperatureBadgeText: {

    color: "#7C2D12",
  },

  criticalTemperatureBadge: {

    backgroundColor: "#EFE0DC",

    borderWidth: 1,

    borderColor: "#7F1D1D",
  },

  criticalTemperatureBadgeText: {

    color: "#7F1D1D",
  },

  // ==========================================================
  // WEATHER BADGES
  // ==========================================================

  // CLEAR

  clearWeatherBadge: {
    backgroundColor: "#DCFCE7",
    borderWidth: 1,
    borderColor: "#86EFAC",
  },

  clearWeatherBadgeText: {
    color: "#166534",
  },

  // PARTLY CLOUDY

  partlyCloudyWeatherBadge: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FCD34D",
  },

  partlyCloudyWeatherBadgeText: {
    color: "#92400E",
  },

  // OVERCAST

  overcastWeatherBadge: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },

  overcastWeatherBadgeText: {
    color: "#475569",
  },

  // FOG

  fogWeatherBadge: {
    backgroundColor: "#E2E8F0",
    borderWidth: 1,
    borderColor: "#94A3B8",
  },

  fogWeatherBadgeText: {
    color: "#475569",
  },

  // PAGASA-STYLE YELLOW

  yellowWeatherBadge: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FACC15",
  },

  yellowWeatherBadgeText: {
    color: "#854D0E",
  },

  // PAGASA-STYLE ORANGE

  orangeWeatherBadge: {
    backgroundColor: "#FFEDD5",
    borderWidth: 1,
    borderColor: "#F97316",
  },

  orangeWeatherBadgeText: {
    color: "#9A3412",
  },

  // PAGASA-STYLE RED

  redWeatherBadge: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#EF4444",
  },

  redWeatherBadgeText: {
    color: "#991B1B",
  },
});