import React, {
  useMemo,
  useState,
} from "react";
import {
  StyleSheet,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AnalyticsChartCard from "@/components/AnalyticsChartCard";
import AppText from "@/components/ui/AppText";
import {
  ChartFrequency,
  groupMonitoringHistory,
  getBatteryChartData,
  getSolarChartData,
  getLoadChartData,
  getEnergyInputChartData,
  getEnergyOutputChartData,
  getTemperatureHealthData,
  getVoltageChartData,
  MonitoringHistoryRow,
} from "@/services/analyticsService";
import BatteryLevelChart from "@/components/charts/BatteryLevelChart";
import SolarLoadChart from "@/components/charts/SolarLoadChart";
import EnergyBalanceChart from "@/components/charts/EnergyBalanceChart";
import TemperatureHealthChart from "@/components/charts/TemperatureHealthChart";
import VoltageDoDChart from "@/components/charts/VoltageDoDChart";
import { ChartEmpty } from "@/components/charts/ChartBits";

/* ============================================================
   PROPS
   ============================================================ */

export interface AnalyticsChartsProps {
  monitoringHistory: MonitoringHistoryRow[];
  loading: boolean;
}

/* ============================================================
   PER-CARD FREQUENCY STATE
   ============================================================ */

function useChartFrequency(): [
  ChartFrequency,
  (frequency: ChartFrequency) => void,
] {
  return useState<ChartFrequency>(
    "Daily",
  );
}

/* ============================================================
   ANALYTICS CHARTS
   ============================================================ */

export default function AnalyticsCharts({
  monitoringHistory,
  loading,
}: AnalyticsChartsProps) {
  const [
    batteryFrequency,
    setBatteryFrequency,
  ] = useChartFrequency();

  const [
    solarFrequency,
    setSolarFrequency,
  ] = useChartFrequency();

  const [
    energyFrequency,
    setEnergyFrequency,
  ] = useChartFrequency();

  const [
    temperatureFrequency,
    setTemperatureFrequency,
  ] = useChartFrequency();

  const [
    voltageFrequency,
    setVoltageFrequency,
  ] = useChartFrequency();

  const batteryBuckets = useMemo(
    () =>
      groupMonitoringHistory(
        monitoringHistory,
        batteryFrequency,
      ),
    [monitoringHistory, batteryFrequency],
  );

  const solarBuckets = useMemo(
    () =>
      groupMonitoringHistory(
        monitoringHistory,
        solarFrequency,
      ),
    [monitoringHistory, solarFrequency],
  );

  const energyBuckets = useMemo(
    () =>
      groupMonitoringHistory(
        monitoringHistory,
        energyFrequency,
      ),
    [monitoringHistory, energyFrequency],
  );

  const temperatureBuckets = useMemo(
    () =>
      groupMonitoringHistory(
        monitoringHistory,
        temperatureFrequency,
      ),
    [monitoringHistory, temperatureFrequency],
  );

  const voltageBuckets = useMemo(
    () =>
      groupMonitoringHistory(
        monitoringHistory,
        voltageFrequency,
      ),
    [monitoringHistory, voltageFrequency],
  );

  const batteryPoints = useMemo(
    () =>
      getBatteryChartData(
        batteryBuckets,
        batteryFrequency,
      ),
    [batteryBuckets, batteryFrequency],
  );

  const solarPoints = useMemo(
    () =>
      getSolarChartData(
        solarBuckets,
        solarFrequency,
      ),
    [solarBuckets, solarFrequency],
  );

  const loadPoints = useMemo(
    () =>
      getLoadChartData(
        solarBuckets,
        solarFrequency,
      ),
    [solarBuckets, solarFrequency],
  );

  const energyInputPoints = useMemo(
    () =>
      getEnergyInputChartData(
        energyBuckets,
        energyFrequency,
      ),
    [energyBuckets, energyFrequency],
  );

  const energyOutputPoints = useMemo(
    () =>
      getEnergyOutputChartData(
        energyBuckets,
        energyFrequency,
      ),
    [energyBuckets, energyFrequency],
  );

  const temperatureCells = useMemo(
    () =>
      getTemperatureHealthData(
        temperatureBuckets,
        temperatureFrequency,
      ),
    [temperatureBuckets, temperatureFrequency],
  );

  const voltagePoints = useMemo(
    () =>
      getVoltageChartData(
        voltageBuckets,
        voltageFrequency,
      ),
    [voltageBuckets, voltageFrequency],
  );

  const batteryLevels = useMemo(
    () =>
      voltageBuckets.map((bucket) => {
        const values = bucket.rows
          .map((row) => row.battery_level)
          .filter(
            (value): value is number =>
              typeof value === "number" &&
              Number.isFinite(value),
          );

        if (values.length === 0) {
          return 0;
        }

        return (
          values.reduce(
            (sum, value) => sum + value,
            0,
          ) / values.length
        );
      }),
    [voltageBuckets],
  );

  /* ------------------------------------------------
     LOADING
  ------------------------------------------------ */

  if (loading) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <Ionicons
          name="sync-outline"
          size={18}
          color="#00A86B"
        />

        <AppText
          variant="caption"
          style={
            styles.loadingText
          }
        >
          Loading analytics...
        </AppText>
      </View>
    );
  }

  /* ------------------------------------------------
     EMPTY
  ------------------------------------------------ */

  if (monitoringHistory.length === 0) {
    return (
      <AnalyticsChartCard
        title="No Data"
        subtitle="No historical monitoring data is available for the selected date range."
        icon="bar-chart-outline"
        frequency="Daily"
        onFrequencyChange={() => {}}
      >
        <ChartEmpty message="Adjust the report date range to see analytics charts." />
      </AnalyticsChartCard>
    );
  }

  /* ------------------------------------------------
     CHARTS
  ------------------------------------------------ */

  return (
    <>
      <AnalyticsChartCard
        title="Battery Level Over Time"
        subtitle="Average battery level per period, with the 20% safety floor marked."
        icon="battery-half-outline"
        frequency={batteryFrequency}
        onFrequencyChange={
          setBatteryFrequency
        }
      >
        <BatteryLevelChart
          points={batteryPoints}
        />
      </AnalyticsChartCard>

      <AnalyticsChartCard
        title="Solar Input vs Load"
        subtitle="Solar generation versus consumption per period. Green fills show surplus, red shows deficit."
        icon="sunny-outline"
        frequency={solarFrequency}
        onFrequencyChange={
          setSolarFrequency
        }
      >
        <SolarLoadChart
          solar={solarPoints}
          load={loadPoints}
        />
      </AnalyticsChartCard>

      <AnalyticsChartCard
        title="Energy In vs Out"
        subtitle="Total energy stored versus energy drawn per period, with the net balance."
        icon="swap-vertical-outline"
        frequency={energyFrequency}
        onFrequencyChange={
          setEnergyFrequency
        }
      >
        <EnergyBalanceChart
          input={energyInputPoints}
          output={energyOutputPoints}
        />
      </AnalyticsChartCard>

      <AnalyticsChartCard
        title="Battery Temperature Health"
        subtitle="Day-by-day battery temperature status. Tap a day for details."
        icon="thermometer-outline"
        frequency={temperatureFrequency}
        onFrequencyChange={
          setTemperatureFrequency
        }
      >
        <TemperatureHealthChart
          cells={temperatureCells}
        />
      </AnalyticsChartCard>

      <AnalyticsChartCard
        title="DoD & Voltage Distribution"
        subtitle="Voltage readings across the safe band (10.65V – 12.6V), colored by depth-of-discharge status."
        icon="pulse-outline"
        frequency={voltageFrequency}
        onFrequencyChange={
          setVoltageFrequency
        }
      >
        <VoltageDoDChart
          voltage={voltagePoints}
          levels={batteryLevels}
        />
      </AnalyticsChartCard>
    </>
  );
}

/* ============================================================
   STYLES
   ============================================================ */

const styles =
  StyleSheet.create({
    loadingContainer: {
      width: "100%",
      minHeight: 42,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      marginBottom: 10,
    },

    loadingText: {
      color:
        "#454545",
    },
  });