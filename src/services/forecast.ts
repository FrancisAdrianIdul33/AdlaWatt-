import weatherJson from "@/data/weather.json";
import {
  formatApiError,
  formatForecastDay,
  formatNetworkError,
  formatTimeoutError,
  peakOfDay,
  resolveCondition,
  scoreSolarDay,
  type SolarOutlook,
  type WeatherSeverity,
} from "@/services/weatherConfig";
import { WeatherError } from "@/services/weatherForecast";

// ============================================================
// 5-DAY FORECAST FETCHER
//
// OpenWeatherMap /forecast returns 3-hour steps (~40 entries).
// This module groups them into daily summaries tuned for
// solar planning: each upcoming day reports its PEAK condition
// (most extreme present, not the majority vote), a solar
// outlook, and hot/cold flags. Today is rendered live from
// current weather, so only the upcoming days are returned.
//
// Every limit, cutoff, and message comes from weather.json.
// ============================================================

export type TempFlag =
  | "hot"
  | "cold"
  | "both"
  | null;

export interface DailyForecast {
  date: string;
  weekday: string;
  dateLabel: string;
  tempMin: number;
  tempMax: number;
  peakDescription: string;
  peakIcon: string;
  peakSeverity: WeatherSeverity;
  popMax: number;
  solarOutlook: SolarOutlook;
  tempFlag: TempFlag;
}

export interface ForecastResult {
  upcoming: DailyForecast[];
  bestSunDay: string | null;
  cityName: string;
  fetchedAt: string;
}

interface ForecastSlot {
  date: string;
  hour: number;
  temp: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  description: string;
  clouds: number;
  pop: number;
}

interface ForecastApiEntry {
  dt_txt?: unknown;
  main?: {
    temp?: unknown;
    temp_min?: unknown;
    temp_max?: unknown;
    humidity?: unknown;
  };
  weather?: {
    description?: unknown;
  }[];
  clouds?: {
    all?: unknown;
  };
  pop?: unknown;
}

interface ForecastApiResponse {
  list?: unknown;
  city?: {
    name?: unknown;
  };
}

// ============================================================
// FETCH WITH TIMEOUT
// ============================================================

async function fetchForecastResponse(
  lat: number,
  lon: number
): Promise<ForecastApiResponse> {
  const apiKey = process.env.EXPO_PUBLIC_OWM_KEY;

  if (!apiKey || apiKey.trim().length === 0) {
    throw new WeatherError(
      "missing_key",
      weatherJson.messages.errors.missing_key
    );
  }

  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    appid: apiKey,
    units: weatherJson.api.units,
  });

  const controller = new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    weatherJson.api.timeoutMs
  );

  try {
    const response = await fetch(
      `${weatherJson.api.forecastUrl}?${params.toString()}`,
      { signal: controller.signal }
    );

    if (!response.ok) {
      throw new WeatherError(
        "api",
        formatApiError(response.status)
      );
    }

    try {
      return (await response.json()) as ForecastApiResponse;
    } catch {
      throw new WeatherError(
        "invalid_response",
        weatherJson.messages.errors.invalid_json
      );
    }
  } catch (error) {
    if (error instanceof WeatherError) {
      throw error;
    }

    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      throw new WeatherError(
        "timeout",
        formatTimeoutError()
      );
    }

    throw new WeatherError(
      "network",
      formatNetworkError(
        error instanceof Error
          ? error.message
          : "Network error."
      )
    );
  } finally {
    clearTimeout(timeout);
  }
}

// ============================================================
// SLOT PARSING
// ============================================================

function toNumber(value: unknown): number | null {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : null;
}

function parseSlot(
  entry: ForecastApiEntry
): ForecastSlot | null {
  if (
    typeof entry.dt_txt !== "string" ||
    !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(
      entry.dt_txt
    )
  ) {
    return null;
  }

  const temp = toNumber(entry.main?.temp);
  const description = entry.weather?.[0]?.description;

  if (
    temp === null ||
    typeof description !== "string" ||
    description.trim().length === 0
  ) {
    return null;
  }

  const [date, time] = entry.dt_txt.split(" ");

  return {
    date,
    hour: Number(time.split(":")[0]),
    temp,
    tempMin:
      toNumber(entry.main?.temp_min) ?? temp,
    tempMax:
      toNumber(entry.main?.temp_max) ?? temp,
    humidity:
      toNumber(entry.main?.humidity) ?? 0,
    description: description.trim(),
    clouds: toNumber(entry.clouds?.all) ?? 0,
    pop: toNumber(entry.pop) ?? 0,
  };
}

