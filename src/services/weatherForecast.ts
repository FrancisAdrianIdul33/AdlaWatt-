import * as Location from "expo-location";

// ============================================================
// OPENWEATHER API
//
// Providers (OpenWeather only):
//
//   1. One Call API 4.0 - Current weather   (primary)
//      https://openweathermap.org/api/one-call-4
//      Hyper-local current conditions from the latest
//      high-resolution model for the exact GPS coordinates.
//      Requires the "One Call by Call" subscription
//      (free tier: 1,000 calls / day).
//
//   2. Current Weather 2.5  (fallback)
//      https://openweathermap.org/current
//      Used automatically if the One Call 4.0 request is
//      unavailable on the account.
//
//   3. 5-day / 3-hour Forecast 2.5   (chart data)
//      Used for the hourly temperature series regardless of
//      which provider served the current conditions.
//
// Every call uses the LIVE coordinates from the device and is
// re-fetched on the dashboard refresh interval, so the
// temperature is never static or city-wide.
// ============================================================

const ONE_CALL_V4_CURRENT_URL =
  "https://api.openweathermap.org/data/4.0/onecall/current";

const CURRENT_WEATHER_URL =
  "https://api.openweathermap.org/data/2.5/weather";

const FORECAST_URL =
  "https://api.openweathermap.org/data/2.5/forecast";

const REVERSE_GEOCODE_URL =
  "https://api.bigdatacloud.net/data/reverse-geocode-client";

const OPEN_WEATHER_APP_ID =
  "280e7375e7fcf69a4abf516a878b84fe";

const TIMEZONE = "Asia/Manila";

const TIMEZONE_ABBREVIATION = "PHT";

/*
 * Number of 3-hour forecast steps to retrieve for the hourly
 * chart. The free OpenWeather tier returns 40 entries (5 days).
 */
const FORECAST_STEPS = 40;

/*
 * Every network call is aborted after this long so the weather
 * card never hangs when the device has a slow connection.
 */
const REQUEST_TIMEOUT_MS = 10 * 1000;

// ============================================================
// TYPES
// ============================================================

export type UserLocation = {
  latitude: number;
  longitude: number;
  city: string;
};

export type PhilippineSeason =
  | "Cool Dry Season"
  | "Hot Dry Season"
  | "Rainy Season";

export type WeatherCondition =
  | "Clear sky"
  | "Mainly clear"
  | "Partly cloudy"
  | "Overcast"
  | "Fog"
  | "Light drizzle"
  | "Moderate drizzle"
  | "Dense intensity drizzle"
  | "Slight rain"
  | "Moderate rain"
  | "Heavy intensity rain"
  | "Slight rain showers"
  | "Moderate rain showers"
  | "Violent rain showers"
  | "Slight or moderate thunderstorm"
  | "Thunderstorm with slight hail"
  | "Thunderstorm with heavy hail";

export type HourlyWeather = {
  time: Date[];
  temperature: number[];
};

export type CurrentWeather = {
  time: Date;
  temperature: number;
  temperatureUnit: string;
  weatherCode: number;
  condition: WeatherCondition;
  season: PhilippineSeason;
};

export type WeatherForecast = {
  location: UserLocation;
  timezone: string;
  timezoneAbbreviation: string;
  utcOffsetSeconds: number;
  elevation: number;
  weather: CurrentWeather;
  hourly: HourlyWeather;
};

// ============================================================
// NETWORK HELPERS
// ============================================================

/*
 * Fetches a URL with a hard timeout. Rejects on any non-2xx
 * status so callers can fall back to another provider.
 */
async function fetchJson(
  url: string
): Promise<unknown> {
  const controller =
    new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS
  );

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

// ============================================================
// OPENWEATHER REQUEST PARAMS
// ============================================================

/*
 * Shared query parameters for every OpenWeather call:
 * exact device coordinates + metric units + English.
 */
function buildOpenWeatherParams(
  location: UserLocation
): URLSearchParams {
  return new URLSearchParams({
    lat: location.latitude.toString(),
    lon: location.longitude.toString(),
    appid: OPEN_WEATHER_APP_ID,
    units: "metric",
    lang: "en",
  });
}

// ============================================================
// OPENWEATHER 2.5 RESPONSE TYPES
// ============================================================

