import React, { useEffect, useState } from "react";

import {
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import ActivityCard from "@/components/ActivityCard";
import AppRecCard from "@/components/AppRecCard";
import ChartCard from "@/components/ChartCard";
import Copyright from "@/components/forms/Copyright";
import NavBar from "@/components/layout/Navbar";
import ScreenContainer2 from "@/components/layout/ScreenContainer2";
import Sidebar from "@/components/layout/Sidebar";
import AppText from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";

import {
  getCurrentWeatherForUser,
  type WeatherCondition,
} from "@/services/weatherForecast";

import {
  useMonitoring,
} from "@/services/monitoringService";

// ============================================================
// TYPES
// ============================================================

type WeatherData = {
  city: string;
  temperature: number;
  description: WeatherCondition;
};

// ============================================================
// WEATHER AUTO-REFRESH
// ============================================================

// The weather is re-fetched on this interval so the displayed
// temperature never stays frozen for too long.
const WEATHER_REFRESH_INTERVAL_MS =
  10 * 60 * 1000; // every 10 minutes

// ============================================================
// DASHBOARD SCREEN
// ============================================================

export default function DashboardScreen() {
  // ==========================================================
  // SIDEBAR STATE
  // ==========================================================

  const [sidebarVisible, setSidebarVisible] =
    useState(false);

  // ==========================================================
  // ADLAWATT MONITORING
  //
  // Source:
  // Supabase / monitoringService
  //
  // This remains completely independent from weather.
  // ==========================================================

  const {
    monitoring,
    loading,
  } = useMonitoring();

  // ==========================================================
  // WEATHER STATE
  //
  // Source:
  // Open-Meteo API / weatherForecast.ts
  //
  // This has its own loading state so weather loading
  // does not affect the Supabase monitoring cards.
  // ==========================================================

  const [weather, setWeather] =
    useState<WeatherData | null>(null);

  const [weatherLoading, setWeatherLoading] =
    useState(true);

  // ==========================================================
  // LOAD CURRENT WEATHER
  // ==========================================================

  useEffect(() => {
    let isMounted = true;
    let hasLoaded = false;

    const loadWeather = async () => {
      try {
        // Only show the loading state on the first fetch;
        // background refreshes keep the last known value.
        if (!hasLoaded) {
          setWeatherLoading(true);
        }

        const forecast =
          await getCurrentWeatherForUser();

        // Prevent state updates if the screen
        // has already been unmounted.
        if (!isMounted) {
          return;
        }

        hasLoaded = true;

        setWeather({
          city:
            forecast.location.city,
          temperature:
            forecast.weather.temperature,
          description:
            forecast.weather.condition,
        });
      } catch (error) {
        console.error(
          "Failed to load weather:",
          error,
        );

        if (!isMounted) {
          return;
        }

        // Keep the last known value on background
        // refresh failures; only blank the card
        // if nothing has loaded yet.
        if (!hasLoaded) {
          setWeather(null);
        }
      } finally {
        if (isMounted) {
          setWeatherLoading(false);
        }
      }
    };

    // Initial fetch.
    loadWeather();

    // Keep the temperature from staying frozen by
    // re-fetching on a fixed interval.
    const refreshInterval = setInterval(
      loadWeather,
      WEATHER_REFRESH_INTERVAL_MS,
    );

    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
    };
  }, []);

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <ScreenContainer2>
      {/* ====================================================
          FIXED NAVBAR
          ==================================================== */}

      <NavBar
        onMenuPress={() =>
          setSidebarVisible(true)
        }
        deviceStatus={
          monitoring?.device_status === "Online"
            ? "Online"
            : "Offline"
        }
      />

      {/* ====================================================
          DASHBOARD
          ==================================================== */}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ==================================================
            DASHBOARD HEADER
            ================================================== */}

        <View
          style={styles.headerCard}
        >
          <AppText
            variant="heading"
            style={styles.headerTitle}
          >
            Dashboard
          </AppText>

          <AppText
            variant="caption"
            style={styles.headerSubtitle}
          >
            Monitor your AdlaWatt system in real time.
          </AppText>
        </View>

        {/* ==================================================
            REAL-TIME MONITORING
            ================================================== */}

        <View
          style={styles.section}
        >
          <AppText
            variant="body"
            style={styles.sectionTitle}
          >
            Real-Time Monitoring
          </AppText>

          <View
            style={styles.monitorGrid}
          >
            {/* ==============================================
                BATTERY

                Source: Supabase

                ChartCard.tsx:
                - Circular battery gauge
                - Battery percentage
                - Time remaining
                - Battery status
                - DoD Safe / Unsafe
                ============================================== */}

            <View
              style={
                styles.batteryCardContainer
              }
            >
              <ChartCard
                type="battery"
                monitoring={monitoring}
                loading={loading}
              />
            </View>

            {/* ==============================================
                BATTERY MONITORING

                ChartCard.tsx internally renders:
                - Voltage
                - Watt-hour
                - Load Now

                Only "voltage" is passed here because
                ChartCard.tsx uses it as the grouped
                Battery Monitoring card.
                ============================================== */}

            <View
              style={styles.fullWidthCard}
            >
              <ChartCard
                type="voltage"
                monitoring={monitoring}
                loading={loading}
              />
            </View>

            {/* ==============================================
                SOLAR MONITORING

                ChartCard.tsx internally renders:
                - Solar Timer
                - Solar Input
                - Solar Voltage
                - Solar Current
                - Total Energy
                ============================================== */}

            <View
              style={styles.fullWidthCard}
            >
              <ChartCard
                type="solar"
                monitoring={monitoring}
                loading={loading}
              />
            </View>

            {/* ==============================================
                WEATHER

                Source: Open-Meteo API

                ChartCard.tsx renders:
                - Weather icon
                - City
                - Temperature
                - Weather condition
                ============================================== */}

            <View
              style={styles.fullWidthCard}
            >
              <ChartCard
                type="weather"
                monitoring={monitoring}
                weather={weather}
                loading={weatherLoading}
              />
            </View>

            {/* ==============================================
                TEMPERATURE

                ChartCard.tsx internally renders:
                - Interior Temperature
                - Battery Temperature
                - Solar Panel Temperature
                ============================================== */}

            <View
              style={styles.fullWidthCard}
            >
              <ChartCard
                type="temperature"
                monitoring={monitoring}
                loading={loading}
              />
            </View>
          </View>
        </View>

        {/* ==================================================
            APPLIANCE RECOMMENDATION
            ================================================== */}

        <View
          style={styles.section}
        >
          <AppText
            variant="body"
            style={styles.sectionTitle}
          >
            Appliance Recommendation
          </AppText>

          <AppRecCard />
        </View>

        {/* ==================================================
            RECENT ACTIVITY
            ================================================== */}

        <View
          style={styles.section}
        >
          <ActivityCard />
        </View>

        {/* ==================================================
            COPYRIGHT
            ================================================== */}

        <Copyright />
      </ScrollView>

      {/* ====================================================
          SIDEBAR
          ==================================================== */}

      <Sidebar
        visible={sidebarVisible}
        onClose={() =>
          setSidebarVisible(false)
        }
      />
    </ScreenContainer2>
  );
}

