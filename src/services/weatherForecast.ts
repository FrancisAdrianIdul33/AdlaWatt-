import * as Location from "expo-location";

import { fetchWeatherApi } from "openmeteo";

// ============================================================
// OPEN-METEO ECMWF IFS HRES 9 KM
// ============================================================

const OPEN_METEO_URL =
  "https://api.open-meteo.com/v1/ecmwf";

const REVERSE_GEOCODE_URL =
  "https://api.bigdatacloud.net/data/reverse-geocode-client";

const TIMEZONE = "auto";

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
// WMO WEATHER CODE MAPPING
// ============================================================

function getWeatherCondition(
  code: number
): WeatherCondition {
  switch (code) {
    // --------------------------------------------------------
    // CLEAR / CLOUD
    // --------------------------------------------------------

    case 0:
      return "Clear sky";

    case 1:
      return "Mainly clear";

    case 2:
      return "Partly cloudy";

    case 3:
      return "Overcast";

    // --------------------------------------------------------
    // FOG
    // --------------------------------------------------------

    case 45:
    case 48:
      return "Fog";

    // --------------------------------------------------------
    // DRIZZLE
    // --------------------------------------------------------

    case 51:
      return "Light drizzle";

    case 53:
      return "Moderate drizzle";

    case 55:
      return "Dense intensity drizzle";

    // --------------------------------------------------------
    // FREEZING DRIZZLE
    // --------------------------------------------------------

    case 56:
      return "Light drizzle";

    case 57:
      return "Dense intensity drizzle";

    // --------------------------------------------------------
    // RAIN
    // --------------------------------------------------------

    case 61:
      return "Slight rain";

    case 63:
      return "Moderate rain";

    case 65:
      return "Heavy intensity rain";

    // --------------------------------------------------------
    // FREEZING RAIN
    // --------------------------------------------------------

    case 66:
      return "Slight rain";

    case 67:
      return "Heavy intensity rain";

    // --------------------------------------------------------
    // SNOW
    // --------------------------------------------------------

    case 71:
    case 73:
    case 75:
    case 77:
      return "Overcast";

    // --------------------------------------------------------
    // RAIN SHOWERS
    // --------------------------------------------------------

    case 80:
      return "Slight rain showers";

    case 81:
      return "Moderate rain showers";

    case 82:
      return "Violent rain showers";

    // --------------------------------------------------------
    // SNOW SHOWERS
    // --------------------------------------------------------

    case 85:
    case 86:
      return "Overcast";

    // --------------------------------------------------------
    // THUNDERSTORM
    // --------------------------------------------------------

    case 95:
      return "Slight or moderate thunderstorm";

    case 96:
      return "Thunderstorm with slight hail";

    case 99:
      return "Thunderstorm with heavy hail";

    // --------------------------------------------------------
    // FALLBACK
    // --------------------------------------------------------

    default:
      return "Clear sky";
  }
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

    const response = await fetch(
      `${REVERSE_GEOCODE_URL}?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(
        `Reverse geocoding failed: ${response.status}`
      );
    }

    const data =
      (await response.json()) as ReverseGeocodeResponse;

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
// CONVERT OPEN-METEO TIMESTAMP TO LOCAL TIME
// ============================================================
//
// Open-Meteo's SDK exposes Unix timestamps.
// Adding the API-provided UTC offset converts them to the
// requested timezone: Asia/Manila.
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
// GET CURRENT WEATHER FOR USER
// ============================================================

export async function getCurrentWeatherForUser(): Promise<WeatherForecast> {
  // ==========================================================
  // 1. GET EXACT DEVICE COORDINATES
  // ==========================================================

  const location = await getUserLocation();

  // ==========================================================
  // 2. REQUEST ECMWF IFS HRES DATA
  // ==========================================================

  const params: any = {
    latitude: [location.latitude],
    longitude: [location.longitude],

    hourly: [
      "temperature_2m",
      "weather_code",
    ],

    timezone: TIMEZONE,

    // Prefer a suitable land grid cell with similar elevation.
    cell_selection: "land",
  };

  const responses = await fetchWeatherApi(
    OPEN_METEO_URL,
    params
  );

  if (
    !responses ||
    responses.length === 0
  ) {
    throw new Error(
      "No weather response was returned from Open-Meteo."
    );
  }

  const response = responses[0];

  // ==========================================================
  // 3. MODEL INFORMATION
  // ==========================================================

  const modelLatitude =
    response.latitude();

  const modelLongitude =
    response.longitude();

  const elevation =
    response.elevation();

  const timezone =
    response.timezone() ||
    TIMEZONE;

  const timezoneAbbreviation =
    response.timezoneAbbreviation() ||
    "PHT";

  const utcOffsetSeconds =
    response.utcOffsetSeconds();

  // ==========================================================
  // 4. HOURLY DATA
  // ==========================================================

  const hourly =
    response.hourly();

  if (!hourly) {
    throw new Error(
      "Hourly weather data was not returned."
    );
  }

  const temperatureVariable =
    hourly.variables(0);

  const weatherCodeVariable =
    hourly.variables(1);

  if (
    !temperatureVariable ||
    !weatherCodeVariable
  ) {
    throw new Error(
      "Required weather variables were not returned."
    );
  }

  const temperatureValues =
    temperatureVariable.valuesArray();

  const weatherCodeValues =
    weatherCodeVariable.valuesArray();

  if (
    !temperatureValues ||
    !weatherCodeValues ||
    temperatureValues.length === 0 ||
    weatherCodeValues.length === 0
  ) {
    throw new Error(
      "Weather data contains no hourly values."
    );
  }

  // ==========================================================
  // 5. HOURLY TIME RANGE
  // ==========================================================

  const hourlyStart =
    Number(hourly.time());

  const hourlyEnd =
    Number(hourly.timeEnd());

  const hourlyInterval =
    Number(hourly.interval());

  const hourlyTimes: Date[] = [];

  for (
    let timestamp = hourlyStart;
    timestamp < hourlyEnd;
    timestamp += hourlyInterval
  ) {
    hourlyTimes.push(
      toLocalDate(
        timestamp,
        utcOffsetSeconds
      )
    );
  }

  // ==========================================================
  // 6. FIND CURRENT WEATHER HOUR
  // ==========================================================
  //
  // Compare the raw Unix timestamps with the actual current
  // Unix time. This avoids comparing a timezone-shifted Date
  // against the device's absolute Date incorrectly.
  //
  // ==========================================================

  const nowUnixSeconds =
    Date.now() / 1000;

  let currentIndex = 0;
  let smallestDifference = Infinity;

  for (
    let index = 0;
    index < temperatureValues.length;
    index++
  ) {
    const timestamp =
      hourlyStart +
      index * hourlyInterval;

    const difference =
      Math.abs(
        timestamp -
          nowUnixSeconds
      );

    if (
      difference <
      smallestDifference
    ) {
      smallestDifference =
        difference;

      currentIndex = index;
    }
  }

  // ==========================================================
  // 7. CURRENT WEATHER
  // ==========================================================

  const currentTemperature =
    Number(
      temperatureValues[currentIndex]
    );

  const currentWeatherCode =
    Number(
      weatherCodeValues[currentIndex]
    );

  if (
    !Number.isFinite(
      currentTemperature
    ) ||
    !Number.isFinite(
      currentWeatherCode
    )
  ) {
    throw new Error(
      "Invalid current weather values."
    );
  }

  const roundedTemperature =
    Math.round(
      currentTemperature * 10
    ) / 10;

  const currentTime =
    hourlyTimes[currentIndex] ||
    new Date();

  const condition =
    getWeatherCondition(
      currentWeatherCode
    );

  // ==========================================================
  // 8. HOURLY WEATHER OBJECT
  // ==========================================================

  const hourlyWeather: HourlyWeather = {
    time: hourlyTimes,

    temperature: Array.from(
      temperatureValues,
      (value) =>
        Math.round(
          Number(value) * 10
        ) / 10
    ),
  };

  // ==========================================================
  // 9. FINAL WEATHER RESULT
  // ==========================================================
  //
  // IMPORTANT:
  // Keep the USER'S GPS coordinates here.
  //
  // Open-Meteo's returned latitude/longitude represent the
  // weather model grid location used for the forecast and can
  // differ from the requested coordinates.
  //
  // ==========================================================

  return {
    location: {
      ...location,

      // Preserve the actual coordinates collected
      // from the user's device.
      latitude: location.latitude,
      longitude: location.longitude,
    },

    timezone,
    timezoneAbbreviation,
    utcOffsetSeconds,
    elevation,

    weather: {
      time: currentTime,

      temperature:
        roundedTemperature,

      temperatureUnit: "°C",

      weatherCode:
        currentWeatherCode,

      condition,

      season:
        getPhilippineSeason(
          currentTime
        ),
    },

    hourly:
      hourlyWeather,
  };
}