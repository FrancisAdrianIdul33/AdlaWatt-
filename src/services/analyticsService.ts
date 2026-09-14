import { supabase } from "@/lib/supabase";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/* ============================================================
   TYPES
   ============================================================ */

export type ChartFrequency =
  | "Daily"
  | "Weekly"
  | "Monthly";

export type ReportFrequency =
  | "Daily"
  | "Weekly"
  | "Monthly"
  | "Yearly";

export type ReportType =
  | "CSV"
  | "PDF";

export interface MonitoringHistoryRow {
  recorded_at: string;
  battery_level: number | null;
  battery_status: string | null;
  time_remaining: string | null;
  solar_input: number | null;
  solar_status: string | null;
  current_load: number | null;
  device_status: string | null;
  last_seen: string | null;
  battery_temperature: number | null;
  battery_temperature_status: string | null;
  solar_temperature: number | null;
  solar_temperature_status: string | null;
  voltage: number | null;
  watt_hours: number | null;
  cumulative_energy_input_wh: number | null;
  cumulative_energy_output_wh: number | null;
  energy_input_wh: number | null;
  energy_output_wh: number | null;
}

export interface ApplianceUsageHistoryRow {
  usage_id: number;
  user_id: string;
  app_id: number | null;
  appliance_name: string | null;
  recorded_at: string;
  status: string | null;
  wattage: number | null;
  duration_seconds: number | null;
  energy_wh: number | null;
}

export interface ChartPoint {
  value: number;
  label?: string;
}

export interface ApplianceChartItem {
  name: string;
  value: number;
  durationSeconds: number;
  energyWh: number;
}

export interface AnalyticsRange {
  start: Date;
  end: Date;
}

export interface MonitoringBucket {
  key: string;
  date: Date;
  rows: MonitoringHistoryRow[];
}

/* ============================================================
   REPORT TYPES
   ============================================================ */

export interface ReportSummary {
  sampleCount: number;

  averageBatteryLevel: number;
  minimumBatteryLevel: number;
  maximumBatteryLevel: number;

  averageSolarInput: number;
  maximumSolarInput: number;

  averageCurrentLoad: number;
  maximumCurrentLoad: number;

  averageBatteryTemperature: number;
  maximumBatteryTemperature: number;

  averageSolarTemperature: number;
  maximumSolarTemperature: number;

  totalEnergyInputWh: number;
  totalEnergyOutputWh: number;

  latestBatteryLevel: number;
  latestBatteryStatus: string;
  latestSolarInput: number;
  latestSolarStatus: string;
  latestCurrentLoad: number;

  latestBatteryTemperature: number;
  latestBatteryTemperatureStatus: string;

  latestSolarTemperature: number;
  latestSolarTemperatureStatus: string;

  latestDeviceStatus: string;
  latestTimeRemaining: string;

  totalApplianceUsageRecords: number;
  totalApplianceEnergyWh: number;
  totalApplianceDurationSeconds: number;
}

export interface ReportMonitoringRow {
  recordedAt: string;
  batteryLevel: string;
  batteryStatus: string;
  timeRemaining: string;
  solarInput: string;
  solarStatus: string;
  currentLoad: string;
  deviceStatus: string;
  batteryTemperature: string;
  batteryTemperatureStatus: string;
  solarTemperature: string;
  solarTemperatureStatus: string;
  voltage: string;
  wattHours: string;
  energyInputWh: string;
  energyOutputWh: string;
}

export interface ReportApplianceRow {
  recordedAt: string;
  appliance: string;
  status: string;
  wattage: string;
  duration: string;
  energyWh: string;
}

export interface AnalyticsReportData {
  frequency: ReportFrequency;
  range: AnalyticsRange;

  monitoringHistory: MonitoringHistoryRow[];
  applianceUsageHistory: ApplianceUsageHistoryRow[];

  monitoringRows: ReportMonitoringRow[];
  applianceRows: ReportApplianceRow[];

  summary: ReportSummary;

  topAppliances: ApplianceChartItem[];

  reportTitle: string;
  reportSubtitle: string;
}

/* ============================================================
   CONSTANTS
   ============================================================ */

export const DEFAULT_DAYS = 366;

export const FREQUENCIES: ChartFrequency[] = [
  "Daily",
  "Weekly",
  "Monthly",
];

export const REPORT_FREQUENCIES: ReportFrequency[] = [
  "Daily",
  "Weekly",
  "Monthly",
  "Yearly",
];

/* ============================================================
   BASIC DATA HELPERS
   ============================================================ */

export function toNumber(
  value: unknown,
): number {
  const numberValue =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(numberValue)
    ? numberValue
    : 0;
}

export function clamp(
  value: number,
  minimum: number,
  maximum: number,
): number {
  return Math.min(
    maximum,
    Math.max(minimum, value),
  );
}

export function average(
  values: number[],
): number {
  if (values.length === 0) {
    return 0;
  }

  return (
    values.reduce(
      (sum, value) =>
        sum + value,
      0,
    ) / values.length
  );
}

export function minimum(
  values: number[],
): number {
  if (values.length === 0) {
    return 0;
  }

  return Math.min(...values);
}

export function maximum(
  values: number[],
): number {
  if (values.length === 0) {
    return 0;
  }

  return Math.max(...values);
}

export function formatNumber(
  value: number,
  decimals = 1,
): string {
  return value.toFixed(decimals);
}

/* ============================================================
   DATE HELPERS
   ============================================================ */

export function formatDateLabel(
  date: Date,
  frequency: ChartFrequency,
): string {
  if (frequency === "Monthly") {
    return date.toLocaleDateString(
      "en-US",
      {
        month: "short",
      },
    );
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
    },
  );
}

export function formatReportDate(
  date: Date,
): string {
  return date.toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );
}

export function formatReportDateTime(
  date: Date,
): string {
  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  return date.toLocaleString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  );
}

export function getDateKey(
  date: Date,
  frequency: ChartFrequency,
): string {
  if (frequency === "Daily") {
    return [
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    ].join("-");
  }

  if (frequency === "Weekly") {
    const copy = new Date(date);

    const day =
      copy.getDay();

    const difference =
      day === 0
        ? -6
        : 1 - day;

    copy.setDate(
      copy.getDate() +
        difference,
    );

    return [
      copy.getFullYear(),
      copy.getMonth(),
      copy.getDate(),
    ].join("-");
  }

  return [
    date.getFullYear(),
    date.getMonth(),
  ].join("-");
}

export function getBucketDate(
  date: Date,
  frequency: ChartFrequency,
): Date {
  const result =
    new Date(date);

  if (frequency === "Daily") {
    result.setHours(
      0,
      0,
      0,
      0,
    );

    return result;
  }

  if (frequency === "Weekly") {
    const day =
      result.getDay();

    const difference =
      day === 0
        ? -6
        : 1 - day;

    result.setDate(
      result.getDate() +
        difference,
    );

    result.setHours(
      0,
      0,
      0,
      0,
    );

    return result;
  }

  result.setDate(1);

  result.setHours(
    0,
    0,
    0,
    0,
  );

  return result;
}

