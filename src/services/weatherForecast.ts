import * as Location from "expo-location";

// ============================================================
// OPENWEATHER API
// ============================================================

const OPEN_WEATHER_APP_ID =
  "280e7375e7fcf69a4abf516a878b84fe";

const CURRENT_WEATHER_URL =
  "https://api.openweathermap.org/data/2.5/weather";

const FORECAST_URL =
  "https://api.openweathermap.org/data/2.5/forecast";

const REVERSE_GEOCODE_URL =
  "https://api.bigdatacloud.net/data/reverse-geocode-client";

const TIMEZONE = "Asia/Manila";

const TIMEZONE_ABBREVIATION = "PHT";

/*
 * Number of 3-hour forecast steps to retrieve.
 * The free OpenWeather tier returns 40 entries (5 days).
 */
const FORECAST_STEPS = 40;

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
// OPENWEATHER RESPONSE TYPES
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
// OPENWEATHER WEATHER CODE MAPPING
// ============================================================

/*
 * OpenWeather condition codes:
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
      return "Light drizzle";

    case 301:
      return "Moderate drizzle";

    case 302:
      return "Dense intensity drizzle";

    case 310:
      return "Light drizzle";

    case 311:
      return "Moderate drizzle";

    case 312:
      return "Dense intensity drizzle";

    case 313:
      return "Light drizzle";

    case 314:
      return "Moderate drizzle";

    case 321:
      return "Moderate drizzle";

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
// CONVERT OPENWEATHER UNIX TIMESTAMP TO LOCAL TIME
// ============================================================
//
// OpenWeather exposes Unix timestamps in seconds.
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
// TEMPERATURE ROUNDING
// ============================================================

function roundTemperature(
  value: number
): number {
  return Math.round(value * 10) / 10;
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
  // 2. REQUEST CURRENT WEATHER
  // ==========================================================

  const params = new URLSearchParams({
    lat: location.latitude.toString(),
    lon: location.longitude.toString(),
    appid: OPEN_WEATHER_APP_ID,
    units: "metric",
    lang: "en",
  });

  const currentResponse = await fetch(
    `${CURRENT_WEATHER_URL}?${params.toString()}`
  );

  if (!currentResponse.ok) {
    throw new Error(
      `OpenWeather current weather request failed: ${currentResponse.status}`
    );
  }

  const currentData =
    (await currentResponse.json()) as OpenWeatherCurrentResponse;

  if (
    !currentData.weather ||
    currentData.weather.length === 0 ||
    !currentData.main
  ) {
    throw new Error(
      "OpenWeather returned no current weather data."
    );
  }

  // ==========================================================
  // 3. REQUEST 3-HOUR FORECAST
  // ==========================================================

  const forecastParams =
    new URLSearchParams(params);

  forecastParams.set(
    "cnt",
    FORECAST_STEPS.toString()
  );

  const forecastResponse = await fetch(
    `${FORECAST_URL}?${forecastParams.toString()}`
  );

  if (!forecastResponse.ok) {
    throw new Error(
      `OpenWeather forecast request failed: ${forecastResponse.status}`
    );
  }

  const forecastData =
    (await forecastResponse.json()) as OpenWeatherForecastResponse;

  if (
    !forecastData.list ||
    forecastData.list.length === 0
  ) {
    throw new Error(
      "OpenWeather returned no forecast data."
    );
  }

  // ==========================================================
  // 4. TIMEZONE INFORMATION
  // ==========================================================

  const utcOffsetSeconds =
    currentData.timezone;

  // ==========================================================
  // 5. CURRENT WEATHER
  // ==========================================================

  const currentTime =
    toLocalDate(
      currentData.dt,
      utcOffsetSeconds
    );

  const currentTemperature =
    roundTemperature(
      currentData.main.temp
    );

  const currentWeatherCode =
    currentData.weather[0].id;

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

  const condition =
    getWeatherCondition(
      currentWeatherCode
    );

  // ==========================================================
  // 6. HOURLY WEATHER OBJECT
  // ==========================================================

  const hourlyWeather: HourlyWeather = {
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

  // ==========================================================
  // 7. FINAL WEATHER RESULT
  // ==========================================================
  //
  // IMPORTANT:
  // Keep the USER'S GPS coordinates here.
  //
  // OpenWeather returns the forecast for the requested
  // coordinates, so the user's coordinates are preserved.
  //
  // OpenWeather does not return an elevation in the free
  // endpoints, so elevation is reported as 0.
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

    timezone: TIMEZONE,
    timezoneAbbreviation: TIMEZONE_ABBREVIATION,
    utcOffsetSeconds,
    elevation: 0,

    weather: {
      time: currentTime,

      temperature:
        currentTemperature,

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