type OpenWeatherCurrentResponse = {
  weather: {
    id: number;
  }[];
  main: {
    temp: number;
  };
  dt: number;
  timezone: number;
};

type OpenWeatherForecastResponse = {
  list: {
    dt: number;
    main: {
      temp: number;
    };
    weather: {
      id: number;
    }[];
  }[];
};

// ============================================================
// OPENWEATHER ONE CALL 4.0 RESPONSE TYPE
// ============================================================

type OneCallV4CurrentData = {
  dt: number;
  temp: number;
  weather: {
    id: number;
  }[];
};

type OneCallV4CurrentResponse = {
  timezone: string;
  timezone_offset: number;
  data: OneCallV4CurrentData[];
};

// ============================================================
// PHILIPPINE SEASON
// ============================================================

function getPhilippineSeason(
  date: Date = new Date()
): PhilippineSeason {
  const month = date.getMonth() + 1;

  if (month >= 12 || month <= 2) {
    return "Cool Dry Season";
  }

  if (month >= 3 && month <= 5) {
    return "Hot Dry Season";
  }

  return "Rainy Season";
}

// ============================================================
// VALUE VALIDATION
// ============================================================

/*
 * A physically plausible surface temperature in Celsius.
 * Rejects clearly broken API responses so a bad reading never
 * reaches the UI.
 */
function isValidTemperature(
  value: number
): boolean {
  return (
    Number.isFinite(value) &&
    value >= -60 &&
    value <= 60
  );
}

function isValidWeatherCode(
  value: unknown
): value is number {
  return (
    Number.isFinite(value) &&
    typeof value === "number"
  );
}

// ============================================================
// OPENWEATHER WEATHER CODE MAPPING
// ============================================================

/*
 * OpenWeather condition codes (shared by One Call 4.0 and 2.5):
 *
 * 200-232 Thunderstorm
 * 300-321 Drizzle
 * 500-531 Rain
 * 600-622 Snow
 * 700-781 Atmosphere (fog, mist, haze, dust, smoke)
 * 800     Clear
 * 801-804 Clouds
 */
function getWeatherCondition(
  code: number
): WeatherCondition {
  switch (code) {
    // --------------------------------------------------------
    // CLEAR / CLOUD
    // --------------------------------------------------------

    case 800:
      return "Clear sky";

    case 801:
      return "Mainly clear";

    case 802:
      return "Partly cloudy";

    case 803:
    case 804:
      return "Overcast";

    // --------------------------------------------------------
    // THUNDERSTORM
    // --------------------------------------------------------

    case 200:
    case 201:
    case 202:
    case 210:
    case 211:
    case 212:
    case 221:
    case 230:
    case 231:
    case 232:
      return "Slight or moderate thunderstorm";

    // --------------------------------------------------------
    // DRIZZLE
    // --------------------------------------------------------

    case 300:
    case 310:
    case 313:
      return "Light drizzle";

    case 301:
    case 311:
    case 314:
    case 321:
      return "Moderate drizzle";

    case 302:
    case 312:
      return "Dense intensity drizzle";

    // --------------------------------------------------------
    // RAIN
    // --------------------------------------------------------

    case 500:
      return "Slight rain";

    case 501:
      return "Moderate rain";

    case 502:
    case 503:
    case 504:
      return "Heavy intensity rain";

    case 511:
      return "Slight rain";

    case 520:
      return "Slight rain showers";

    case 521:
      return "Moderate rain showers";

    case 522:
    case 531:
      return "Violent rain showers";

    // --------------------------------------------------------
    // SNOW
    // --------------------------------------------------------

    case 600:
    case 601:
    case 602:
    case 611:
    case 612:
    case 613:
    case 615:
    case 616:
    case 620:
    case 621:
    case 622:
      return "Overcast";

    // --------------------------------------------------------
    // ATMOSPHERE
    // --------------------------------------------------------

    case 701:
    case 741:
      return "Fog";

    case 711:
    case 721:
    case 731:
    case 751:
    case 761:
    case 762:
    case 771:
    case 781:
      return "Overcast";

    // --------------------------------------------------------
    // FALLBACK
    // --------------------------------------------------------

    default:
      return "Clear sky";
  }
}

// ============================================================
// TIME CONVERSION
// ============================================================
//
// OpenWeather exposes Unix timestamps in seconds (UTC).
// Adding the API-provided UTC offset (seconds east of UTC)
// converts them to the requested timezone: Asia/Manila.
//
// ============================================================