export function getNextBucketDate(
  date: Date,
  frequency: ChartFrequency,
): Date {
  const result =
    new Date(date);

  if (frequency === "Daily") {
    result.setDate(
      result.getDate() + 1,
    );
  } else if (
    frequency === "Weekly"
  ) {
    result.setDate(
      result.getDate() + 7,
    );
  } else {
    result.setMonth(
      result.getMonth() + 1,
    );
  }

  return result;
}

export function getDefaultRange():
  AnalyticsRange {
  const end =
    new Date();

  const start =
    new Date(end);

  start.setDate(
    start.getDate() -
      DEFAULT_DAYS,
  );

  return {
    start,
    end,
  };
}

export function createPresetRange(
  days: number,
): AnalyticsRange {
  const end =
    new Date();

  const start =
    new Date(end);

  start.setDate(
    start.getDate() -
      days,
  );

  return {
    start,
    end,
  };
}

/* ============================================================
   CSV AND REPORT DATA PROCESSING
   ============================================================ */

export function escapeCsvValue(
  value: unknown,
): string {
  const text =
    value === null ||
    value === undefined
      ? ""
      : String(value);

  if (
    text.includes(",") ||
    text.includes('"') ||
    text.includes("\n") ||
    text.includes("\r")
  ) {
    return `"${text.replace(
      /"/g,
      '""',
    )}"`;
  }

  return text;
}

export function createCsv(
  rows: MonitoringHistoryRow[],
): string {
  const headers = [
    "Recorded At",
    "Battery Level (%)",
    "Battery Status",
    "Time Remaining",
    "Solar Input (W)",
    "Solar Status",
    "Current Load (W)",
    "Device Status",
    "Battery Temperature (C)",
    "Battery Temperature Status",
    "Solar Temperature (C)",
    "Solar Temperature Status",
    "Voltage (V)",
    "Watt Hours",
    "Cumulative Energy Input (Wh)",
    "Cumulative Energy Output (Wh)",
    "Energy Input (Wh)",
    "Energy Output (Wh)",
  ];

  const lines = [
    headers
      .map(escapeCsvValue)
      .join(","),
  ];

  rows.forEach(
    (row) => {
      lines.push(
        [
          row.recorded_at,
          toNumber(
            row.battery_level,
          ),
          row.battery_status,
          row.time_remaining,
          toNumber(
            row.solar_input,
          ),
          row.solar_status,
          toNumber(
            row.current_load,
          ),
          row.device_status,
          toNumber(
            row.battery_temperature,
          ),
          row.battery_temperature_status,
          toNumber(
            row.solar_temperature,
          ),
          row.solar_temperature_status,
          toNumber(
            row.voltage,
          ),
          toNumber(
            row.watt_hours,
          ),
          toNumber(
            row.cumulative_energy_input_wh,
          ),
          toNumber(
            row.cumulative_energy_output_wh,
          ),
          toNumber(
            row.energy_input_wh,
          ),
          toNumber(
            row.energy_output_wh,
          ),
        ]
          .map(escapeCsvValue)
          .join(","),
      );
    },
  );

  return lines.join("\n");
}

export function createApplianceCsv(
  rows: ApplianceUsageHistoryRow[],
): string {
  const headers = [
    "Recorded At",
    "Appliance",
    "Status",
    "Wattage (W)",
    "Duration (seconds)",
    "Energy (Wh)",
    "App ID",
  ];

  const lines = [
    headers
      .map(escapeCsvValue)
      .join(","),
  ];

  rows.forEach(
    (row) => {
      lines.push(
        [
          row.recorded_at,
          row.appliance_name ??
            "Unknown appliance",
          row.status ?? "",
          toNumber(
            row.wattage,
          ),
          toNumber(
            row.duration_seconds,
          ),
          toNumber(
            row.energy_wh,
          ),
          row.app_id ?? "",
        ]
          .map(escapeCsvValue)
          .join(","),
      );
    },
  );

  return lines.join("\n");
}

/* ============================================================
   REPORT ROW FORMATTING
   ============================================================ */

export function formatMonitoringReportRows(
  rows: MonitoringHistoryRow[],
): ReportMonitoringRow[] {
  return rows.map(
    (row) => ({
      recordedAt:
        formatReportDateTime(
          new Date(
            row.recorded_at,
          ),
        ),

      batteryLevel:
        formatNumber(
          clamp(
            toNumber(
              row.battery_level,
            ),
            0,
            100,
          ),
        ),

      batteryStatus:
        row.battery_status ??
        "Unknown",

      timeRemaining:
        row.time_remaining ??
        "N/A",

      solarInput:
        formatNumber(
          Math.max(
            0,
            toNumber(
              row.solar_input,
            ),
          ),
        ),

      solarStatus:
        row.solar_status ??
        "Unknown",

      currentLoad:
        formatNumber(
          Math.max(
            0,
            toNumber(
              row.current_load,
            ),
          ),
        ),

      deviceStatus:
        row.device_status ??
        "Unknown",

      batteryTemperature:
        formatNumber(
          toNumber(
            row.battery_temperature,
          ),
        ),

      batteryTemperatureStatus:
        row.battery_temperature_status ??
        "Unknown",

      solarTemperature:
        formatNumber(
          toNumber(
            row.solar_temperature,
          ),
        ),

      solarTemperatureStatus:
        row.solar_temperature_status ??
        "Unknown",

      voltage:
        formatNumber(
          Math.max(
            0,
            toNumber(
              row.voltage,
            ),
          ),
        ),

      wattHours:
        formatNumber(
          Math.max(
            0,
            toNumber(
              row.watt_hours,
            ),
          ),
        ),

      energyInputWh:
        formatNumber(
          Math.max(
            0,
            toNumber(
              row.energy_input_wh,
            ),
          ),
        ),

      energyOutputWh:
        formatNumber(
          Math.max(
            0,
            toNumber(
              row.energy_output_wh,
            ),
          ),
        ),
    }),
  );
}

export function formatApplianceReportRows(
  rows: ApplianceUsageHistoryRow[],
): ReportApplianceRow[] {
  return rows.map(
    (row) => ({
      recordedAt:
        formatReportDateTime(
          new Date(
            row.recorded_at,
          ),
        ),

      appliance:
        row.appliance_name?.trim() ||
        "Unknown appliance",

      status:
        row.status ??
        "Unknown",

      wattage:
        formatNumber(
          Math.max(
            0,
            toNumber(
              row.wattage,
            ),
          ),
        ),

      duration:
        formatDuration(
          Math.max(
            0,
            toNumber(
              row.duration_seconds,
            ),
          ),
        ),

      energyWh:
        formatNumber(
          Math.max(
            0,
            toNumber(
              row.energy_wh,
            ),
          ),
        ),
    }),
  );
}

/* ============================================================
   REPORT SUMMARY
   ============================================================ */

function getLatestMonitoringRow(
  rows: MonitoringHistoryRow[],
): MonitoringHistoryRow | null {
  if (rows.length === 0) {
    return null;
  }

  return rows.reduce(
    (
      latest,
      current,
    ) => {
      const latestTime =
        new Date(
          latest.recorded_at,
        ).getTime();

      const currentTime =
        new Date(
          current.recorded_at,
        ).getTime();

      return currentTime >
        latestTime
        ? current
        : latest;
    },
  );
}