const dashboardDimensions = {
  horizontalPadding: 16,
  sectionSpacing: 18,
  cardRadius: 16,
  monitorGap: 10,
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor:
      Colors.light.background,
  },

  scrollContent: {
    paddingHorizontal:
      dashboardDimensions.horizontalPadding,
    paddingTop: 20,
    paddingBottom: 24,
  },

  headerCard: {
    backgroundColor:
      Colors.glass.white,
    borderWidth: 3,
    borderColor:
      Colors.light.secondary,
    borderRadius:
      dashboardDimensions.cardRadius,
    padding: 18,
    marginBottom: 18,
  },

  headerTitle: {
    color: "#000000",
    fontWeight: "700",
  },

  headerSubtitle: {
    color:
      Colors.light.textSecondary,
    marginTop: 6,
  },

  section: {
    width: "100%",
    marginBottom:
      dashboardDimensions.sectionSpacing,
  },

  sectionTitle: {
    color: "#000000",
    fontWeight: "700",
    marginBottom: 10,
  },

  monitorGrid: {
    width: "100%",
    flexDirection: "column",
    gap:
      dashboardDimensions.monitorGap,
  },

  /*
   * Battery occupies the complete row.
   *
   * ChartCard.tsx renders the battery gauge
   * as a complete-width monitoring card.
   */
  batteryCardContainer: {
    width: "100%",
  },

  /*
   * All remaining ChartCards are grouped cards
   * that occupy their complete available width.
   *
   * ChartCard.tsx handles the internal layout
   * of Battery Monitoring, Solar Monitoring,
   * Weather, and Temperature Monitoring.
   */
  fullWidthCard: {
    width: "100%",
  },
});