function toLocalDate(
  timestamp: number,
  utcOffsetSeconds: number
): Date {
  return new Date(
    (timestamp + utcOffsetSeconds) * 1000
  );
}

// ============================================================
// REVERSE GEOCODING
// ============================================================

type ReverseGeocodeResponse = {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  countryName?: string;
};

async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string> {
  try {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      localityLanguage: "en",
    });

    const data =
      (await fetchJson(
        `${REVERSE_GEOCODE_URL}?${params.toString()}`
      )) as ReverseGeocodeResponse;

    const city =
      data.city?.trim() ||
      data.locality?.trim();

    if (city) {
      return city;
    }

    if (data.principalSubdivision?.trim()) {
      return data.principalSubdivision.trim();
    }

    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  } catch (error) {
    console.warn(
      "Reverse geocoding failed:",
      error
    );

    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
}

// ============================================================
// GET USER LOCATION
// ============================================================

async function getUserLocation(): Promise<UserLocation> {
  const { status } =
    await Location.requestForegroundPermissionsAsync();

  if (status !== "granted") {
    throw new Error(
      "Location permission is required to get the current weather."
    );
  }

  const servicesEnabled =
    await Location.hasServicesEnabledAsync();

  if (!servicesEnabled) {
    throw new Error(
      "Location services are disabled on the device."
    );
  }

  // Highest available accuracy for the weather-location lookup.
  const location =
    await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
      mayShowUserSettingsDialog: true,
    });

  const {
    latitude,
    longitude,
  } = location.coords;

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    throw new Error(
      "Invalid device coordinates."
    );
  }

  const city = await reverseGeocode(
    latitude,
    longitude
  );

  return {
    latitude,
    longitude,
    city,
  };
}

// ============================================================
// TEMPERATURE ROUNDING
// ============================================================

function roundTemperature(
  value: number
): number {
  return Math.round(value * 10) / 10;
}

// ============================================================
// BUILD WEATHER RESULT
// ============================================================

function buildWeatherForecast(
  location: UserLocation,
  utcOffsetSeconds: number,
  currentTime: Date,
  temperature: number,
  weatherCode: number,
  hourly: HourlyWeather
): WeatherForecast {
  return {
    location: {
      // Preserve the actual coordinates collected
      // from the user's device.
      ...location,
      latitude: location.latitude,
      longitude: location.longitude,
    },

    timezone: TIMEZONE,
    timezoneAbbreviation: TIMEZONE_ABBREVIATION,
    utcOffsetSeconds,
    elevation: 0,

    weather: {
      time: currentTime,
      temperature,
      temperatureUnit: "°C",
      weatherCode,
      condition:
        getWeatherCondition(
          weatherCode
        ),
      season:
        getPhilippineSeason(
          currentTime
        ),
    },

    hourly,
  };
}

// ============================================================
// HOURLY SERIES - 5-DAY / 3-HOUR FORECAST (2.5)
//
// Provides the temperature chart for both providers.
// ============================================================

async function getHourlySeries(
  location: UserLocation,
  utcOffsetSeconds: number
): Promise<HourlyWeather> {
  const params =
    buildOpenWeatherParams(
      location
    );

  params.set(
    "cnt",
    FORECAST_STEPS.toString()
  );

  const forecastData =
    (await fetchJson(
      `${FORECAST_URL}?${params.toString()}`
    )) as OpenWeatherForecastResponse;

  if (
    !forecastData.list ||
    forecastData.list.length === 0
  ) {
    throw new Error(
      "OpenWeather returned no forecast data."
    );
  }

  return {
    time: forecastData.list.map(
      (entry) =>
        toLocalDate(
          entry.dt,
          utcOffsetSeconds
        )
    ),

    temperature: forecastData.list.map(
      (entry) =>
        roundTemperature(
          entry.main.temp
        )
    ),
  };
}

// ============================================================
// CLEAN CURRENT READING
// ============================================================

/*
 * Common validation for a current-weather reading and the
 * default temperature for the Philippine UI. Returns null when
 * the reading is missing or physically impossible.
 */