export function createReportSummary(
  monitoringHistory: MonitoringHistoryRow[],
  applianceUsageHistory: ApplianceUsageHistoryRow[],
): ReportSummary {
  const batteryLevels =
    monitoringHistory.map(
      (row) =>
        clamp(
          toNumber(
            row.battery_level,
          ),
          0,
          100,
        ),
    );

  const solarInputs =
    monitoringHistory.map(
      (row) =>
        Math.max(
          0,
          toNumber(
            row.solar_input,
          ),
        ),
    );

  const currentLoads =
    monitoringHistory.map(
      (row) =>
        Math.max(
          0,
          toNumber(
            row.current_load,
          ),
        ),
    );

  const batteryTemperatures =
    monitoringHistory.map(
      (row) =>
        toNumber(
          row.battery_temperature,
        ),
    );

  const solarTemperatures =
    monitoringHistory.map(
      (row) =>
        toNumber(
          row.solar_temperature,
        ),
    );

  const totalEnergyInputWh =
    monitoringHistory.reduce(
      (sum, row) =>
        sum +
        Math.max(
          0,
          toNumber(
            row.energy_input_wh,
          ),
        ),
      0,
    );

  const totalEnergyOutputWh =
    monitoringHistory.reduce(
      (sum, row) =>
        sum +
        Math.max(
          0,
          toNumber(
            row.energy_output_wh,
          ),
        ),
      0,
    );

  const totalApplianceEnergyWh =
    applianceUsageHistory.reduce(
      (sum, row) =>
        sum +
        Math.max(
          0,
          toNumber(
            row.energy_wh,
          ),
        ),
      0,
    );

  const totalApplianceDurationSeconds =
    applianceUsageHistory.reduce(
      (sum, row) =>
        sum +
        Math.max(
          0,
          toNumber(
            row.duration_seconds,
          ),
        ),
      0,
    );

  const latest =
    getLatestMonitoringRow(
      monitoringHistory,
    );

  return {
    sampleCount:
      monitoringHistory.length,

    averageBatteryLevel:
      average(
        batteryLevels,
      ),

    minimumBatteryLevel:
      minimum(
        batteryLevels,
      ),

    maximumBatteryLevel:
      maximum(
        batteryLevels,
      ),

    averageSolarInput:
      average(
        solarInputs,
      ),

    maximumSolarInput:
      maximum(
        solarInputs,
      ),

    averageCurrentLoad:
      average(
        currentLoads,
      ),

    maximumCurrentLoad:
      maximum(
        currentLoads,
      ),

    averageBatteryTemperature:
      average(
        batteryTemperatures,
      ),

    maximumBatteryTemperature:
      maximum(
        batteryTemperatures,
      ),

    averageSolarTemperature:
      average(
        solarTemperatures,
      ),

    maximumSolarTemperature:
      maximum(
        solarTemperatures,
      ),

    totalEnergyInputWh,

    totalEnergyOutputWh,

    latestBatteryLevel:
      latest
        ? clamp(
            toNumber(
              latest.battery_level,
            ),
            0,
            100,
          )
        : 0,

    latestBatteryStatus:
      latest?.battery_status ??
      "No data",

    latestSolarInput:
      latest
        ? Math.max(
            0,
            toNumber(
              latest.solar_input,
            ),
          )
        : 0,

    latestSolarStatus:
      latest?.solar_status ??
      "No data",

    latestCurrentLoad:
      latest
        ? Math.max(
            0,
            toNumber(
              latest.current_load,
            ),
          )
        : 0,

    latestBatteryTemperature:
      latest
        ? toNumber(
            latest.battery_temperature,
          )
        : 0,

    latestBatteryTemperatureStatus:
      latest?.battery_temperature_status ??
      "No data",

    latestSolarTemperature:
      latest
        ? toNumber(
            latest.solar_temperature,
          )
        : 0,

    latestSolarTemperatureStatus:
      latest?.solar_temperature_status ??
      "No data",

    latestDeviceStatus:
      latest?.device_status ??
      "No data",

    latestTimeRemaining:
      latest?.time_remaining ??
      "No data",

    totalApplianceUsageRecords:
      applianceUsageHistory.length,

    totalApplianceEnergyWh,

    totalApplianceDurationSeconds,
  };
}

/* ============================================================
   REPORT DATA PREPARATION
   ============================================================ */

export function prepareReportData(
  monitoringHistory: MonitoringHistoryRow[],
  applianceUsageHistory: ApplianceUsageHistoryRow[],
  reportFrequency: ReportFrequency,
  range: AnalyticsRange,
): AnalyticsReportData {
  const monitoringRows =
    formatMonitoringReportRows(
      monitoringHistory,
    );

  const applianceRows =
    formatApplianceReportRows(
      applianceUsageHistory,
    );

  const summary =
    createReportSummary(
      monitoringHistory,
      applianceUsageHistory,
    );

  const topAppliances =
    getApplianceChartData(
      applianceUsageHistory,
    );

  return {
    frequency:
      reportFrequency,

    range,

    monitoringHistory,

    applianceUsageHistory,

    monitoringRows,

    applianceRows,

    summary,

    topAppliances,

    reportTitle:
      "AdlaWatt Analytics Report",

    reportSubtitle:
      `${reportFrequency} report from ${formatReportDate(
        range.start,
      )} to ${formatReportDate(
        range.end,
      )}`,
  };
}

/* ============================================================
   REPORT CONTENT
   ============================================================ */

export function createAnalyticsReportContent(
  monitoringHistory: MonitoringHistoryRow[],
  applianceUsageHistory: ApplianceUsageHistoryRow[],
  reportFrequency: ReportFrequency,
  range: AnalyticsRange,
): {
  monitoringCsv: string;
  applianceCsv: string;
  reportHeader: string;
  reportContent: string;
} {
  const monitoringCsv =
    createCsv(
      monitoringHistory,
    );

  const applianceCsv =
    createApplianceCsv(
      applianceUsageHistory,
    );

  const reportHeader =
    [
      "AdlaWatt Analytics Report",
      `Frequency: ${reportFrequency}`,
      `Start Date: ${formatReportDate(
        range.start,
      )}`,
      `End Date: ${formatReportDate(
        range.end,
      )}`,
      "",
    ].join("\n");

  const reportContent =
    [
      reportHeader,
      "MONITORING HISTORY",
      monitoringCsv,
      "",
      "APPLIANCE USAGE HISTORY",
      applianceCsv,
    ].join("\n");

  return {
    monitoringCsv,
    applianceCsv,
    reportHeader,
    reportContent,
  };
}

/* ============================================================
   DURATION PROCESSING
   ============================================================ */

export function formatDuration(
  seconds: number,
): string {
  if (
    !Number.isFinite(seconds) ||
    seconds <= 0
  ) {
    return "0h 0m";
  }

  const hours =
    Math.floor(
      seconds / 3600,
    );

  const minutes =
    Math.floor(
      (seconds % 3600) /
        60,
    );

  return `${hours}h ${minutes}m`;
}

