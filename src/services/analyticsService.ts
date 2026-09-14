import { supabase } from "@/lib/supabase";

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

  cumulative_energy_input_wh:
    | number
    | null;

  cumulative_energy_output_wh:
    | number
    | null;

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
   CONSTANTS
   ============================================================ */

export const DEFAULT_DAYS = 366;

export const FREQUENCIES: ChartFrequency[] = [
  "Daily",
  "Weekly",
  "Monthly",
];

export const REPORT_FREQUENCIES:
  ReportFrequency[] = [
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
    text.includes("\n")
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
    headers.join(","),
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
          toNumber(row.voltage),
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
    headers.join(","),
  ];

  rows.forEach(
    (row) => {
      lines.push(
        [
          row.recorded_at,
          row.appliance_name ??
          "Unknown appliance",
          row.status ?? "",
          toNumber(row.wattage),
          toNumber(
            row.duration_seconds,
          ),
          toNumber(row.energy_wh),
          row.app_id ?? "",
        ]
          .map(escapeCsvValue)
          .join(","),
      );
    },
  );

  return lines.join("\n");
}

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
  if (seconds <= 0) {
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
      error:
        userError,
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
        (monitoringRows ?? []) as unknown as MonitoringHistoryRow[],
      applianceUsageHistory:
        (applianceRows ?? []) as unknown as ApplianceUsageHistoryRow[],
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
              rows[0]
                .recorded_at,
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
        toNumber(
          row.duration_seconds,
        );

      current.energyWh +=
        toNumber(
          row.energy_wh,
        );

      if (
        row.wattage !==
        null &&
        row.wattage !==
        undefined
      ) {
        current.wattages.push(
          toNumber(
            row.wattage,
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
    start: bucket.date,
    end: getNextBucketDate(
      bucket.date,
      frequency,
    ),
  };
}
