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
  | "solar_voltage"
  | "solar_current"
  | "solar_energy"
  | "solar_timer"
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
  // BATTERY MONITORING GROUP
  //
  // The battery gauge block (ring + percentage + time remaining
  // + status badges) was merged into this card's left column.
  // Voltage, Watt-hour, and Load Now fill the right 2 × 3 grid.
  // ==========================================================

  if (type === "voltage") {

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

    const isIdle =
      batteryStatus === "Idle";

    const dodStatus =
      monitoring?.dod_status ??
      "Safe";

    const dodLabel =
      dodStatus === "Unsafe"
        ? "DoD Unsafe"
        : "DoD Safe";

    const isDodUnsafe =
      dodStatus === "Unsafe";

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

    /*
     * The monitoring service data is extended here with the
     * interior temperature fields so both temperatures can be
     * surfaced inside this card without changing the shared
     * MonitoringData import.
     */

    const temperatureMonitoring =
      monitoring as (
        MonitoringData & {
          interior_temp: number;
          interior_temp_status:
            TemperatureStatus;
        }
      ) | null;

    const interiorTemperatureStatus =
      temperatureMonitoring
        ?.interior_temp_status ??
      "Nominal";

    const batteryTemperatureData =
      getCardData(
        "temperature",
        monitoring,
        weather ?? null,
        loading,
      );

    const interiorTemperatureValue =
      loading
        ? "—"
        : `${temperatureMonitoring
            ?.interior_temp ??
          0}°C`;

    const interiorTemperatureBadge =
      getTemperatureBadgeStyle(
        interiorTemperatureStatus,
      );

    const interiorTemperatureBadgeText =
      getTemperatureBadgeTextStyle(
        interiorTemperatureStatus,
      );

    return (
      <View
        style={[
          styles.monitorCard,
          styles.groupMonitoringCard,
        ]}
      >

        {/* ==================================================
            BATTERY HEADER / ACCENT PANEL
            ================================================== */}

        <View
          style={
            styles.groupHeaderPanel
          }
        >

          <View
            style={
              styles.groupHeaderLeft
            }
          >

            <Ionicons
              name="flash-outline"
              size={30}
              color="#FACC15"
            />

            <AppText
              variant="heading"
              style={
                styles.groupHeaderTitle
              }
            >
              Battery Monitoring
            </AppText>

          </View>

        </View>

        {/* ==================================================
            BATTERY BODY ROW
            ================================================== */}

        <View
          style={
            styles.batteryBodyRow
          }
        >

          {/* ==================================================
              LEFT — BATTERY GAUGE COLUMN
              ================================================== */}

          <View
            style={
              styles.batteryGaugeColumn
            }
          >

            <View
              style={
                styles.batteryCircle
              }
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

              {/* ==============================================
                  BATTERY CENTER
                  ============================================== */}

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

            {/* ==============================================
                TIME REMAINING
                ============================================== */}

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

            {/* ==============================================
                BATTERY STATUS AND DoD STATUS
                ============================================== */}

            <View
              style={
                styles.batteryStatusRow
              }
            >

              {/* Battery Status */}

              <View
                style={[
                  styles.batteryStatus,
                  isIdle
                    ? styles.batteryStatusIdle
                    : null,
                ]}
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

              {/* DoD Status */}

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

          {/* ==================================================
              RIGHT — BATTERY 2 × 3 MEASUREMENT GRID
              ================================================== */}

          <View
            style={
              styles.batteryMetricGrid
            }
          >

            {/* ==============================================
                VOLTAGE
                ============================================== */}

            <View
              style={
                styles.batteryMetricCell
              }
            >

              <AppText
                variant="caption"
                style={
                  styles.batteryMetricLabel
                }
              >
                {voltageData.label}
              </AppText>

              <AppText
                variant="heading"
                style={
                  styles.batteryMetricValue
                }
              >
                {voltageData.value}
              </AppText>

            </View>

            {/* ==============================================
                WATT-HOUR
                ============================================== */}

            <View
              style={
                styles.batteryMetricCell
              }
            >

              <AppText
                variant="caption"
                style={
                  styles.batteryMetricLabel
                }
              >
                {wattHourData.label}
              </AppText>

              <AppText
                variant="heading"
                style={
                  styles.batteryMetricValue
                }
              >
                {wattHourData.value}
              </AppText>

            </View>

            {/* ==============================================
                CURRENT LOAD
                ============================================== */}

            <View
              style={
                styles.batteryMetricCell
              }
            >

              <AppText
                variant="caption"
                style={
                  styles.batteryMetricLabel
                }
              >
                {loadData.label}
              </AppText>

              <AppText
                variant="heading"
                style={
                  styles.batteryMetricValue
                }
              >
                {loadData.value}
              </AppText>

            </View>

            {/* ==============================================
                RESERVED CELL (for future data)
                ============================================== */}

            <View
              style={
                styles.batteryMetricCell
              }
            />

            {/* ==============================================
                TEMPERATURE (battery temperature)
                ============================================== */}

            <View
              style={
                styles.batteryMetricCell
              }
            >

              <AppText
                variant="caption"
                style={
                  styles.batteryMetricLabel
                }
              >
                Temperature
              </AppText>

              <AppText
                variant="heading"
                style={
                  styles.batteryMetricValue
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

            {/* ==============================================
                INTERIOR TEMPERATURE
                ============================================== */}

            <View
              style={
                styles.batteryMetricCell
              }
            >

              <AppText
                variant="caption"
                style={
                  styles.batteryMetricLabel
                }
              >
                Interior
              </AppText>

              <AppText
                variant="heading"
                style={
                  styles.batteryMetricValue
                }
              >
                {interiorTemperatureValue}
              </AppText>

              <View
                style={[
                  styles.statusBadge,
                  interiorTemperatureBadge,
                ]}
              >

                <AppText
                  variant="caption"
                  style={[
                    styles.statusBadgeText,
                    interiorTemperatureBadgeText,
                  ]}
                >
                  {interiorTemperatureStatus}
                </AppText>

              </View>

            </View>

          </View>

        </View>

      </View>
    );
  }

  // ==========================================================
  // SOLAR MONITORING GROUP
  //
  // Solar Timer + Solar Input + Solar Voltage
  // + Solar Current + Total Energy
  // ==========================================================

  if (type === "solar") {

    const solarStatus =
      monitoring?.solar_status ??
      "Low";

    const solarTimer =
      monitoring?.solar_timer ??
      "00:00:00";

    const solarInput =
      loading
        ? "—"
        : `${monitoring?.solar_input ?? 0}W`;

    const solarVoltage =
      loading
        ? "—"
        : `${monitoring?.solar_voltage ?? 0}V`;

    const solarCurrent =
      loading
        ? "—"
        : `${monitoring?.solar_current ?? 0}A`;

    const totalEnergy =
      loading
        ? "—"
        : `${monitoring?.total_energy ?? 0}Wh`;

    return (
      <View
        style={[
          styles.monitorCard,
          styles.solarMonitoringCard,
        ]}
      >

        {/* ==================================================
            SOLAR HEADER / ACCENT PANEL
            ================================================== */}

        <View
          style={
            styles.solarHeaderPanel
          }
        >

          <View
            style={
              styles.solarHeaderLeft
            }
          >

            <Ionicons
              name="sunny-outline"
              size={30}
              color="#FACC15"
            />

            <AppText
              variant="heading"
              style={
                styles.solarHeaderTitle
              }
            >
              Solar Monitoring
            </AppText>

          </View>

          <View
            style={
              styles.solarTimerContainer
            }
          >

            <AppText
              variant="caption"
              style={
                styles.solarTimerLabel
              }
            >
              Timer
            </AppText>

            <AppText
              variant="heading"
              style={
                styles.solarTimerValue
              }
            >
              {loading
                ? "—"
                : formatSolarTimer(
                    solarTimer,
                  )}
            </AppText>

          </View>

        </View>

        {/* ==================================================
            SOLAR 2 × 2 MEASUREMENT GRID
            ================================================== */}

        <View
          style={
            styles.solarMeasurementGrid
          }
        >

          {/* ==================================================
              SOLAR INPUT
              ================================================== */}

          <View
            style={
              styles.solarMetricCell
            }
          >

            <AppText
              variant="caption"
              style={
                styles.solarMetricLabel
              }
            >
              Solar Input
            </AppText>

            <AppText
              variant="heading"
              style={
                styles.solarMetricValue
              }
            >
              {solarInput}
            </AppText>

            {/* Status slot — always rendered for grid alignment */}

            <View
              style={
                styles.statusSlot
              }
            >

              <View
                style={[
                  styles.statusBadge,
                  solarStatus === "High"
                    ? styles.normalBadge
                    : solarStatus ===
                        "Moderate"
                    ? styles.moderateBadge
                    : styles.lowBadge,
                ]}
              >

                <AppText
                  variant="caption"
                  style={[
                    styles.statusBadgeText,
                    solarStatus ===
                      "Moderate"
                      ? styles.darkBadgeText
                      : styles.lightBadgeText,
                  ]}
                >
                  {solarStatus}
                </AppText>

              </View>

            </View>

          </View>

          {/* ==================================================
              SOLAR VOLTAGE
              ================================================== */}

          <View
            style={
              styles.solarMetricCell
            }
          >

            <AppText
              variant="caption"
              style={
                styles.solarMetricLabel
              }
            >
              Voltage
            </AppText>

            <AppText
              variant="heading"
              style={
                styles.solarMetricValue
              }
            >
              {solarVoltage}
            </AppText>

            {/* Empty status slot intentionally reserved for
                horizontal alignment with Solar Input. */}

            <View
              style={
                styles.statusSlot
              }
            />

          </View>

          {/* ==================================================
              SOLAR CURRENT
              ================================================== */}

          <View
            style={
              styles.solarMetricCell
            }
          >

            <AppText
              variant="caption"
              style={
                styles.solarMetricLabel
              }
            >
              Current
            </AppText>

            <AppText
              variant="heading"
              style={
                styles.solarMetricValue
              }
            >
              {solarCurrent}
            </AppText>

            <View
              style={
                styles.statusSlot
              }
            />

          </View>

          {/* ==================================================
              TOTAL ENERGY
              ================================================== */}

          <View
            style={
              styles.solarMetricCell
            }
          >

            <AppText
              variant="caption"
              style={
                styles.solarMetricLabel
              }
            >
              Total Energy
            </AppText>

            <AppText
              variant="heading"
              style={
                styles.solarMetricValue
              }
            >
              {totalEnergy}
            </AppText>

            <View
              style={
                styles.statusSlot
              }
            />

          </View>

        </View>

      </View>
    );
  }

  // ==========================================================
  // WEATHER MONITORING CARD
  //
  // Weather is intentionally separated from the solar card.
  // The weather card now follows the same grouped-card layout
  // used by Battery Monitoring, Solar Monitoring, and
  // Temperature Monitoring.
  // ==========================================================

  if (type === "weather") {

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
          styles.weatherMonitoringCard,
        ]}
      >

        {/* ==================================================
            WEATHER HEADER / ACCENT PANEL
            ================================================== */}

        <View
          style={
            styles.weatherHeaderPanel
          }
        >

          <View
            style={
              styles.weatherHeaderLeft
            }
          >

            <Ionicons
              name={weatherData.icon}
              size={30}
              color="#FACC15"
            />

            <AppText
              variant="heading"
              style={
                styles.weatherHeaderTitle
              }
            >
              Weather Monitoring
            </AppText>

          </View>

        </View>

        {/* ==================================================
            WEATHER INFORMATION
            ================================================== */}

        <View
          style={
            styles.weatherMeasurementArea
          }
        >

          <View
            style={
              styles.weatherMetricCell
            }
          >

            {/* ==================================================
                LOCATION
                ================================================== */}

            <AppText
              variant="caption"
              style={
                styles.weatherLocation
              }
            >
              {weatherData.label}
            </AppText>

            {/* ==================================================
                TEMPERATURE
                ================================================== */}

            <AppText
              variant="heading"
              style={
                styles.weatherTemperature
              }
            >
              {weatherData.value}
            </AppText>

            {/* ==================================================
                WEATHER CONDITION
                ================================================== */}

            <View
              style={
                styles.weatherStatusSlot
              }
            >

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

      </View>
    );
  }

  // ==========================================================
  // TEMPERATURE MONITORING GROUP
  //
  // Only Solar Panel Temperature remains here. The battery and
  // interior temperatures were moved into the Battery
  // Monitoring card's 2 × 3 grid.
  // ==========================================================

  if (type === "temperature") {

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
          styles.groupMonitoringCard,
        ]}
      >

        {/* ==================================================
            TEMPERATURE HEADER / ACCENT PANEL
            ================================================== */}

        <View
          style={
            styles.groupHeaderPanel
          }
        >

          <View
            style={
              styles.groupHeaderLeft
            }
          >

            <Ionicons
              name="thermometer-outline"
              size={30}
              color="#FACC15"
            />

            <AppText
              variant="heading"
              style={
                styles.groupHeaderTitle
              }
            >
              Temperature Monitoring
            </AppText>

          </View>

        </View>

        {/* ==================================================
            SOLAR PANEL TEMPERATURE
            ================================================== */}

        <View
          style={
            styles.groupMeasurementGrid
          }
        >

          <View
            style={
              styles.groupMetricCell
            }
          >

            <AppText
              variant="caption"
              style={
                styles.groupMetricLabel
              }
            >
              Solar Panel
            </AppText>

            <AppText
              variant="heading"
              style={
                styles.groupMetricValue
              }
            >
              {solarTemperatureData.value}
            </AppText>

            <View
              style={
                styles.statusSlot
              }
            >

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
    type === "battery" ||
    type === "watt_hour" ||
    type === "solar_voltage" ||
    type === "solar_current" ||
    type === "solar_energy" ||
    type === "solar_timer" ||
    type === "load" ||
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
    <View
      style={
        styles.monitorCard
      }
    >

      {/* ==================================================
          ICON PANEL
          ================================================== */}

      <View
        style={
          styles.iconAccentPanel
        }
      >

        <Ionicons
          name={data.icon}
          size={28}
          color={Colors.light.primary}
        />

      </View>

      {/* ==================================================
          LABEL
          ================================================== */}

      <AppText
        variant="caption"
        style={
          styles.monitorLabel
        }
      >
        {data.label}
      </AppText>

      {/* ==================================================
          VALUE
          ================================================== */}

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

      {/* ==================================================
          STATUS BADGE
          ================================================== */}

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
  loading: boolean
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
    // SOLAR VOLTAGE
    // ========================================================

    case "solar_voltage":

      return {
        icon:
          "flash-outline",

        label:
          "Voltage",

        value:
          loading
            ? "—"
            : `${monitoring?.solar_voltage ?? 0}V`,
      };

    // ========================================================
    // SOLAR CURRENT
    // ========================================================

    case "solar_current":

      return {
        icon:
          "pulse-outline",

        label:
          "Current",

        value:
          loading
            ? "—"
            : `${monitoring?.solar_current ?? 0}A`,
      };

    // ========================================================
    // TOTAL ENERGY
    // ========================================================

    case "solar_energy":

      return {
        icon:
          "battery-charging-outline",

        label:
          "Total Energy",

        value:
          loading
            ? "—"
            : `${monitoring?.total_energy ?? 0}Wh`,
      };

    // ========================================================
    // SOLAR TIMER
    // ========================================================

    case "solar_timer":

      return {
        icon:
          "timer-outline",

        label:
          "Timer",

        value:
          loading
            ? "—"
            : formatSolarTimer(
                monitoring?.solar_timer ??
                  "00:00:00",
              ),
      };

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
    // WEATHER
    // ========================================================

    case "weather": {

      const description =
        weather?.description ??
        "Clear sky";

      return {
        icon:
          getWeatherIcon(
            description,
          ),

        label:
          weather?.city ??
          "—",

        value:
          loading
            ? "—"
            : weather
              ? `${weather.temperature}°C`
              : "—",

        badge:
          description,

        badgeStyle:
          getWeatherBadgeStyle(
            description,
          ),

        badgeTextStyle:
          getWeatherBadgeTextStyle(
            description,
          ),
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
// SOLAR TIMER FORMATTER
// ============================================================

function formatSolarTimer(
  timer: string,
): string {

  const value =
    String(timer ?? "")
      .trim();

  if (!value) {
    return "00:00:00";
  }

  // PostgreSQL interval values can be returned as
  // HH:MM:SS, H:MM:SS, or values containing days.

  const dayMatch =
    value.match(/(-?\d+)\s+days?/i);

  const timeMatch =
    value.match(/(\d{1,3}):(\d{2}):(\d{2})/);

  if (timeMatch) {

    const days = dayMatch
      ? Number(dayMatch[1])
      : 0;

    const hours =
      Number(timeMatch[1]) +
      days * 24;

    const minutes =
      Number(timeMatch[2]);

    const seconds =
      Number(timeMatch[3]);

    return [
      String(hours).padStart(2, "0"),
      String(minutes).padStart(2, "0"),
      String(seconds).padStart(2, "0"),
    ].join(":");
  }

  return value;
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

  // ==========================================================
  // BATTERY BODY ROW
  //
  // Splits the card body into two equal flex halves. Both
  // columns are flex:1 so the dividing boundary always lands
  // on the true center of the card. The column gap sits in
  // the middle, acting as the imaginary divider.
  // ==========================================================

  batteryBodyRow: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    alignItems: "stretch",
    paddingHorizontal: 10,
    paddingVertical: 10,
    columnGap: 12,
  },

  // ==========================================================
  // LEFT — BATTERY GAUGE COLUMN
  // ==========================================================

  batteryGaugeColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 6,
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
    fontSize: 36,
    fontWeight: "800",
    lineHeight: 30,
  },

  lowBatteryText: {
    color: Colors.light.error,
  },

  batteryStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 7,
    gap: 8,
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

  batteryStatusIdle: {
    backgroundColor:
      Colors.light.error,
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
    fontSize: 11,
  },

  // ==========================================================
  // RIGHT — BATTERY 2 × 3 MEASUREMENT GRID
  //
  // Flex-wraps six equal cells (two per row × three rows).
  // The bottom three cells are reserved for future data.
  // ==========================================================

  batteryMetricGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "stretch",
    alignContent: "flex-start",
    justifyContent: "space-between",
  },

  batteryMetricCell: {
    width: "50%",
    minHeight: 78,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    paddingVertical: 6,
  },

  batteryMetricLabel: {
    color: "#000000",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
    flexShrink: 1,
  },

  batteryMetricValue: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 3,
    lineHeight: 22,
    flexShrink: 1,
  },

  // ==========================================================
  // MONITORING CARDS — BASE SHELL
  // ==========================================================

  monitorCard: {
    width: "100%",
    minHeight: 108,
    backgroundColor:
      Colors.glass.white,
    borderWidth: 3,
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
  // SHARED GROUP MONITORING CARD OVERRIDE
  //
  // Used by: Battery Monitoring (voltage type)
  //           Temperature Monitoring (temperature type)
  //
  // Switches the base shell to column layout and strips
  // the horizontal/vertical padding so the header panel
  // fills edge-to-edge.
  // ==========================================================

  groupMonitoringCard: {
    flexDirection: "column",
    alignItems: "stretch",
    paddingHorizontal: 0,
    paddingVertical: 0,
    overflow: "hidden",
  },

  // ==========================================================
  // GROUP HEADER / ACCENT PANEL
  // ==========================================================

  groupHeaderPanel: {
    width: "100%",
    backgroundColor:
      Colors.light.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  groupHeaderLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  groupHeaderTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    flexShrink: 1,
  },

  // ==========================================================
  // GROUP 1 × 3 MEASUREMENT GRID
  // ==========================================================

  groupMeasurementGrid: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 10,
  },

  groupMetricCell: {
    flex: 1,
    minHeight: 70,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    paddingVertical: 4,
  },

  groupMetricLabel: {
    color: "#000000",
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 17,
    flexShrink: 1,
  },

  groupMetricValue: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 3,
    lineHeight: 22,
    flexShrink: 1,
  },

  // ==========================================================
  // SOLAR MONITORING CARD
  // ==========================================================

  solarMonitoringCard: {
    minHeight: 250,
    flexDirection: "column",
    alignItems: "stretch",
    paddingHorizontal: 0,
    paddingVertical: 0,
    overflow: "hidden",
  },

  solarHeaderPanel: {
    width: "100%",
    backgroundColor:
      Colors.light.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  solarHeaderLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
    paddingRight: 10,
  },

  solarHeaderTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    flexShrink: 1,
  },

  solarTimerContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
    minWidth: 86,
  },

  solarTimerLabel: {
    color: "#FFFFFF",
    fontSize: 11,
    lineHeight: 14,
  },

  solarTimerValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
    textAlign: "right",
  },

  // ==========================================================
  // SOLAR 2 × 2 MEASUREMENT GRID
  // ==========================================================

  solarMeasurementGrid: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "stretch",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },

  solarMetricCell: {
    width: "50%",
    minHeight: 95,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    paddingVertical: 8,
  },

  solarMetricLabel: {
    color: "#000000",
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 17,
    flexShrink: 1,
  },

  solarMetricValue: {
    color: "#000000",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 3,
    lineHeight: 24,
    flexShrink: 1,
  },

  // ==========================================================
  // WEATHER MONITORING CARD
  //
  // Uses the same grouped layout language as the Battery,
  // Solar, and Temperature monitoring cards.
  // ==========================================================

  weatherMonitoringCard: {
    minHeight: 175,
    flexDirection: "column",
    alignItems: "stretch",
    paddingHorizontal: 0,
    paddingVertical: 0,
    overflow: "hidden",
  },

  weatherHeaderPanel: {
    width: "100%",
    backgroundColor:
      Colors.light.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  weatherHeaderLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  weatherHeaderTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    flexShrink: 1,
  },

  weatherMeasurementArea: {
    flex: 1,
    width: "100%",
    alignItems: "stretch",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 10,
  },

  weatherMetricCell: {
    flex: 1,
    minHeight: 105,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  weatherLocation: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 18,
    flexShrink: 1,
  },

  weatherTemperature: {
    color: "#000000",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 2,
    lineHeight: 26,
  },

  weatherStatusSlot: {
    minHeight: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },

  // ==========================================================
  // STATUS SLOT
  //
  // Reserved minimum height keeps cells vertically aligned
  // even when no badge is displayed.
  // ==========================================================

  statusSlot: {
    minHeight: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },

  // ==========================================================
  // GENERAL CARD CONTENT
  // ==========================================================

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
    marginTop: 4,
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

  // ==========================================================
  // ICON ACCENT PANEL
  //
  // Used by: Other monitoring cards (fallback branch)
  // ==========================================================

  iconAccentPanel: {
    width: 58,
    alignSelf: "stretch",
    backgroundColor: Colors.light.color1,
    borderTopLeftRadius: 13,
    borderBottomLeftRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -12,
    marginTop: -12,
    marginBottom: -12,
    marginRight: 12,
  },

});