/* ============================================================
   SUPABASE ANALYTICS DATA LOADING
   ============================================================ */

export async function loadAnalyticsData(
  range: AnalyticsRange,
): Promise<{
  monitoringHistory: MonitoringHistoryRow[];
  applianceUsageHistory: ApplianceUsageHistoryRow[];
}> {
  try {
    const {
      data: {
        user,
      },
      error: userError,
    } =
      await supabase.auth.getUser();

    if (
      userError ||
      !user
    ) {
      return {
        monitoringHistory: [],
        applianceUsageHistory: [],
      };
    }

    const {
      data:
        monitoringRows,
      error:
        monitoringError,
    } =
      await supabase
        .from(
          "monitoring_history",
        )
        .select(
          [
            "recorded_at",
            "battery_level",
            "battery_status",
            "time_remaining",
            "solar_input",
            "solar_status",
            "current_load",
            "device_status",
            "last_seen",
            "battery_temperature",
            "battery_temperature_status",
            "solar_temperature",
            "solar_temperature_status",
            "voltage",
            "watt_hours",
            "cumulative_energy_input_wh",
            "cumulative_energy_output_wh",
            "energy_input_wh",
            "energy_output_wh",
          ].join(","),
        )
        .eq(
          "user_id",
          user.id,
        )
        .gte(
          "recorded_at",
          range.start.toISOString(),
        )
        .lte(
          "recorded_at",
          range.end.toISOString(),
        )
        .order(
          "recorded_at",
          {
            ascending: true,
          },
        );

    if (
      monitoringError
    ) {
      console.error(
        "Analytics monitoring history error:",
        monitoringError.message,
      );
    }

    const {
      data:
        applianceRows,
      error:
        applianceError,
    } =
      await supabase
        .from(
          "appliance_usage_history",
        )
        .select(
          [
            "usage_id",
            "user_id",
            "app_id",
            "appliance_name",
            "recorded_at",
            "status",
            "wattage",
            "duration_seconds",
            "energy_wh",
          ].join(","),
        )
        .eq(
          "user_id",
          user.id,
        )
        .gte(
          "recorded_at",
          range.start.toISOString(),
        )
        .lte(
          "recorded_at",
          range.end.toISOString(),
        )
        .order(
          "recorded_at",
          {
            ascending: true,
          },
        );

    if (
      applianceError
    ) {
      console.error(
        "Analytics appliance history error:",
        applianceError.message,
      );
    }

    return {
      monitoringHistory:
        (monitoringRows ??
          []) as unknown as MonitoringHistoryRow[],

      applianceUsageHistory:
        (applianceRows ??
          []) as unknown as ApplianceUsageHistoryRow[],
    };
  } catch (error) {
    console.error(
      "Analytics load error:",
      error,
    );

    return {
      monitoringHistory: [],
      applianceUsageHistory: [],
    };
  }
}

/* ============================================================
   MONITORING HISTORY GROUPING
   ============================================================ */

export function groupMonitoringHistory(
  monitoringHistory: MonitoringHistoryRow[],
  chartFrequency: ChartFrequency,
): MonitoringBucket[] {
  const buckets =
    new Map<
      string,
      MonitoringHistoryRow[]
    >();

  monitoringHistory.forEach(
    (row) => {
      const date =
        new Date(
          row.recorded_at,
        );

      if (
        Number.isNaN(
          date.getTime(),
        )
      ) {
        return;
      }

      const key =
        getDateKey(
          date,
          chartFrequency,
        );

      const current =
        buckets.get(key) ??
        [];

      current.push(row);

      buckets.set(
        key,
        current,
      );
    },
  );

  return Array.from(
    buckets.entries(),
  )
    .map(
      ([
        key,
        rows,
      ]) => {
        const date =
          getBucketDate(
            new Date(
              rows[0].recorded_at,
            ),
            chartFrequency,
          );

        return {
          key,
          date,
          rows,
        };
      },
    )
    .sort(
      (a, b) =>
        a.date.getTime() -
        b.date.getTime(),
    );
}

/* ============================================================
   MONITORING CHART DATA PROCESSING
   ============================================================ */

export function getBatteryChartData(
  groupedMonitoring: MonitoringBucket[],
  chartFrequency: ChartFrequency,
): ChartPoint[] {
  return groupedMonitoring.map(
    (bucket) => ({
      value: clamp(
        average(
          bucket.rows.map(
            (row) =>
              toNumber(
                row.battery_level,
              ),
          ),
        ),
        0,
        100,
      ),

      label:
        formatDateLabel(
          bucket.date,
          chartFrequency,
        ),
    }),
  );
}

export function getSolarChartData(
  groupedMonitoring: MonitoringBucket[],
  chartFrequency: ChartFrequency,
): ChartPoint[] {
  return groupedMonitoring.map(
    (bucket) => ({
      value: Math.max(
        0,
        average(
          bucket.rows.map(
            (row) =>
              toNumber(
                row.solar_input,
              ),
          ),
        ),
      ),

      label:
        formatDateLabel(
          bucket.date,
          chartFrequency,
        ),
    }),
  );
}

export function getEnergyInputChartData(
  groupedMonitoring: MonitoringBucket[],
  chartFrequency: ChartFrequency,
): ChartPoint[] {
  return groupedMonitoring.map(
    (bucket) => ({
      value: Math.max(
        0,
        bucket.rows.reduce(
          (
            sum,
            row,
          ) =>
            sum +
            toNumber(
              row.energy_input_wh,
            ),
          0,
        ),
      ),

      label:
        formatDateLabel(
          bucket.date,
          chartFrequency,
        ),
    }),
  );
}

export function getEnergyOutputChartData(
  groupedMonitoring: MonitoringBucket[],
  chartFrequency: ChartFrequency,
): ChartPoint[] {
  return groupedMonitoring.map(
    (bucket) => ({
      value: Math.max(
        0,
        bucket.rows.reduce(
          (
            sum,
            row,
          ) =>
            sum +
            toNumber(
              row.energy_output_wh,
            ),
          0,
        ),
      ),

      label:
        formatDateLabel(
          bucket.date,
          chartFrequency,
        ),
    }),
  );
}

export function getBatteryTemperatureData(
  groupedMonitoring: MonitoringBucket[],
  chartFrequency: ChartFrequency,
): ChartPoint[] {
  return groupedMonitoring.map(
    (bucket) => ({
      value:
        average(
          bucket.rows.map(
            (row) =>
              toNumber(
                row.battery_temperature,
              ),
          ),
        ),

      label:
        formatDateLabel(
          bucket.date,
          chartFrequency,
        ),
    }),
  );
}

export function getSolarTemperatureData(
  groupedMonitoring: MonitoringBucket[],
  chartFrequency: ChartFrequency,
): ChartPoint[] {
  return groupedMonitoring.map(
    (bucket) => ({
      value:
        average(
          bucket.rows.map(
            (row) =>
              toNumber(
                row.solar_temperature,
              ),
          ),
        ),

      label:
        formatDateLabel(
          bucket.date,
          chartFrequency,
        ),
    }),
  );
}