// ============================================================
// DAY SUMMARY
// ============================================================

function isPrecipitation(description: string): boolean {
  const icon =
    resolveCondition(description).icon;

  return (
    icon === "rainy-outline" ||
    icon === "thunderstorm-outline" ||
    icon === "snow-outline"
  );
}

function summarizeDay(
  date: string,
  slots: ForecastSlot[]
): DailyForecast {
  const peak =
    peakOfDay(slots, (slot) => slot.hour) ??
    slots[0];

  const peakResolved = resolveCondition(
    peak.description
  );

  const clearSlots = slots.filter(
    (slot) =>
      resolveCondition(slot.description)
        .severity === "clear"
  );

  const cloudAvg =
    slots.reduce(
      (sum, slot) => sum + slot.clouds,
      0
    ) / slots.length;

  const hasRain = slots.some((slot) =>
    isPrecipitation(slot.description)
  );

  const solarOutlook = scoreSolarDay({
    clearShare: clearSlots.length / slots.length,
    cloudAvg,
    hasRain,
  });

  const tempMin = Math.min(
    ...slots.map((slot) => slot.tempMin)
  );

  const tempMax = Math.max(
    ...slots.map((slot) => slot.tempMax)
  );

  const thresholds = weatherJson.thresholds;

  const isHot = tempMax >= thresholds.hotC;
  const isCold = tempMin <= thresholds.coldC;

  const noon = new Date(`${date}T12:00:00`);

  const labels = formatForecastDay(noon);

  return {
    date,
    weekday: labels.weekday,
    dateLabel: labels.date,
    tempMin: Math.round(tempMin),
    tempMax: Math.round(tempMax),
    peakDescription: peak.description,
    peakIcon: peakResolved.icon,
    peakSeverity: peakResolved.severity,
    popMax: Math.max(
      ...slots.map((slot) => slot.pop)
    ),
    solarOutlook,
    tempFlag: isHot
      ? isCold
        ? "both"
        : "hot"
      : isCold
        ? "cold"
        : null,
  };
}

const OUTLOOK_ORDER: Record<SolarOutlook, number> = {
  High: 2,
  Moderate: 1,
  Low: 0,
};

// ============================================================
// GET FORECAST
// ============================================================

export async function getForecast(
  lat: number,
  lon: number
): Promise<ForecastResult> {
  const response = await fetchForecastResponse(
    lat,
    lon
  );

  if (!response || !Array.isArray(response.list)) {
    throw new WeatherError(
      "invalid_response",
      weatherJson.messages.errors.invalid_response
    );
  }

  const slots: ForecastSlot[] = [];

  for (const entry of response.list) {
    const slot = parseSlot(
      entry as ForecastApiEntry
    );

    if (slot) {
      slots.push(slot);
    }
  }

  if (slots.length === 0) {
    throw new WeatherError(
      "invalid_response",
      weatherJson.messages.errors.invalid_response
    );
  }

  const groups = new Map<string, ForecastSlot[]>();

  for (const slot of slots) {
    const group = groups.get(slot.date);

    if (group) {
      group.push(slot);
    } else {
      groups.set(slot.date, [slot]);
    }
  }

  const today = new Date();

  const todayKey = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;

  const upcoming = [...groups.entries()]
    .filter(([date]) => date > todayKey)
    .sort(([left], [right]) =>
      left < right ? -1 : 1
    )
    .slice(0, weatherJson.forecast.days - 1)
    .map(([date, daySlots]) =>
      summarizeDay(date, daySlots)
    );

  let bestSunDay: string | null = null;
  let bestScore = OUTLOOK_ORDER.Low;

  for (const day of upcoming) {
    const score = OUTLOOK_ORDER[day.solarOutlook];

    if (score > bestScore) {
      bestScore = score;
      bestSunDay = day.weekday;
    }
  }

  // A "best sun" marker is only meaningful when at least one
  // upcoming day beats Low.
  if (bestScore <= OUTLOOK_ORDER.Low) {
    bestSunDay = null;
  }

  const cityName =
    typeof response.city?.name === "string" &&
    response.city.name.trim().length > 0
      ? response.city.name.trim()
      : "";

  return {
    upcoming,
    bestSunDay,
    cityName,
    fetchedAt: new Date().toISOString(),
  };
}
