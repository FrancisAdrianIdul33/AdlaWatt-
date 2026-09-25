import * as Location from "expo-location";

import weatherJson from "@/data/weather.json";
import {
  formatApiError,
  formatCoordFallback,
  formatNetworkError,
  formatTimeoutError,
  roundTemperature,
} from "@/services/weatherConfig";

// ============================================================
// OPENWEATHER WEATHER FETCHER
//
// Pure logic — no UI, no hooks, no components.
//
// Flow:
//   1. Validate the OpenWeather API key.
//   2. Request foreground location permission.
//   3. Read the current GPS coordinates (balanced accuracy).
//   4. Call OpenWeatherMap Current Weather:
//      /data/2.5/weather?lat={lat}&lon={lon}&appid={key}&units=metric
//   5. Validate the response and map it to WeatherData.
// ============================================================

// The API key is declared in .env / .env.local as
// EXPO_PUBLIC_OWM_KEY and is inlined at build time.
// Endpoint, units, and timeout come from weather.json.
const OPEN_WEATHER_APP_ID =
  process.env.EXPO_PUBLIC_OWM_KEY;

const CURRENT_WEATHER_URL =
  weatherJson.api.currentUrl;

const UNITS = weatherJson.api.units;

/*
 * Every network call is aborted after this long so the weather
 * fetch never hangs on a slow or dead connection. The abort is
 * caught and re-thrown as a descriptive timeout error so the
 * raw "AbortError: signal is aborted without reason" never
 * reaches the console.
 */
const REQUEST_TIMEOUT_MS = weatherJson.api.timeoutMs;

// ============================================================
// TYPES
// ============================================================

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface WeatherData {
  temperature: number;
  description: string;
  city: string;
}

export type WeatherErrorCode =
  | "missing_key"
  | "permission_denied"
  | "location_unavailable"
  | "api"
  | "timeout"
  | "network"
  | "invalid_response";

export class WeatherError extends Error {
  readonly code: WeatherErrorCode;

  constructor(
    code: WeatherErrorCode,
    message: string
  ) {
    super(message);

    this.name = "WeatherError";

    this.code = code;
  }
}

// ============================================================
// API KEY VALIDATION
//
// Runs before any other logic so a missing key fails with a
// clear message instead of a confusing 401 from OpenWeather.
// ============================================================

function validateApiKey(): void {
  if (
    !OPEN_WEATHER_APP_ID ||
    OPEN_WEATHER_APP_ID.trim().length === 0
  ) {
    throw new WeatherError(
      "missing_key",
      weatherJson.messages.errors.missing_key
    );
  }
}

// ============================================================
// LOCATION
// ============================================================

async function getCoordinates(): Promise<Coordinates> {
  const { status } =
    await Location.requestForegroundPermissionsAsync();

  if (status !== "granted") {
    throw new WeatherError(
      "permission_denied",
      weatherJson.messages.errors.permission_denied
    );
  }

  const servicesEnabled =
    await Location.hasServicesEnabledAsync();

  if (!servicesEnabled) {
    throw new WeatherError(
      "location_unavailable",
      weatherJson.messages.errors.services_disabled
    );
  }

  // Balanced accuracy: fast to resolve and battery-friendly.
  try {
    const location =
      await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

    const {
      latitude,
      longitude,
    } = location.coords;

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      throw new WeatherError(
        "location_unavailable",
        weatherJson.messages.errors.invalid_coordinates
      );
    }

    return {
      lat: latitude,
      lon: longitude,
    };
  } catch (error) {
    if (error instanceof WeatherError) {
      throw error;
    }

    throw new WeatherError(
      "location_unavailable",
      weatherJson.messages.errors.location_unavailable
    );
  }
}

// ============================================================
// FETCH WITH TIMEOUT
//
// Uses an AbortController so a hanging request is cancelled
// after REQUEST_TIMEOUT_MS. The abort is converted into a
// descriptive timeout error instead of a raw AbortError.
// ============================================================

async function fetchCurrentWeather(
  coordinates: Coordinates
): Promise<unknown> {
  const params = new URLSearchParams({
    lat: coordinates.lat.toString(),
    lon: coordinates.lon.toString(),
    appid: OPEN_WEATHER_APP_ID as string,
    units: UNITS,
  });

  const controller =
    new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS
  );

  try {
    const response = await fetch(
      `${CURRENT_WEATHER_URL}?${params.toString()}`,
      {
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      throw new WeatherError(
        "api",
        formatApiError(response.status)
      );
    }

    try {
      return await response.json();
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

    // The AbortController fired the configured timeout.
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
// RESPONSE PARSING
// ============================================================

interface OpenWeatherCurrentResponse {
  weather?: {
    description?: unknown;
  }[];
  main?: {
    temp?: unknown;
  };
  name?: unknown;
}

function parseWeatherResponse(
  data: unknown,
  coordinates: Coordinates
): WeatherData {
  if (
    !data ||
    typeof data !== "object"
  ) {
    throw new WeatherError(
      "invalid_response",
      weatherJson.messages.errors.invalid_response
    );
  }

  const payload =
    data as OpenWeatherCurrentResponse;

  const temperature =
    payload.main?.temp;

  const description =
    payload.weather?.[0]?.description;

  if (
    typeof temperature !== "number" ||
    !Number.isFinite(temperature)
  ) {
    throw new WeatherError(
      "invalid_response",
      weatherJson.messages.errors.missing_temperature
    );
  }

  if (
    typeof description !== "string" ||
    description.trim().length === 0
  ) {
    throw new WeatherError(
      "invalid_response",
      weatherJson.messages.errors.missing_description
    );
  }

  const city =
    typeof payload.name === "string" &&
    payload.name.trim().length > 0
      ? payload.name.trim()
      : formatCoordFallback(
          coordinates.lat,
          coordinates.lon
        );

  return {
    temperature:
      roundTemperature(temperature),
    description:
      description.trim(),
    city,
  };
}

// ============================================================
// GET WEATHER
// ============================================================

export async function getWeather(): Promise<WeatherData> {
  validateApiKey();

  const coordinates =
    await getCoordinates();

  const response =
    await fetchCurrentWeather(
      coordinates
    );

  return parseWeatherResponse(
    response,
    coordinates
  );
}

// ============================================================
// CURRENT COORDINATES
//
// Shared balanced-accuracy fix for consumers that need raw
// coordinates (e.g. the 5-day forecast) without fetching
// current weather.
// ============================================================

export async function getCurrentCoordinates(): Promise<Coordinates> {
  validateApiKey();

  return getCoordinates();
}