/* ============================================================
   APPLIANCE HISTORY PROCESSING
   ============================================================ */

export function getApplianceChartData(
  applianceUsageHistory: ApplianceUsageHistoryRow[],
): ApplianceChartItem[] {
  const grouped =
    new Map<
      string,
      {
        durationSeconds: number;
        energyWh: number;
        wattages: number[];
      }
    >();

  applianceUsageHistory.forEach(
    (row) => {
      const name =
        row.appliance_name?.trim() ||
        "Unknown appliance";

      const current =
        grouped.get(name) ??
        {
          durationSeconds: 0,
          energyWh: 0,
          wattages: [],
        };

      current.durationSeconds +=
        Math.max(
          0,
          toNumber(
            row.duration_seconds,
          ),
        );

      current.energyWh +=
        Math.max(
          0,
          toNumber(
            row.energy_wh,
          ),
        );

      if (
        row.wattage !==
          null &&
        row.wattage !==
          undefined
      ) {
        current.wattages.push(
          Math.max(
            0,
            toNumber(
              row.wattage,
            ),
          ),
        );
      }

      grouped.set(
        name,
        current,
      );
    },
  );

  return Array.from(
    grouped.entries(),
  )
    .map(
      ([
        name,
        values,
      ]) => ({
        name,

        value:
          values.energyWh,

        durationSeconds:
          values.durationSeconds,

        energyWh:
          values.energyWh,
      }),
    )
    .sort(
      (a, b) =>
        b.energyWh -
        a.energyWh,
    )
    .slice(0, 8);
}

/* ============================================================
   ANALYTICS RANGE PROCESSING
   ============================================================ */

export function getChartLimits(
  solarChartData: ChartPoint[],
  energyInputChartData: ChartPoint[],
  energyOutputChartData: ChartPoint[],
  batteryTemperatureData: ChartPoint[],
  solarTemperatureData: ChartPoint[],
): {
  solarMax: number;
  energyInputMax: number;
  temperatureMax: number;
} {
  const solarMax =
    Math.max(
      100,
      ...solarChartData.map(
        (item) =>
          item.value,
      ),
    );

  const energyInputMax =
    Math.max(
      10,
      ...energyInputChartData.map(
        (item) =>
          item.value,
      ),
      ...energyOutputChartData.map(
        (item) =>
          item.value,
      ),
    );

  const temperatureMax =
    Math.max(
      40,
      ...batteryTemperatureData.map(
        (item) =>
          item.value,
      ),
      ...solarTemperatureData.map(
        (item) =>
          item.value,
      ),
    );

  return {
    solarMax,
    energyInputMax,
    temperatureMax,
  };
}

/* ============================================================
   NEXT BUCKET HELPER
   ============================================================ */

export function getBucketRange(
  bucket: MonitoringBucket,
  frequency: ChartFrequency,
): AnalyticsRange {
  return {
    start:
      bucket.date,

    end:
      getNextBucketDate(
        bucket.date,
        frequency,
      ),
  };
}

/* ============================================================
   REPORT CSV GENERATION
   ============================================================ */

/**
 * Creates the complete AdlaWatt CSV report.
 *
 * CSV is used instead of pretending to create a native .xlsx file.
 * Excel, Google Sheets, and other spreadsheet applications can
 * open the resulting CSV file directly.
 */
export function generateAdlaWattCsv(
  reportData: AnalyticsReportData,
): string {
  const summaryHeaders = [
    "Metric",
    "Value",
  ];

  const summaryRows = [
    [
      "Report Frequency",
      reportData.frequency,
    ],

    [
      "Start Date",
      formatReportDate(
        reportData.range.start,
      ),
    ],

    [
      "End Date",
      formatReportDate(
        reportData.range.end,
      ),
    ],

    [
      "Monitoring Records",
      reportData.summary.sampleCount,
    ],

    [
      "Average Battery Level (%)",
      formatNumber(
        reportData.summary
          .averageBatteryLevel,
      ),
    ],

    [
      "Minimum Battery Level (%)",
      formatNumber(
        reportData.summary
          .minimumBatteryLevel,
      ),
    ],

    [
      "Maximum Battery Level (%)",
      formatNumber(
        reportData.summary
          .maximumBatteryLevel,
      ),
    ],

    [
      "Average Solar Input (W)",
      formatNumber(
        reportData.summary
          .averageSolarInput,
      ),
    ],

    [
      "Maximum Solar Input (W)",
      formatNumber(
        reportData.summary
          .maximumSolarInput,
      ),
    ],

    [
      "Average Current Load (W)",
      formatNumber(
        reportData.summary
          .averageCurrentLoad,
      ),
    ],

    [
      "Maximum Current Load (W)",
      formatNumber(
        reportData.summary
          .maximumCurrentLoad,
      ),
    ],

    [
      "Average Battery Temperature (C)",
      formatNumber(
        reportData.summary
          .averageBatteryTemperature,
      ),
    ],

    [
      "Maximum Battery Temperature (C)",
      formatNumber(
        reportData.summary
          .maximumBatteryTemperature,
      ),
    ],

    [
      "Average Solar Temperature (C)",
      formatNumber(
        reportData.summary
          .averageSolarTemperature,
      ),
    ],

    [
      "Maximum Solar Temperature (C)",
      formatNumber(
        reportData.summary
          .maximumSolarTemperature,
      ),
    ],

    [
      "Total Energy Input (Wh)",
      formatNumber(
        reportData.summary
          .totalEnergyInputWh,
      ),
    ],

    [
      "Total Energy Output (Wh)",
      formatNumber(
        reportData.summary
          .totalEnergyOutputWh,
      ),
    ],

    [
      "Appliance Usage Records",
      reportData.summary
        .totalApplianceUsageRecords,
    ],

    [
      "Total Appliance Energy (Wh)",
      formatNumber(
        reportData.summary
          .totalApplianceEnergyWh,
      ),
    ],

    [
      "Total Appliance Duration",
      formatDuration(
        reportData.summary
          .totalApplianceDurationSeconds,
      ),
    ],
  ];

  const monitoringHeaders = [
    "Recorded At",
    "Battery Level (%)",
    "Battery Status",
    "Time Remaining",
    "Solar Input (W)",
    "Solar Status",
    "Current Load (W)",
    "Device Status",
    "Battery Temperature (C)",
    "Battery Temperature Status",
    "Solar Temperature (C)",
    "Solar Temperature Status",
    "Voltage (V)",
    "Watt Hours",
    "Energy Input (Wh)",
    "Energy Output (Wh)",
  ];

  const monitoringCsvRows =
    reportData.monitoringRows.map(
      (row) => [
        row.recordedAt,
        row.batteryLevel,
        row.batteryStatus,
        row.timeRemaining,
        row.solarInput,
        row.solarStatus,
        row.currentLoad,
        row.deviceStatus,
        row.batteryTemperature,
        row.batteryTemperatureStatus,
        row.solarTemperature,
        row.solarTemperatureStatus,
        row.voltage,
        row.wattHours,
        row.energyInputWh,
        row.energyOutputWh,
      ],
    );

  const applianceHeaders = [
    "Recorded At",
    "Appliance",
    "Status",
    "Wattage (W)",
    "Duration",
    "Energy (Wh)",
  ];

  const applianceCsvRows =
    reportData.applianceRows.map(
      (row) => [
        row.recordedAt,
        row.appliance,
        row.status,
        row.wattage,
        row.duration,
        row.energyWh,
      ],
    );

  const topApplianceHeaders = [
    "Appliance",
    "Total Energy (Wh)",
    "Total Duration",
  ];

  const topApplianceRows =
    reportData.topAppliances.map(
      (item) => [
        item.name,
        formatNumber(
          item.energyWh,
        ),
        formatDuration(
          item.durationSeconds,
        ),
      ],
    );

  const sections: (string | number)[][] = [];

  sections.push(
    [
      reportData.reportTitle,
    ],
    [
      reportData.reportSubtitle,
    ],
    [],
    summaryHeaders,
    ...summaryRows,
    [],
    [
      "MONITORING HISTORY",
    ],
    monitoringHeaders,
    ...monitoringCsvRows,
    [],
    [
      "APPLIANCE USAGE HISTORY",
    ],
    applianceHeaders,
    ...applianceCsvRows,
    [],
    [
      "APPLIANCE ENERGY SUMMARY",
    ],
    topApplianceHeaders,
    ...topApplianceRows,
  );

  return sections
    .map((row) =>
      row
        .map(
          escapeCsvValue,
        )
        .join(","),
    )
    .join("\n");
}

