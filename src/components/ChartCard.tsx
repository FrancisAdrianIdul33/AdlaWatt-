import { Ionicons } from "@expo/vector-icons";

import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

import Svg, {
  Circle,
  Line,
} from "react-native-svg";

import AppText from "@/components/ui/AppText";

import { Colors } from "@/constants/colors";

import type { ForecastResult } from "@/services/forecast";

import { MonitoringData } from "@/services/monitoringService";

import {
  formatBestSunSummary,
  formatClockTime,
  formatForecastDay,
  resolveCondition,
  type WeatherSeverity,
} from "@/services/weatherConfig";

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
  description: string;
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
  forecast?: ForecastResult | null;
  forecastLoading?: boolean;
  forecastError?: string;
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

const WATT_HOURS_MIN = 0;

const WATT_HOURS_MAX = 720;

const LOW_WATT_HOURS_THRESHOLD = 144;

const LOW_VOLTAGE_THRESHOLD = 10.65;

const VOLTAGE_MIN = 9;

const VOLTAGE_MAX = 12.6;

// ============================================================
// BATTERY GAUGE ANIMATION
//
// The ring sweeps smoothly whenever the battery percentage
// changes, and while charging the gauge breathes (subtle zoom)
// with a soft pulsing glow halo in the battery color.
// ============================================================

const RING_ANIMATION_DURATION_MS = 700;

const CHARGING_PULSE_DURATION_MS = 800;

const CHARGING_SCALE_MAX = 0.04;

const CHARGING_GLOW_MIN_OPACITY = 0.12;

const CHARGING_GLOW_MAX_OPACITY = 0.4;

const CHARGING_GLOW_RADIUS_OFFSET = 3;

const CHARGING_GLOW_STROKE_OFFSET = 5;

// ============================================================
// SUN GAUGE CONFIGURATION
//
// Single-layer sun: a solid fill color driven by the solar
// status. Low = grey, Moderate = 50% yellow, High = 100%
// yellow. A smooth animated transition cross-fades between
// the three colors while the gauge stays fully colored.
//
// The color animation is driven through the Animated.Value
// listener below instead of wrapping the SVG shapes with
// Animated.createAnimatedComponent, which would leak a
// `collapsable` prop onto the DOM SVG elements on web.
// ============================================================

const SUN_RADIUS = 52;

const SUN_RAYS_STROKE = STROKE;

// Short capsule rays that float with a clear distance from the
// circle edge and stay fully inside the gauge box (no clipping).

const SUN_RAY_START = 62;

const SUN_RAY_END = 68;

const SUN_GREY = "#dcdc6d";

const SUN_MODERATE = "#EDEB44";

const SUN_HIGH = Colors.light.secondary;

const SOLAR_ANIMATION_DURATION_MS = 2000;

const SOLAR_RAYS = Array.from(
  { length: 8 },
  (_, index) => {
    const angle =
      (index * Math.PI) / 4;

    return {
      x1:
        CENTER +
        SUN_RAY_START *
          Math.cos(angle),
      y1:
        CENTER +
        SUN_RAY_START *
          Math.sin(angle),
      x2:
        CENTER +
        SUN_RAY_END *
          Math.cos(angle),
      y2:
        CENTER +
        SUN_RAY_END *
          Math.sin(angle),
    };
  }
);

// ============================================================
// SUN GAUGE HELPERS
//
// The sun color is animated by a single intensity value that
// maps 0 → grey, 0.5 → 50% yellow, 1 → 100% yellow, with
// every in-between shade resolved by color interpolation.
// ============================================================

function getSolarIntensity(
  status: string | undefined,
): number {
  if (status === "High") {
    return 1;
  }

  if (status === "Moderate") {
    return 0.5;
  }

  return 0;
}

// ============================================================
// COMPONENT
// ============================================================

