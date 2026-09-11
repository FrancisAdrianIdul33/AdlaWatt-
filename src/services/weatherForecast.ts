import * as Location from "expo-location";
import { fetchWeatherApi } from "openmeteo";
import { Platform } from "react-native";

const OPEN_METEO_URL =
  "https://api.open-meteo.com/v1/forecast";

const REVERSE_GEOCODE_URL =
  "https://api.bigdatacloud.net/data/reverse-geocode-client";

const TIMEZONE = "Asia/Manila";

export type UserLocation = {
  city: string;
  region: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
  accuracy: number | null;
};

export type PhilippineSeason =
  | "Cool dry season"
  | "Hot dry season"
  | "Rainy season";

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
  weather: CurrentWeather;
  hourly: HourlyWeather;
  timezone: string;
  timezoneAbbreviation: string;
  utcOffsetSeconds: number;
  elevation: number;
};

type ReverseGeocodeResponse = {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  countryName?: string;
};

function getPhilippineSeason(
  date: Date = new Date(),
): PhilippineSeason {
  const month = date.getMonth() + 1;

  if (month >= 12 || month <= 2) {
    return "Cool dry season";
  }

  if (month >= 3 && month <= 5) {
    return "Hot dry season";
  }

  return "Rainy season";
}

function getWeatherCondition(
  code: number,
): WeatherCondition {
  switch (code) {
    case 0:
      return "Clear sky";

    case 1:
      return "Mainly clear";

    case 2:
      return "Partly cloudy";

    case 3:
      return "Overcast";

    case 45:
    case 48:
      return "Fog";

    case 51:
      return "Light drizzle";

    case 53:
      return "Moderate drizzle";

    case 55:
      return "Dense intensity drizzle";

    case 61:
      return "Slight rain";

    case 63:
      return "Moderate rain";

    case 65:
      return "Heavy intensity rain";

    case 80:
      return "Slight rain showers";

    case 81:
      return "Moderate rain showers";

    case 82:
      return "Violent rain showers";

    case 95:
      return "Slight or moderate thunderstorm";

    case 96:
      return "Thunderstorm with slight hail";

    case 99:
      return "Thunderstorm with heavy hail";

    default:
      throw new Error(
        `Unsupported Open-Meteo weather code: ${code}`,
      );
  }
}

async function getUserLocation(): Promise<UserLocation> {
  const permission =
    await Location.requestForegroundPermissionsAsync();

  if (!permission.granted) {
    if (!permission.canAskAgain) {
      throw new Error(
        "Location permission was denied. Enable location access in your device or browser settings.",
      );
    }

    throw new Error(
      "Location permission was denied. Allow location access to display local weather.",
    );
  }

  const servicesEnabled =
    await Location.hasServicesEnabledAsync();

  if (!servicesEnabled) {
    throw new Error(
      "Location services are disabled. Please enable location services and try again.",
    );
  }

  const position =
    await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      ...(Platform.OS === "web"
        ? { maximumAge: 0 }
        : {}),
    });

  const {
    latitude,
    longitude,
    accuracy,
  } = position.coords;

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    throw new Error(
      "The location service returned invalid coordinates.",
    );
  }

  const cityData = await reverseGeocode(
    latitude,
    longitude,
  );

  return {
    city: cityData.city,
    region: cityData.region,
    country: cityData.country,
    latitude,
    longitude,
    accuracy: accuracy ?? null,
  };
}

async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<{
  city: string;
  region: string | null;
  country: string | null;
}> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    localityLanguage: "en",
  });

  try {
    const response = await fetch(
      `${REVERSE_GEOCODE_URL}?${params.toString()}`,
    );

    if (!response.ok) {
      throw new Error(
        `Reverse geocoding failed with status ${response.status}.`,
      );
    }

    const data =
      (await response.json()) as ReverseGeocodeResponse;

    const city =
      data.city?.trim() ||
      data.locality?.trim();

    if (!city) {
      throw new Error(
        "No city or locality was returned for the coordinates.",
      );
    }

    return {
      city,
      region:
        data.principalSubdivision?.trim() || null,
      country:
        data.countryName?.trim() || null,
    };
  } catch (error) {
    console.warn(
      "Reverse geocoding failed:",
      error,
    );

    return {
      city: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      region: null,
      country: null,
    };
  }
}

export async function getCurrentWeatherForUser(): Promise<WeatherForecast> {
  const location = await getUserLocation();

  const params = {
    latitude: [location.latitude],
    longitude: [location.longitude],
    current: "temperature_2m,weather_code",
    hourly: "temperature_2m",
    timezone: TIMEZONE,
  };

  let responses;

  try {
    responses = await fetchWeatherApi(
      OPEN_METEO_URL,
      params,
    );
  } catch (error) {
    console.error(
      "Open-Meteo request failed:",
      error,
    );

    throw new Error(
      "Unable to connect to the weather service. Check your internet connection.",
    );
  }

  const response = responses[0];

  if (!response) {
    throw new Error(
      "Open-Meteo returned no weather data.",
    );
  }

  const latitude = response.latitude();
  const longitude = response.longitude();
  const elevation = response.elevation();
  const timezone = response.timezone();
  const timezoneAbbreviation =
    response.timezoneAbbreviation();
  const utcOffsetSeconds =
    response.utcOffsetSeconds();

  const current = response.current();

  if (!current) {
    throw new Error(
      "Open-Meteo returned no current weather data.",
    );
  }

  const temperature =
    current.variables(0)?.value();

  const weatherCode =
    current.variables(1)?.value();

  if (
    typeof temperature !== "number" ||
    typeof weatherCode !== "number"
  ) {
    throw new Error(
      "Open-Meteo returned incomplete current weather data.",
    );
  }

  const hourly = response.hourly();

  if (!hourly) {
    throw new Error(
      "Open-Meteo returned no hourly weather data.",
    );
  }

  const hourlyTemperature =
    hourly.variables(0)?.valuesArray();

  if (!hourlyTemperature) {
    throw new Error(
      "Open-Meteo returned incomplete hourly weather data.",
    );
  }

  const hourlyTime = Array.from(
    {
      length:
        (Number(hourly.timeEnd()) -
          Number(hourly.time())) /
        hourly.interval(),
    },
    (_, index) =>
      new Date(
        (Number(hourly.time()) +
          index * hourly.interval() +
          utcOffsetSeconds) *
          1000,
      ),
  );

  return {
    location: {
      ...location,
      latitude,
      longitude,
    },

    timezone:
      timezone || TIMEZONE,

    timezoneAbbreviation:
      timezoneAbbreviation || "PHT",

    utcOffsetSeconds,

    elevation,

    weather: {
      time: new Date(
        (Number(current.time()) +
          utcOffsetSeconds) *
          1000,
      ),

      // Always one decimal place.
      temperature:
        Number(temperature.toFixed(1)),

      temperatureUnit: "°C",

      weatherCode,

      condition:
        getWeatherCondition(weatherCode),

      season:
        getPhilippineSeason(),
    },

    hourly: {
      time: hourlyTime,
      temperature:
        Array.from(hourlyTemperature),
    },
  };
}