/* ============================================================
   PDF HELPERS
   ============================================================ */

function getPdfStatusColor(
  status: string,
): [number, number, number] {
  const normalized =
    status
      .trim()
      .toLowerCase();

  if (
    normalized.includes(
      "alarming",
    ) ||
    normalized.includes(
      "offline",
    )
  ) {
    return [198, 40, 40];
  }

  if (
    normalized.includes(
      "moderate",
    )
  ) {
    return [245, 158, 11];
  }

  if (
    normalized.includes(
      "charging",
    ) ||
    normalized.includes(
      "online",
    ) ||
    normalized.includes(
      "normal",
    ) ||
    normalized.includes(
      "high",
    )
  ) {
    return [22, 163, 74];
  }

  return [100, 116, 139];
}

function addPdfStatusBox(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  const statusColor =
    getPdfStatusColor(
      value,
    );

  doc.setFillColor(
    248,
    250,
    252,
  );

  doc.setDrawColor(
    statusColor[0],
    statusColor[1],
    statusColor[2],
  );

  doc.setLineWidth(
    0.6,
  );

  doc.roundedRect(
    x,
    y,
    width,
    height,
    3,
    3,
    "FD",
  );

  doc.setFont(
    "helvetica",
    "normal",
  );

  doc.setFontSize(
    8,
  );

  doc.setTextColor(
    100,
    116,
    139,
  );

  doc.text(
    label,
    x + 5,
    y + 7,
  );

  doc.setFont(
    "helvetica",
    "bold",
  );

  doc.setFontSize(
    11,
  );

  doc.setTextColor(
    statusColor[0],
    statusColor[1],
    statusColor[2],
  );

  doc.text(
    value,
    x + 5,
    y + 15,
  );
}

function addPdfSectionTitle(
  doc: jsPDF,
  title: string,
  y: number,
): number {
  doc.setFont(
    "helvetica",
    "bold",
  );

  doc.setFontSize(
    12,
  );

  doc.setTextColor(
    31,
    41,
    55,
  );

  doc.text(
    title,
    18,
    y,
  );

  return y + 7;
}

function addPdfFooter(
  doc: jsPDF,
): void {
  const pageCount =
    doc.getNumberOfPages();

  const pageWidth =
    doc.internal.pageSize.getWidth();

  const pageHeight =
    doc.internal.pageSize.getHeight();

  for (
    let page = 1;
    page <= pageCount;
    page += 1
  ) {
    doc.setPage(page);

    doc.setFillColor(
      31,
      41,
      55,
    );

    doc.rect(
      0,
      pageHeight - 14,
      pageWidth,
      14,
      "F",
    );

    doc.setFont(
      "helvetica",
      "normal",
    );

    doc.setFontSize(
      7,
    );

    doc.setTextColor(
      255,
      255,
      255,
    );

    doc.text(
      "AdlaWatt Analytics Report",
      18,
      pageHeight - 6,
    );

    doc.text(
      `Page ${page} of ${pageCount}`,
      pageWidth - 18,
      pageHeight - 6,
      {
        align: "right",
      },
    );
  }
}

/* ============================================================
   PDF REPORT GENERATION
   ============================================================ */

/**
 * Generates the actual PDF document.
 *
 * The returned jsPDF instance can be saved/exported by the
 * calling layer using the project's preferred Expo file/sharing
 * implementation.
 */