function parseCurrentReading(
  temperature: number,
  weatherCode: number,
  utcOffsetSeconds: number,
  timestamp: number
): {
  currentTime: Date;
  temperature: number;
  weatherCode: number;
} | null {
  if (
    !isValidTemperature(
      temperature
    ) ||
    !isValidWeatherCode(
      weatherCode
    ) ||
    !Number.isFinite(timestamp) ||
    !Number.isFinite(utcOffsetSeconds)
  ) {
    return null;
  }

  return {
    currentTime:
      toLocalDate(
        timestamp,
        utcOffsetSeconds
      ),
    temperature:
      roundTemperature(
        temperature
      ),
    weatherCode,
  };
}

// ============================================================
// PRIMARY PROVIDER - ONE CALL API 4.0 (CURRENT)
//
// https://api.openweathermap.org/data/4.0/onecall/current
// Returns a single record with hyper-local current conditions
// for the exact device coordinates.
// ============================================================

async function getOneCallV4Weather(
  location: UserLocation
): Promise<WeatherForecast> {
  const params =
    buildOpenWeatherParams(
      location
    );

  const currentData =
    (await fetchJson(
      `${ONE_CALL_V4_CURRENT_URL}?${params.toString()}`
    )) as OneCallV4CurrentResponse;

  if (
    !Array.isArray(currentData.data) ||
    currentData.data.length === 0 ||
    !currentData.data[0]
  ) {
    throw new Error(
      "One Call 4.0 returned no current weather data."
    );
  }

  const entry = currentData.data[0];

  if (
    !Array.isArray(entry.weather) ||
    entry.weather.length === 0
  ) {
    throw new Error(
      "One Call 4.0 returned no weather condition."
    );
  }

  const reading = parseCurrentReading(
    entry.temp,
    entry.weather[0].id,
    currentData.timezone_offset,
    entry.dt
  );

  if (!reading) {
    throw new Error(
      "One Call 4.0 returned invalid current weather values."
    );
  }

  const { currentTime, temperature, weatherCode } = reading;

  // The hourly chart comes from the 5-day / 3-hour forecast
  // so the series stays complete.
  const hourly =
    await getHourlySeries(
      location,
      currentData.timezone_offset
    );

  return buildWeatherForecast(
    location,
    currentData.timezone_offset,
    currentTime,
    temperature,
    weatherCode,
    hourly
  );
}

// ============================================================
// FALLBACK PROVIDER - CURRENT WEATHER 2.5
//
// Only used if the One Call 4.0 request is unavailable.
// Also uses the exact device GPS coordinates.
// ============================================================

async function getLegacyWeather(
  location: UserLocation
): Promise<WeatherForecast> {
  const params =
    buildOpenWeatherParams(
      location
    );

  const currentData =
    (await fetchJson(
      `${CURRENT_WEATHER_URL}?${params.toString()}`
    )) as OpenWeatherCurrentResponse;

  if (
    !currentData.weather ||
    currentData.weather.length === 0 ||
    !currentData.main
  ) {
    throw new Error(
      "OpenWeather returned no current weather data."
    );
  }

  const reading = parseCurrentReading(
    currentData.main.temp,
    currentData.weather[0].id,
    currentData.timezone,
    currentData.dt
  );

  if (!reading) {
    throw new Error(
      "OpenWeather returned invalid current weather values."
    );
  }

  const { currentTime, temperature, weatherCode } = reading;

  const hourly =
    await getHourlySeries(
      location,
      currentData.timezone
    );

  return buildWeatherForecast(
    location,
    currentData.timezone,
    currentTime,
    temperature,
    weatherCode,
    hourly
  );
}

// ============================================================
// GET CURRENT WEATHER FOR USER
// ============================================================

export async function getCurrentWeatherForUser(): Promise<WeatherForecast> {
  // ==========================================================
  // 1. GET EXACT DEVICE COORDINATES
  // ==========================================================

  const location = await getUserLocation();

  // ==========================================================
  // 2. PRIMARY PROVIDER - ONE CALL API 4.0
  // ==========================================================

  try {
    return await getOneCallV4Weather(
      location
    );
  } catch (providerError) {
    console.warn(
      "One Call 4.0 failed, switching to Current Weather 2.5:",
      providerError
    );
  }

  // ==========================================================
  // 3. FALLBACK PROVIDER - CURRENT WEATHER 2.5
  // ==========================================================

  return getLegacyWeather(
    location
  );
}