// services/weatherForecast.ts

import * as Location from "expo-location";

const OPEN_METEO_FORECAST_URL =
  "https://api.open-meteo.com/v1/forecast";

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

export type CurrentWeather = {
  time: string;
  temperature: number;
  temperatureUnit: string;
  weatherCode: number;
  condition: WeatherCondition;
  season: PhilippineSeason;
};

export type WeatherForecast = {
  location: UserLocation;
  weather: CurrentWeather;
  timezone: string;
  timezoneAbbreviation: string;
};

type OpenMeteoResponse = {
  timezone: string;
  timezone_abbreviation: string;
  current?: {
    time: string;
    temperature_2m: number;
    weather_code: number;
  };
  current_units?: {
    temperature_2m?: string;
  };
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
  weatherCode: number,
): WeatherCondition {
  switch (weatherCode) {
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
        `Unsupported Open-Meteo weather code: ${weatherCode}`,
      );
  }
}

async function getUserLocation(): Promise<UserLocation> {
  const permission =
    await Location.requestForegroundPermissionsAsync();

  if (!permission.granted) {
    if (!permission.canAskAgain) {
      throw new Error(
        "Location permission was permanently denied. Enable it in your device settings.",
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
      "Location services are disabled. Enable GPS or location services and try again.",
    );
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
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
      "The device returned invalid location coordinates.",
    );
  }

  let city = "Unknown location";
  let region: string | null = null;
  let country: string | null = null;

  try {
    const addresses = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    const address = addresses[0];

    if (address) {
      city =
        address.city ??
        address.district ??
        address.subregion ??
        address.region ??
        "Unknown location";

      region = address.region ?? null;
      country = address.country ?? null;
    }
  } catch {
    city = "Unknown location";
  }

  return {
    city,
    region,
    country,
    latitude,
    longitude,
    accuracy: accuracy ?? null,
  };
}

export async function getCurrentWeatherForUser(): Promise<WeatherForecast> {
  const location = await getUserLocation();

  const queryParameters = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: "temperature_2m,weather_code",
    temperature_unit: "celsius",
    timezone: "auto",
    forecast_days: "1",
  });

  const requestUrl =
    `${OPEN_METEO_FORECAST_URL}?` +
    queryParameters.toString();

  const response = await fetch(requestUrl);

  if (!response.ok) {
    let errorMessage =
      `Open-Meteo request failed with status ${response.status}.`;

    try {
      const errorData = await response.json();

      if (typeof errorData?.reason === "string") {
        errorMessage = errorData.reason;
      }
    } catch {
      // Keep the default error message.
    }

    throw new Error(errorMessage);
  }

  const data =
    (await response.json()) as OpenMeteoResponse;

  if (!data.current) {
    throw new Error(
      "Open-Meteo returned no current weather data.",
    );
  }

  const weatherCode = data.current.weather_code;

  return {
    location,
    timezone: data.timezone,
    timezoneAbbreviation: data.timezone_abbreviation,
    weather: {
      time: data.current.time,
      temperature: data.current.temperature_2m,
      temperatureUnit:
        data.current_units?.temperature_2m ?? "°C",
      weatherCode,
      condition: getWeatherCondition(weatherCode),
      season: getPhilippineSeason(),
    },
  };
}