export function generateAdlaWattPdf(
  reportData: AnalyticsReportData,
): jsPDF {
  const doc =
    new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

  const pageWidth =
    doc.internal.pageSize.getWidth();

  const pageHeight =
    doc.internal.pageSize.getHeight();

  /* ==========================================================
     PDF DESIGN AREA

     THIS IS THE MAIN AREA TO MODIFY LATER WHEN WE DESIGN THE
     FINAL ADLAWATT PDF VISUAL FORMAT.

     The data preparation, calculations, validation, filtering,
     and report structure should remain separate from this
     presentation layer.
     ========================================================== */

  /* ----------------------------------------------------------
     HEADER
     ---------------------------------------------------------- */

  doc.setFillColor(
    0,
    168,
    107,
  );

  doc.rect(
    0,
    0,
    pageWidth,
    30,
    "F",
  );

  doc.setFillColor(
    0,
    128,
    82,
  );

  doc.rect(
    0,
    27,
    pageWidth,
    3,
    "F",
  );

  doc.setFont(
    "helvetica",
    "bold",
  );

  doc.setFontSize(
    19,
  );

  doc.setTextColor(
    255,
    255,
    255,
  );

  doc.text(
    reportData.reportTitle,
    18,
    13,
  );

  doc.setFont(
    "helvetica",
    "normal",
  );

  doc.setFontSize(
    9,
  );

  doc.text(
    reportData.reportSubtitle,
    18,
    21,
  );

  /* ----------------------------------------------------------
     REPORT INFORMATION
     ---------------------------------------------------------- */

  let currentY = 39;

  doc.setFont(
    "helvetica",
    "bold",
  );

  doc.setFontSize(
    10,
  );

  doc.setTextColor(
    31,
    41,
    55,
  );

  doc.text(
    "REPORT INFORMATION",
    18,
    currentY,
  );

  currentY += 7;

  doc.setFont(
    "helvetica",
    "normal",
  );

  doc.setFontSize(
    9,
  );

  doc.setTextColor(
    71,
    85,
    105,
  );

  doc.text(
    `Frequency: ${reportData.frequency}`,
    18,
    currentY,
  );

  doc.text(
    `Period: ${formatReportDate(
      reportData.range.start,
    )} - ${formatReportDate(
      reportData.range.end,
    )}`,
    110,
    currentY,
  );

  currentY += 13;

  /* ----------------------------------------------------------
     SYSTEM SUMMARY
     ---------------------------------------------------------- */

  currentY =
    addPdfSectionTitle(
      doc,
      "SYSTEM SUMMARY",
      currentY,
    );

  const boxGap = 5;

  const boxWidth =
    (pageWidth -
      36 -
      boxGap * 2) /
    3;

  const boxHeight = 23;

  addPdfStatusBox(
    doc,
    "Battery Level",
    `${formatNumber(
      reportData.summary
        .latestBatteryLevel,
    )}%`,
    18,
    currentY,
    boxWidth,
    boxHeight,
  );

  addPdfStatusBox(
    doc,
    "Solar Input",
    `${formatNumber(
      reportData.summary
        .latestSolarInput,
    )} W`,
    18 +
      boxWidth +
      boxGap,
    currentY,
    boxWidth,
    boxHeight,
  );

  addPdfStatusBox(
    doc,
    "Current Load",
    `${formatNumber(
      reportData.summary
        .latestCurrentLoad,
    )} W`,
    18 +
      (boxWidth +
        boxGap) *
        2,
    currentY,
    boxWidth,
    boxHeight,
  );

  currentY +=
    boxHeight +
    7;

  addPdfStatusBox(
    doc,
    "Battery Status",
    reportData.summary
      .latestBatteryStatus,
    18,
    currentY,
    boxWidth,
    boxHeight,
  );

  addPdfStatusBox(
    doc,
    "Solar Status",
    reportData.summary
      .latestSolarStatus,
    18 +
      boxWidth +
      boxGap,
    currentY,
    boxWidth,
    boxHeight,
  );

  addPdfStatusBox(
    doc,
    "Device Status",
    reportData.summary
      .latestDeviceStatus,
    18 +
      (boxWidth +
        boxGap) *
        2,
    currentY,
    boxWidth,
    boxHeight,
  );

  currentY +=
    boxHeight +
    10;

  /* ----------------------------------------------------------
     ENERGY SUMMARY
     ---------------------------------------------------------- */

  currentY =
    addPdfSectionTitle(
      doc,
      "ENERGY SUMMARY",
      currentY,
    );

  autoTable(doc, {
    startY: currentY,

    head: [
      [
        "Metric",
        "Value",
      ],
    ],

    body: [
      [
        "Total Energy Input",
        `${formatNumber(
          reportData.summary
            .totalEnergyInputWh,
        )} Wh`,
      ],

      [
        "Total Energy Output",
        `${formatNumber(
          reportData.summary
            .totalEnergyOutputWh,
        )} Wh`,
      ],

      [
        "Average Solar Input",
        `${formatNumber(
          reportData.summary
            .averageSolarInput,
        )} W`,
      ],

      [
        "Average Current Load",
        `${formatNumber(
          reportData.summary
            .averageCurrentLoad,
        )} W`,
      ],
    ],

    theme: "grid",

    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 3,
      textColor: [
        31,
        41,
        55,
      ],
    },

    headStyles: {
      fillColor: [
        0,
        168,
        107,
      ],
      textColor: [
        255,
        255,
        255,
      ],
      fontStyle: "bold",
    },

    alternateRowStyles: {
      fillColor: [
        248,
        250,
        252,
      ],
    },

    margin: {
      left: 18,
      right: 18,
    },
  });

  currentY =
    (doc as unknown as {
      lastAutoTable?: {
        finalY?: number;
      };
    }).lastAutoTable
      ?.finalY ??
    currentY + 30;

  currentY += 10;

  /* ----------------------------------------------------------
     TEMPERATURE SUMMARY
     ---------------------------------------------------------- */

  currentY =
    addPdfSectionTitle(
      doc,
      "TEMPERATURE SUMMARY",
      currentY,
    );

  autoTable(doc, {
    startY: currentY,

    head: [
      [
        "Temperature Metric",
        "Average",
        "Maximum",
        "Latest",
        "Status",
      ],
    ],

    body: [
      [
        "Battery Temperature",
        `${formatNumber(
          reportData.summary
            .averageBatteryTemperature,
        )} C`,
        `${formatNumber(
          reportData.summary
            .maximumBatteryTemperature,
        )} C`,
        `${formatNumber(
          reportData.summary
            .latestBatteryTemperature,
        )} C`,
        reportData.summary
          .latestBatteryTemperatureStatus,
      ],

      [
        "Solar Temperature",
        `${formatNumber(
          reportData.summary
            .averageSolarTemperature,
        )} C`,
        `${formatNumber(
          reportData.summary
            .maximumSolarTemperature,
        )} C`,
        `${formatNumber(
          reportData.summary
            .latestSolarTemperature,
        )} C`,
        reportData.summary
          .latestSolarTemperatureStatus,
      ],
    ],

    theme: "grid",

    styles: {
      font: "helvetica",
      fontSize: 7.5,
      cellPadding: 2.8,
      textColor: [
        31,
        41,
        55,
      ],
    },

    headStyles: {
      fillColor: [
        0,
        168,
        107,
      ],
      textColor: [
        255,
        255,
        255,
      ],
      fontStyle: "bold",
    },

    alternateRowStyles: {
      fillColor: [
        248,
        250,
        252,
      ],
    },

    margin: {
      left: 18,
      right: 18,
    },
  });

  currentY =
    (doc as unknown as {
      lastAutoTable?: {
        finalY?: number;
      };
    }).lastAutoTable
      ?.finalY ??
    currentY + 30;

  currentY += 10;

  /* ----------------------------------------------------------
     APPLIANCE ENERGY SUMMARY
     ---------------------------------------------------------- */

  if (
    currentY >
    pageHeight - 80
  ) {
    doc.addPage();
    currentY = 20;
  }

  currentY =
    addPdfSectionTitle(
      doc,
      "APPLIANCE ENERGY SUMMARY",
      currentY,
    );

  if (
    reportData.topAppliances.length >
    0
  ) {
    autoTable(doc, {
      startY: currentY,

      head: [
        [
          "Appliance",
          "Energy (Wh)",
          "Duration",
        ],
      ],

      body:
        reportData.topAppliances.map(
          (item) => [
            item.name,
            formatNumber(
              item.energyWh,
            ),
            formatDuration(
              item.durationSeconds,
            ),
          ],
        ),

      theme: "grid",

      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 3,
        textColor: [
          31,
          41,
          55,
        ],
      },

      headStyles: {
        fillColor: [
          0,
          168,
          107,
        ],
        textColor: [
          255,
          255,
          255,
        ],
        fontStyle: "bold",
      },

      alternateRowStyles: {
        fillColor: [
          248,
          250,
          252,
        ],
      },

      margin: {
        left: 18,
        right: 18,
      },
    });

    currentY =
      (doc as unknown as {
        lastAutoTable?: {
          finalY?: number;
        };
      }).lastAutoTable
        ?.finalY ??
      currentY + 30;
  } else {
    doc.setFont(
      "helvetica",
      "normal",
    );

    doc.setFontSize(
      8,
    );

    doc.setTextColor(
      100,
      116,
      139,
    );

    doc.text(
      "No appliance usage data available for this report period.",
      18,
      currentY + 5,
    );

    currentY += 14;
  }

  currentY += 10;

  /* ----------------------------------------------------------
     MONITORING HISTORY
     ---------------------------------------------------------- */

  if (
    currentY >
    pageHeight - 70
  ) {
    doc.addPage();
    currentY = 20;
  }

  currentY =
    addPdfSectionTitle(
      doc,
      "MONITORING HISTORY",
      currentY,
    );

  if (
    reportData.monitoringRows.length >
    0
  ) {
    autoTable(doc, {
      startY: currentY,

      head: [
        [
          "Recorded At",
          "Battery %",
          "Battery",
          "Solar W",
          "Load W",
          "Device",
          "Battery C",
          "Solar C",
        ],
      ],

      body:
        reportData.monitoringRows.map(
          (row) => [
            row.recordedAt,
            row.batteryLevel,
            row.batteryStatus,
            row.solarInput,
            row.currentLoad,
            row.deviceStatus,
            row.batteryTemperature,
            row.solarTemperature,
          ],
        ),

      theme: "grid",

      styles: {
        font: "helvetica",
        fontSize: 6.5,
        cellPadding: 2,
        overflow: "linebreak",
        textColor: [
          31,
          41,
          55,
        ],
      },

      headStyles: {
        fillColor: [
          0,
          168,
          107,
        ],
        textColor: [
          255,
          255,
          255,
        ],
        fontStyle: "bold",
        fontSize: 6.5,
      },

      alternateRowStyles: {
        fillColor: [
          248,
          250,
          252,
        ],
      },

      columnStyles: {
        0: {
          cellWidth: 25,
        },
        1: {
          cellWidth: 15,
        },
        2: {
          cellWidth: 20,
        },
        3: {
          cellWidth: 15,
        },
        4: {
          cellWidth: 15,
        },
        5: {
          cellWidth: 18,
        },
        6: {
          cellWidth: 18,
        },
        7: {
          cellWidth: 18,
        },
      },

      margin: {
        left: 18,
        right: 18,
        bottom: 20,
      },

      didParseCell: (
        hookData,
      ) => {
        if (
          hookData.section ===
            "body" &&
          hookData.column.index === 2
        ) {
          const status =
            String(
              hookData.cell.raw ??
                "",
            );

          const rgb =
            getPdfStatusColor(
              status,
            );

          hookData.cell.styles.textColor =
            rgb;
        }
      },
    });
  } else {
    doc.setFont(
      "helvetica",
      "normal",
    );

    doc.setFontSize(
      8,
    );

    doc.setTextColor(
      100,
      116,
      139,
    );

    doc.text(
      "No monitoring history available for this report period.",
      18,
      currentY + 5,
    );
  }

  /* ----------------------------------------------------------
     APPLIANCE USAGE HISTORY
     ---------------------------------------------------------- */

  if (
    reportData.applianceRows.length >
    0
  ) {
    doc.addPage();

    currentY = 20;

    currentY =
      addPdfSectionTitle(
        doc,
        "APPLIANCE USAGE HISTORY",
        currentY,
      );

    autoTable(doc, {
      startY: currentY,

      head: [
        [
          "Recorded At",
          "Appliance",
          "Status",
          "Wattage W",
          "Duration",
          "Energy Wh",
        ],
      ],

      body:
        reportData.applianceRows.map(
          (row) => [
            row.recordedAt,
            row.appliance,
            row.status,
            row.wattage,
            row.duration,
            row.energyWh,
          ],
        ),

      theme: "grid",

      styles: {
        font: "helvetica",
        fontSize: 7,
        cellPadding: 2.5,
        overflow: "linebreak",
        textColor: [
          31,
          41,
          55,
        ],
      },

      headStyles: {
        fillColor: [
          0,
          168,
          107,
        ],
        textColor: [
          255,
          255,
          255,
        ],
        fontStyle: "bold",
      },

      alternateRowStyles: {
        fillColor: [
          248,
          250,
          252,
        ],
      },

      margin: {
        left: 18,
        right: 18,
        bottom: 20,
      },
    });
  }

  /* ----------------------------------------------------------
     FOOTER
     ---------------------------------------------------------- */

  addPdfFooter(
    doc,
  );

  return doc;
}