export default function ChartCard({
  type,
  monitoring,
  weather,
  loading,
  forecast = null,
  forecastLoading = false,
  forecastError = "",
}: ChartCardProps) {

  // Live screen width for the forecast exact-3 fit. Read
  // unconditionally so hook order stays stable across the
  // per-type branches below.
  const { width: screenWidth } = useWindowDimensions();

  // ==========================================================
  // SUN GAUGE ANIMATION
  //
  // A single animated intensity value drives the sun color so
  // the gauge stays fully colored (no more grey/yellow layers).
  // When the solar status flips the sun cross-fades between
  // the three colors over SOLAR_ANIMATION_DURATION_MS.
  // ==========================================================

  const sunIntensity =
    useRef(
      new Animated.Value(0),
    ).current;

  const [sunColor, setSunColor] =
    useState(SUN_GREY);

  const sunColorNode =
    sunIntensity.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [
        SUN_GREY,
        SUN_MODERATE,
        SUN_HIGH,
      ],
    });

  const solarTarget =
    getSolarIntensity(
      monitoring?.solar_status,
    );

  // ==========================================================
  // BATTERY GAUGE ANIMATION
  //
  // A progress value drives the ring sweep (offset + count-up
  // percentage) and a looping pulse drives the charging "glow
  // and zoom" breathing effect. Both forward each tick into
  // React state so the plain SVG circle props animate without
  // the Animated.createAnimatedComponent web caveat used by
  // the sun gauge above.
  // ==========================================================

  const ringProgress =
    useRef(
      new Animated.Value(0),
    ).current;

  const chargingPulse =
    useRef(
      new Animated.Value(0),
    ).current;

  const [ringLevel, setRingLevel] =
    useState(0);

  const [chargingScale, setChargingScale] =
    useState(1);

  const [
    chargingGlowOpacity,
    setChargingGlowOpacity,
  ] = useState(0);

  const isCharging =
    monitoring?.battery_status ===
    "Charging";

  const ringTarget =
    Math.max(
      0,
      Math.min(
        100,
        monitoring?.battery_level ?? 0,
      ),
    );

  useEffect(() => {
    // Forward each ring tick into state so the SVG circle's
    // strokeDashoffset (and the displayed percentage) follow
    // the animated progress value.
    const listenerId =
      ringProgress.addListener(
        ({ value }) => {
          setRingLevel(value);
        },
      );

    return () =>
      ringProgress.removeListener(
        listenerId,
      );
  }, [ringProgress]);

  useEffect(() => {
    if (
      type !== "voltage" ||
      loading
    ) {
      return;
    }

    const animation =
      Animated.timing(
        ringProgress,
        {
          toValue: ringTarget,
          duration:
            RING_ANIMATION_DURATION_MS,
          easing:
            Easing.out(Easing.cubic),
          useNativeDriver: false,
        },
      );

    animation.start();

    // Cancel any in-flight sweep if the percentage flips
    // again before the transition completes.
    return () =>
      animation.stop();
  }, [
    type,
    loading,
    ringTarget,
    ringProgress,
  ]);

  useEffect(() => {
    // Forward each pulse tick into state so the gauge scale
    // and glow halo follow the looping animation.
    const listenerId =
      chargingPulse.addListener(
        ({ value }) => {
          if (!isCharging) {
            return;
          }

          setChargingScale(
            1 +
              value *
                CHARGING_SCALE_MAX,
          );

          setChargingGlowOpacity(
            CHARGING_GLOW_MIN_OPACITY +
              value *
                (CHARGING_GLOW_MAX_OPACITY -
                  CHARGING_GLOW_MIN_OPACITY),
          );
        },
      );

    return () =>
      chargingPulse.removeListener(
        listenerId,
      );
  }, [
    chargingPulse,
    isCharging,
  ]);

  useEffect(() => {
    if (
      type !== "voltage" ||
      !isCharging
    ) {
      chargingPulse.stopAnimation();

      chargingPulse.setValue(0);

      setChargingScale(1);

      setChargingGlowOpacity(0);

      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(
          chargingPulse,
          {
            toValue: 1,
            duration:
              CHARGING_PULSE_DURATION_MS,
            easing:
              Easing.inOut(Easing.ease),
            useNativeDriver: false,
          },
        ),
        Animated.timing(
          chargingPulse,
          {
            toValue: 0,
            duration:
              CHARGING_PULSE_DURATION_MS,
            easing:
              Easing.inOut(Easing.ease),
            useNativeDriver: false,
          },
        ),
      ]),
    );

    loop.start();

    // Stop breathing once charging ends or the card
    // unmounts.
    return () => {
      loop.stop();

      chargingPulse.stopAnimation();

      chargingPulse.setValue(0);

      setChargingScale(1);

      setChargingGlowOpacity(0);
    };
  }, [
    type,
    isCharging,
    chargingPulse,
  ]);

  useEffect(() => {
    // Forward each animation tick into React state so the
    // plain SVG shapes below keep their cross-fade without
    // requiring Animated-wrapped components.
    const listenerId =
      sunIntensity.addListener(() => {
        const interpolated =
          sunColorNode as unknown as {
            __getValue: () => string;
          };

        setSunColor(
          interpolated.__getValue(),
        );
      });

    return () =>
      sunIntensity.removeListener(listenerId);
  }, [
    sunIntensity,
    sunColorNode,
  ]);

  useEffect(() => {
    if (type !== "solar") {
      return;
    }

    const animation =
      Animated.timing(
        sunIntensity,
        {
          toValue: solarTarget,
          duration:
            SOLAR_ANIMATION_DURATION_MS,
          useNativeDriver: false,
        },
      );

    animation.start();

    // Cancel any in-flight transition if the status
    // flips again before the 2s fade completes.
    return () =>
      animation.stop();
  }, [
    type,
    solarTarget,
    sunIntensity,
  ]);

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

    const isLowBattery =
      level <=
      LOW_BATTERY_THRESHOLD;

    const batteryColor =
      isLowBattery
        ? Colors.light.error
        : Colors.light.primary;

    const dashOffset =
      CIRCUMFERENCE *
      (1 - ringLevel / 100);

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

    const isDodUnsafe =
      dodStatus === "Unsafe";

    // The DoD badge turns red not only when the DoD status is
    // unsafe but also whenever the battery level is low (below
    // LOW_BATTERY_THRESHOLD), because a low battery is still
    // considered under load of the depth-of-discharge rule.
    // The red badge always shows "DoD Unsafe".
    const isDodBadgeRed =
      isDodUnsafe || isLowBattery;

    const dodLabel =
      isDodBadgeRed
        ? "DoD Unsafe"
        : "DoD Safe";

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

    const isLowWattHours =
      (monitoring?.watt_hours ?? 0) <=
      LOW_WATT_HOURS_THRESHOLD;

    const isLowVoltage =
      (monitoring?.voltage ?? 0) <=
      LOW_VOLTAGE_THRESHOLD;

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
              color={Colors.light.iconAccent}
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

              <Animated.View
                style={[
                  styles.batteryPulse,
                  {
                    transform: [
                      {
                        scale: chargingScale,
                      },
                    ],
                  },
                ]}
              >

                <Svg
                  width={RING_SIZE}
                  height={RING_SIZE}
                  viewBox={
                    `0 0 ${RING_SIZE} ${RING_SIZE}`
                  }
                >

                  {/* Charging Glow Halo */}

                  <Circle
                    cx={CENTER}
                    cy={CENTER}
                    r={
                      RADIUS +
                      CHARGING_GLOW_RADIUS_OFFSET
                    }
                    stroke={batteryColor}
                    strokeWidth={
                      STROKE +
                      CHARGING_GLOW_STROKE_OFFSET
                    }
                    fill="none"
                    opacity={
                      chargingGlowOpacity
                    }
                  />

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
                      : `${Math.round(ringLevel)}%`}
                  </AppText>

                </View>

              </Animated.View>

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
                  isDodBadgeRed
                    ? styles.dodUnsafeBadge
                    : styles.dodSafeBadge,
                ]}
              >

                <AppText
                  variant="caption"
                  style={[
                    styles.dodStatusBadgeText,
                    isDodBadgeRed
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
                style={[
                  styles.batteryMetricValue,
                  isLowVoltage &&
                    styles.lowBatteryText,
                ]}
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
                  style={[
                    styles.batteryMetricValue,
                    isLowWattHours &&
                      styles.lowBatteryText,
                  ]}
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
  // Solar Input (inside the sun gauge), Timer, and the status
  // badge fill the left column. Voltage, Current, Total Energy,
  // and Solar Panel Temperature fill the right 2 × 3 grid.
  // The Temperature Monitoring card no longer exists.
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

    const solarTemperatureData =
      getCardData(
        "solar_temperature",
        monitoring,
        weather ?? null,
        loading,
      );

    // --------------------------------------------------------
    // SOLAR STATUS BADGE COLORS
    // --------------------------------------------------------

    const solarBadgeStyle =
      solarStatus === "High"
        ? styles.normalBadge
        : solarStatus === "Moderate"
        ? styles.moderateBadge
        : styles.lowBadge;

    return (
      <View
        style={[
          styles.monitorCard,
          styles.groupMonitoringCard,
        ]}
      >

        {/* ==================================================
            SOLAR HEADER / ACCENT PANEL
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
              name="sunny-outline"
              size={30}
              color={Colors.light.iconAccent}
            />

            <AppText
              variant="heading"
              style={
                styles.groupHeaderTitle
              }
            >
              Solar Monitoring
            </AppText>

          </View>

        </View>

        {/* ==================================================
            SOLAR BODY ROW
            ================================================== */}

        <View
          style={
            styles.batteryBodyRow
          }
        >

          {/* ================================================
              LEFT — SOLAR SUN GAUGE COLUMN
              ================================================ */}

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

                <Circle
                  cx={CENTER}
                  cy={CENTER}
                  r={SUN_RADIUS}
                  fill={sunColor}
                />

                {SOLAR_RAYS.map((ray) => (
                  <Line
                    key={
                      `ray-${ray.x1}-${ray.y1}`
                    }
                    x1={ray.x1}
                    y1={ray.y1}
                    x2={ray.x2}
                    y2={ray.y2}
                    stroke={sunColor}
                    strokeWidth={
                      SUN_RAYS_STROKE
                    }
                    strokeLinecap="round"
                  />
                ))}

              </Svg>

              {/* ==============================================
                  SOLAR INPUT CENTER
                  ============================================== */}

              <View
                style={
                  styles.batteryCenter
                }
              >

                <AppText
                  variant="heading"
                  style={
                    styles.batteryPercentage
                  }
                >
                  {solarInput}
                </AppText>

              </View>

            </View>

            {/* ==============================================
                TIMER
                ============================================== */}

            <AppText
              variant="caption"
              style={[
                styles.remainingText,
                styles.solarTimerText,
              ]}
            >
              Timer:{" "}
              {loading
                ? "—"
                : formatSolarTimer(
                    solarTimer,
                  )}
            </AppText>

            {/* ==============================================
                SOLAR STATUS BADGE
                ============================================== */}

            <View
              style={[
                styles.batteryStatusRow,
                styles.solarStatusRow,
              ]}
            >

              <View
                style={[
                  styles.batteryStatus,
                  solarBadgeStyle,
                ]}
              >

                <AppText
                  variant="caption"
                  style={[
                    styles.batteryStatusText,
                    solarStatus === "Moderate"
                      ? styles.darkBadgeText
                      : null,
                  ]}
                >
                  {solarStatus}
                </AppText>

              </View>

            </View>

          </View>

          {/* ================================================
              RIGHT — SOLAR 2 × 3 MEASUREMENT GRID
              ================================================ */}

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
                Voltage
              </AppText>

              <AppText
                variant="heading"
                style={
                  styles.batteryMetricValue
                }
              >
                {solarVoltage}
              </AppText>

            </View>

            {/* ==============================================
                CURRENT
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
                Current
              </AppText>

              <AppText
                variant="heading"
                style={
                  styles.batteryMetricValue
                }
              >
                {solarCurrent}
              </AppText>

            </View>

            {/* ==============================================
                TOTAL ENERGY
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
                Total Energy
              </AppText>

              <AppText
                variant="heading"
                style={
                  styles.batteryMetricValue
                }
              >
                {totalEnergy}
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
                SOLAR PANEL TEMPERATURE
                (moved from Temperature Monitoring)
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
                Solar Panel
              </AppText>

              <AppText
                variant="heading"
                style={
                  styles.batteryMetricValue
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

            {/* ==============================================
                RESERVED CELL (for future data)
                ============================================== */}

            <View
              style={
                styles.batteryMetricCell
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
  // used by Battery Monitoring and Solar Monitoring.
  // ==========================================================

  if (type === "weather") {

    const weatherData =
      getCardData(
        "weather",
        monitoring,
        weather ?? null,
        loading,
      );

    // ========================================================
    // EXACT-3 FIT
    //
    // Cell width is computed from the live screen width so
    // exactly three boxes (Today + next two days) fill the
    // strip on every screen: strip = screen - 52 (screen and
    // row padding), minus two 8px gaps, divided by three.
    // Clamped so small phones stay usable and tablets stop
    // growing, leaving the rest to the horizontal scroll.
    // ========================================================

    const forecastCellWidth = Math.min(
      108,
      Math.max(
        84,
        (screenWidth - 52 - 16) / 3
      )
    );

    const forecastSnapInterval =
      forecastCellWidth + 8;

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
              color={Colors.light.iconAccent}
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
            5-DAY FORECAST
            Pinned live Today box + scrolling upcoming days.
            Today lives here (not in a separate display above),
            so the strip starts with the current conditions.
            ================================================== */}

        <View
          style={
            styles.weatherForecastTagRow
          }
        >

          <AppText
            variant="caption"
            style={
              styles.weatherForecastTag
            }
          >
            Today
          </AppText>

        </View>

        <View
          style={
            styles.weatherForecastRow
          }
        >

          <View
            style={[
              styles.weatherForecastTodayBox,
              { width: forecastCellWidth },
            ]}
          >

            <AppText
              variant="caption"
              style={
                styles.weatherForecastWeekday
              }
            >
              {
                formatForecastDay(
                  new Date()
                ).weekday
              }
            </AppText>

            <AppText
              variant="caption"
              style={
                styles.weatherForecastDate
              }
            >
              {
                formatForecastDay(
                  new Date()
                ).date
              }
            </AppText>

            <Ionicons
              name={weatherData.icon}
              size={26}
              color={Colors.light.iconAccent}
            />

            <AppText
              variant="caption"
              style={
                styles.weatherForecastTemp
              }
            >
              {loading ? "—" : weatherData.value}
            </AppText>

            <AppText
              variant="caption"
              numberOfLines={1}
              style={
                styles.weatherForecastClass
              }
            >
              {weatherData.badge ?? ""}
            </AppText>

          </View>

          {forecastError ? (
            <View
              style={
                styles.weatherForecastErrorRow
              }
            >

              <Ionicons
                name="warning-outline"
                size={20}
                color={Colors.light.errorDark}
                style={{ marginRight: 8 }}
              />

              <AppText
                variant="caption"
                style={
                  styles.weatherForecastErrorText
                }
              >
                {forecastError}
              </AppText>

            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              snapToInterval={forecastSnapInterval}
              decelerationRate="fast"
              accessibilityRole="none"
              accessibilityLabel="Upcoming days forecast"
              style={
                styles.weatherForecastScroll
              }
              contentContainerStyle={
                styles.weatherForecastScrollContent
              }
            >

              {forecastLoading || !forecast
                ? [0, 1, 2, 3].map((key) => (
                    <View
                      key={`skeleton-${key}`}
                      style={[
                        styles.weatherForecastCell,
                        { width: forecastCellWidth },
                      ]}
                    >

                      <AppText
                        variant="caption"
                        style={
                          styles.weatherForecastTemp
                        }
                      >
                        —
                      </AppText>

                    </View>
                  ))
                : forecast.upcoming.map((day) => (
                    <View
                      key={day.date}
                      style={[
                        styles.weatherForecastCell,
                        { width: forecastCellWidth },
                      ]}
                    >

                      <AppText
                        variant="caption"
                        style={
                          styles.weatherForecastWeekday
                        }
                      >
                        {day.weekday}
                      </AppText>

                      <AppText
                        variant="caption"
                        style={
                          styles.weatherForecastDate
                        }
                      >
                        {day.dateLabel}
                      </AppText>

                      <Ionicons
                        name={
                          day.peakIcon as keyof typeof Ionicons.glyphMap
                        }
                        size={26}
                        color={Colors.light.iconAccent}
                      />

                      <AppText
                        variant="caption"
                        style={
                          styles.weatherForecastTemp
                        }
                      >
                        {`${day.tempMax}°`}

                        <AppText
                          style={
                            styles.weatherForecastTempMin
                          }
                        >
                          {`/${day.tempMin}°`}
                        </AppText>
                      </AppText>

                      <View
                        style={
                          styles.weatherForecastPopRow
                        }
                      >

                        <Ionicons
                          name="water-outline"
                          size={11}
                          color={
                            Colors.light.primary
                          }
                        />

                        <AppText
                          variant="caption"
                          style={
                            styles.weatherForecastPop
                          }
                        >
                          {`${Math.round(
                            day.popMax * 100
                          )}%`}
                        </AppText>

                      </View>

                      <AppText
                        variant="caption"
                        numberOfLines={1}
                        style={
                          styles.weatherForecastClass
                        }
                      >
                        {day.peakDescription}
                      </AppText>

                      <View
                        style={[
                          styles.weatherForecastPill,
                          day.solarOutlook ===
                          "High"
                            ? styles.weatherForecastPillHigh
                            : day.solarOutlook ===
                                "Moderate"
                              ? styles.weatherForecastPillModerate
                              : styles.weatherForecastPillLow,
                        ]}
                      >

                        <AppText
                          variant="caption"
                          style={[
                            styles.weatherForecastPillText,
                            day.solarOutlook ===
                            "High"
                              ? styles.weatherForecastPillTextHigh
                              : day.solarOutlook ===
                                  "Moderate"
                                ? styles.weatherForecastPillTextModerate
                                : styles.weatherForecastPillTextLow,
                          ]}
                        >
                          {day.solarOutlook}
                        </AppText>

                      </View>

                      {day.tempFlag ? (
                        <View
                          style={[
                            styles.weatherForecastFlag,
                            day.tempFlag === "cold"
                              ? styles.weatherForecastFlagCool
                              : styles.weatherForecastFlagHot,
                          ]}
                        >

                          <AppText
                            variant="caption"
                            style={
                              day.tempFlag ===
                              "cold"
                                ? styles.weatherForecastFlagCoolText
                                : styles.weatherForecastFlagHotText
                            }
                          >
                            {day.tempFlag === "both"
                              ? "Hot & Cool"
                              : day.tempFlag ===
                                  "hot"
                                ? "Hot"
                                : "Cool"}
                          </AppText>

                        </View>
                      ) : null}

                      {forecast.bestSunDay ===
                      day.weekday ? (
                        <AppText
                          variant="caption"
                          style={
                            styles.weatherForecastBest
                          }
                        >
                          <AppText
                            style={
                              styles.weatherForecastBestStar
                            }
                          >
                            ★
                          </AppText>
                          {" Best sun"}
                        </AppText>
                      ) : null}

                    </View>
                  ))}

            </ScrollView>
          )}

        </View>

        <View
          style={
            styles.weatherForecastFooter
          }
        >

          <View
            style={
              styles.weatherForecastLocationRow
            }
          >

            <Ionicons
              name="location-outline"
              size={14}
              color={
                Colors.light.textSecondary
              }
              style={{ marginRight: 4 }}
            />

            <AppText
              variant="caption"
              numberOfLines={1}
              style={
                styles.weatherForecastLocation
              }
            >
              {`${weatherData.label} • Updated ${
                forecast
                  ? formatClockTime(
                      new Date(
                        forecast.fetchedAt
                      )
                    )
                  : "—"
              }`}
            </AppText>

          </View>

          {forecast && !forecastError ? (
            <AppText
              variant="caption"
              style={
                styles.weatherForecastSummary
              }
            >
              {formatBestSunSummary(
                forecast.bestSunDay
              )}
            </AppText>
          ) : null}

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
    type === "solar_temperature" ||
    type === "temperature"
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

    case "voltage": {

      const clamped =
        Math.max(
          VOLTAGE_MIN,
          Math.min(
            VOLTAGE_MAX,
            monitoring?.voltage ?? 0,
          ),
        );

      return {
        icon:
          "flash-outline",

        label:
          "Voltage",

        value:
          loading
            ? "—"
            : `${clamped}V`,
      };
    }

    // ========================================================
    // WATT-HOUR
    // ========================================================

    case "watt_hour": {

      const clamped =
        Math.max(
          WATT_HOURS_MIN,
          Math.min(
            WATT_HOURS_MAX,
            monitoring?.watt_hours ?? 0,
          ),
        );

      return {
        icon:
          "battery-charging-outline",

        label:
          "Watt-hour",

        value:
          loading
            ? "—"
            : `${clamped}Wh`,
      };
    }

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

// ============================================================
// WEATHER ICON
//
// OpenWeather sends free-form descriptions (e.g. "moderate
// rain", "few clouds"), so the mapping below matches on
// keywords and always falls back to a valid icon.
// ============================================================

function getWeatherIcon(
  description: string,
): keyof typeof Ionicons.glyphMap {
  return resolveCondition(description).icon;
}

// ============================================================
// WEATHER SEVERITY
//
// Collapses any OpenWeather description into one of a small
// set of severity buckets used to pick a badge color.
// ============================================================

function getWeatherSeverity(
  description: string,
): WeatherSeverity {
  return resolveCondition(description).severity;
}

// ============================================================
// WEATHER BADGE STYLE
// ============================================================

function getWeatherBadgeStyle(
  description: string,
) {
  switch (getWeatherSeverity(description)) {
    case "clear":
      return styles.clearWeatherBadge;

    case "cloudy":
      // Few / scattered / broken clouds feel "partly".
      if (
        /partly|few|scattered|broken/.test(
          description.toLowerCase(),
        )
      ) {
        return styles.partlyCloudyWeatherBadge;
      }

      return styles.overcastWeatherBadge;

    case "fog":
      return styles.fogWeatherBadge;

    case "light":
      return styles.yellowWeatherBadge;

    case "moderate":
      return styles.orangeWeatherBadge;

    case "severe":
      return styles.redWeatherBadge;

    default:
      return styles.clearWeatherBadge;
  }
}

// ============================================================
// WEATHER BADGE TEXT STYLE
// ============================================================

function getWeatherBadgeTextStyle(
  description: string,
) {
  switch (getWeatherSeverity(description)) {
    case "clear":
      return styles.clearWeatherBadgeText;

    case "cloudy":
      // Few / scattered / broken clouds feel "partly".
      if (
        /partly|few|scattered|broken/.test(
          description.toLowerCase(),
        )
      ) {
        return styles.partlyCloudyWeatherBadgeText;
      }

      return styles.overcastWeatherBadgeText;

    case "fog":
      return styles.fogWeatherBadgeText;

    case "light":
      return styles.yellowWeatherBadgeText;

    case "moderate":
      return styles.orangeWeatherBadgeText;

    case "severe":
      return styles.redWeatherBadgeText;

    default:
      return styles.clearWeatherBadgeText;
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

  batteryPulse: {
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
    color: Colors.light.text,
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
    color: Colors.light.onPrimary,
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
  // SOLAR MONITORING COLUMN OVERRIDES
  //
  // Pushes the timer and status badge slightly further away
  // from the sun gauge (down by ~1px) without affecting the
  // battery card that shares the base styles.
  // ==========================================================

  solarTimerText: {
    marginTop: 12,
  },

  solarStatusRow: {
    marginTop: 8,
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
    color: Colors.light.text,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
    flexShrink: 1,
  },

  batteryMetricValue: {
    color: Colors.light.text,
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
    color: Colors.light.onPrimary,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    flexShrink: 1,
  },

  // ==========================================================
  // WEATHER MONITORING CARD
  //
  // Uses the same grouped layout language as the Battery and
  // Solar monitoring cards.
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
    color: Colors.light.onPrimary,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    flexShrink: 1,
  },

  // ==========================================================
  // 4-DAY FORECAST STRIP
  //
  // Pinned live Today box + horizontal upcoming-days scroll
  // sized so three boxes are visible at once. Medium type
  // scale stays readable down to ~320px widths; tabular
  // numerals stop temps jittering.
  // ==========================================================

  weatherForecastRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "stretch",
    paddingHorizontal: 10,
    paddingVertical: 8,
    columnGap: 8,
  },

  weatherForecastTagRow: {
    width: "100%",
    minHeight: 16,
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingTop: 8,
  },

  weatherForecastTag: {
    color: Colors.light.primary,
    fontSize: 11,
    fontWeight: "700",
  },

  weatherForecastTodayBox: {
    width: 88,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      Colors.glass.white,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
    rowGap: 3,
  },

  weatherForecastScroll: {
    flex: 1,
  },

  weatherForecastScrollContent: {
    columnGap: 8,
    paddingRight: 2,
    alignItems: "stretch",
  },

  weatherForecastCell: {
    width: 88,
    minHeight: 156,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      Colors.glass.white,
    borderWidth: 1.5,
    borderColor: Colors.light.secondary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
    rowGap: 3,
  },

  weatherForecastWeekday: {
    color: Colors.light.text,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 16,
  },

  weatherForecastDate: {
    color: Colors.light.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 16,
  },

  weatherForecastTemp: {
    color: Colors.light.text,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 3,
    lineHeight: 22,
    fontVariant: ["tabular-nums"],
  },

  weatherForecastTempMin: {
    color: Colors.light.textSecondary,
    fontSize: 13,
    fontWeight: "400",
  },

  weatherForecastPopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    columnGap: 2,
  },

  weatherForecastPop: {
    color: Colors.light.primary,
    fontSize: 12,
    fontWeight: "600",
  },

  weatherForecastClass: {
    color: Colors.light.textSecondary,
    fontSize: 12,
    textAlign: "center",
    textTransform: "capitalize",
  },

  weatherForecastPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center",
  },

  weatherForecastPillHigh: {
    backgroundColor: Colors.light.primary,
  },

  weatherForecastPillModerate: {
    backgroundColor: Colors.light.secondary,
  },

  weatherForecastPillLow: {
    backgroundColor: Colors.light.error,
  },

  weatherForecastPillText: {
    fontSize: 11,
    fontWeight: "700",
  },

  weatherForecastPillTextHigh: {
    color: Colors.light.onPrimary,
  },

  weatherForecastPillTextModerate: {
    color: Colors.light.text,
  },

  weatherForecastPillTextLow: {
    color: Colors.light.onPrimary,
  },

  weatherForecastFlag: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignItems: "center",
    justifyContent: "center",
  },

  weatherForecastFlagHot: {
    backgroundColor: Colors.light.warning,
  },

  weatherForecastFlagCool: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },

  weatherForecastFlagHotText: {
    color: Colors.light.text,
    fontSize: 10,
    fontWeight: "700",
  },

  weatherForecastFlagCoolText: {
    color: Colors.light.textSecondary,
    fontSize: 10,
    fontWeight: "700",
  },

  weatherForecastBest: {
    color: Colors.light.text,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },

  weatherForecastBestStar: {
    color: Colors.light.secondary,
  },

  weatherForecastErrorRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },

  weatherForecastErrorText: {
    color: Colors.light.errorDark,
    flex: 1,
  },

  weatherForecastFooter: {
    width: "100%",
    paddingHorizontal: 14,
    paddingBottom: 12,
    rowGap: 2,
  },

  weatherForecastLocationRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  weatherForecastLocation: {
    color: Colors.light.textSecondary,
    fontSize: 11,
    flex: 1,
  },

  weatherForecastSummary: {
    color: Colors.light.primary,
    fontSize: 11,
    fontWeight: "600",
  },

  // ==========================================================
  // GENERAL CARD CONTENT
  // ==========================================================

  monitorLabel: {
    color: Colors.light.text,
    textAlign: "center",
    fontWeight: "600",
    lineHeight: 17,
  },

  monitorValue: {
    color: Colors.light.text,
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
    color: Colors.light.onPrimary,
  },

  darkBadgeText: {
    color: Colors.light.text,
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
    color: Colors.light.onPrimary,
  },

  dodUnsafeBadgeText: {
    color: Colors.light.onPrimary,
  },

  // ==========================================================
  // TEMPERATURE BADGES
  // ==========================================================

  nominalTemperatureBadge: {
    backgroundColor: Colors.light.severity.nominal.bg,
    borderWidth: 1,
    borderColor: Colors.light.severity.nominal.border,
  },

  nominalTemperatureBadgeText: {
    color: Colors.light.severity.nominal.text,
  },

  elevatedTemperatureBadge: {
    backgroundColor: Colors.light.severity.elevated.bg,
    borderWidth: 1,
    borderColor: Colors.light.severity.elevated.border,
  },

  elevatedTemperatureBadgeText: {
    color: Colors.light.severity.elevated.text,
  },

  highTemperatureBadge: {
    backgroundColor: Colors.light.severity.high.bg,
    borderWidth: 1,
    borderColor: Colors.light.severity.high.border,
  },

  highTemperatureBadgeText: {
    color: Colors.light.severity.high.text,
  },

  criticalTemperatureBadge: {
    backgroundColor: Colors.light.severity.critical.bg,
    borderWidth: 1,
    borderColor: Colors.light.severity.critical.border,
  },

  criticalTemperatureBadgeText: {
    color: Colors.light.severity.critical.text,
  },

  // ==========================================================
  // WEATHER BADGES
  // ==========================================================

  // CLEAR

  clearWeatherBadge: {
    backgroundColor: Colors.light.weather.clear.bg,
    borderWidth: 1,
    borderColor: Colors.light.weather.clear.border,
  },

  clearWeatherBadgeText: {
    color: Colors.light.weather.clear.text,
  },

  // PARTLY CLOUDY

  partlyCloudyWeatherBadge: {
    backgroundColor: Colors.light.weather.partlyCloudy.bg,
    borderWidth: 1,
    borderColor: Colors.light.weather.partlyCloudy.border,
  },

  partlyCloudyWeatherBadgeText: {
    color: Colors.light.weather.partlyCloudy.text,
  },

  // OVERCAST

  overcastWeatherBadge: {
    backgroundColor: Colors.light.weather.overcast.bg,
    borderWidth: 1,
    borderColor: Colors.light.weather.overcast.border,
  },

  overcastWeatherBadgeText: {
    color: Colors.light.weather.overcast.text,
  },

  // FOG

  fogWeatherBadge: {
    backgroundColor: Colors.light.weather.fog.bg,
    borderWidth: 1,
    borderColor: Colors.light.weather.fog.border,
  },

  fogWeatherBadgeText: {
    color: Colors.light.weather.fog.text,
  },

  // PAGASA-STYLE YELLOW

  yellowWeatherBadge: {
    backgroundColor: Colors.light.weather.yellow.bg,
    borderWidth: 1,
    borderColor: Colors.light.weather.yellow.border,
  },

  yellowWeatherBadgeText: {
    color: Colors.light.weather.yellow.text,
  },

  // PAGASA-STYLE ORANGE

  orangeWeatherBadge: {
    backgroundColor: Colors.light.weather.orange.bg,
    borderWidth: 1,
    borderColor: Colors.light.weather.orange.border,
  },

  orangeWeatherBadgeText: {
    color: Colors.light.weather.orange.text,
  },

  // PAGASA-STYLE RED

  redWeatherBadge: {
    backgroundColor: Colors.light.weather.red.bg,
    borderWidth: 1,
    borderColor: Colors.light.weather.red.border,
  },

  redWeatherBadgeText: {
    color: Colors.light.weather.red.text,
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