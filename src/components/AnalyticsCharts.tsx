import React, {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import AnalyticsChartCard from "@/components/AnalyticsChartCard";
import {
  ChartAreaFallback,
  ChartEmpty,
} from "@/components/charts/ChartBits";
import {
  BatteryLevelChart,
  SolarLoadChart,
  EnergyBalanceChart,
  TemperatureHealthChart,
  VoltageDoDChart,
  warmUpCanvasKit,
} from "@/components/charts/lazyCharts";
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
   CARD BODY
   Card shells always render; only the interior changes:
     - data fetching  -> loading placeholder
     - no data        -> empty message
     - data ready     -> lazy-loaded Skia chart
   ============================================================ */

function ChartCardBody({
  loading,
  hasData,
  children,
}: {
  loading: boolean;
  hasData: boolean;
  children: React.ReactNode;
}) {
  if (loading) {
    return (
      <ChartAreaFallback label="Loading analytics..." />
    );
  }

  if (!hasData) {
    return (
      <ChartEmpty message="No historical data is available for the selected date range." />
    );
  }

  return (
    <Suspense
      fallback={
        <ChartAreaFallback label="Loading chart..." />
      }
    >
      {children}
    </Suspense>
  );
}

/* ============================================================
   ANALYTICS CHARTS
   ============================================================ */

export default function AnalyticsCharts({
  monitoringHistory,
  loading,
}: AnalyticsChartsProps) {
  useEffect(() => {
    warmUpCanvasKit();
  }, []);

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

  const hasData =
    monitoringHistory.length > 0;

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
        <ChartCardBody
          loading={loading}
          hasData={hasData}
        >
          <BatteryLevelChart
            points={batteryPoints}
          />
        </ChartCardBody>
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
        <ChartCardBody
          loading={loading}
          hasData={hasData}
        >
          <SolarLoadChart
            solar={solarPoints}
            load={loadPoints}
          />
        </ChartCardBody>
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
        <ChartCardBody
          loading={loading}
          hasData={hasData}
        >
          <EnergyBalanceChart
            input={energyInputPoints}
            output={energyOutputPoints}
          />
        </ChartCardBody>
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
        <ChartCardBody
          loading={loading}
          hasData={hasData}
        >
          <TemperatureHealthChart
            cells={temperatureCells}
          />
        </ChartCardBody>
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
        <ChartCardBody
          loading={loading}
          hasData={hasData}
        >
          <VoltageDoDChart
            voltage={voltagePoints}
            levels={batteryLevels}
          />
        </ChartCardBody>
      </AnalyticsChartCard>
    </>
  );
}