/* ============================================================
   REPORT FILE CONTENT HELPERS
   ============================================================ */

/**
 * Returns a filename-safe date in YYYY-MM-DD form.
 */
export function getReportDateFilename(
  date: Date = new Date(),
): string {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1,
    ).padStart(
      2,
      "0",
    );

  const day =
    String(
      date.getDate(),
    ).padStart(
      2,
      "0",
    );

  return `${year}-${month}-${day}`;
}

/**
 * Returns the recommended CSV filename.
 */
export function getCsvReportFilename(
  reportData: AnalyticsReportData,
): string {
  return `adlawatt_${reportData.frequency.toLowerCase()}_report_${getReportDateFilename()}.csv`;
}

/**
 * Returns the recommended PDF filename.
 */
export function getPdfReportFilename(
  reportData: AnalyticsReportData,
): string {
  return `adlawatt_${reportData.frequency.toLowerCase()}_report_${getReportDateFilename()}.pdf`;
}

/* ============================================================
   COMPLETE REPORT BUILDERS
   ============================================================ */

/**
 * Loads the selected period and prepares the complete report.
 *
 * This is the main data-processing entry point for Analytics.
 */
export async function buildAnalyticsReport(
  reportFrequency: ReportFrequency,
  range: AnalyticsRange,
): Promise<AnalyticsReportData> {
  const {
    monitoringHistory,
    applianceUsageHistory,
  } =
    await loadAnalyticsData(
      range,
    );

  return prepareReportData(
    monitoringHistory,
    applianceUsageHistory,
    reportFrequency,
    range,
  );
}

/**
 * Builds a complete CSV report from the selected period.
 */
export async function buildCsvReport(
  reportFrequency: ReportFrequency,
  range: AnalyticsRange,
): Promise<{
  csv: string;
  filename: string;
  reportData: AnalyticsReportData;
}> {
  const reportData =
    await buildAnalyticsReport(
      reportFrequency,
      range,
    );

  const csv =
    generateAdlaWattCsv(
      reportData,
    );

  return {
    csv,

    filename:
      getCsvReportFilename(
        reportData,
      ),

    reportData,
  };
}

/**
 * Builds a complete PDF report from the selected period.
 */
export async function buildPdfReport(
  reportFrequency: ReportFrequency,
  range: AnalyticsRange,
): Promise<{
  pdf: jsPDF;
  filename: string;
  reportData: AnalyticsReportData;
}> {
  const reportData =
    await buildAnalyticsReport(
      reportFrequency,
      range,
    );

  const pdf =
    generateAdlaWattPdf(
      reportData,
    );

  return {
    pdf,

    filename:
      getPdfReportFilename(
        reportData,
      ),

    reportData,
  };
}