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

    const loadWeather = async () => {

      try {

        setWeatherLoading(true);

        const forecast =
          await getCurrentWeatherForUser();

        // Prevent state updates if the screen
        // has already been unmounted.

        if (!isMounted) {
          return;
        }

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

        // Weather failure should not affect
        // Supabase monitoring data.

        setWeather(null);

      } finally {

        if (isMounted) {
          setWeatherLoading(false);
        }

      }

    };

    loadWeather();

    return () => {

      isMounted = false;

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
                Voltage + Watt-hour + Load Now
                ============================================== */}

            <ChartCard
              type="voltage"
              monitoring={monitoring}
              loading={loading}
            />

            {/* ==============================================
                SOLAR + WEATHER
                Solar Input + Weather
                ============================================== */}

            <ChartCard
              type="solar"
              monitoring={monitoring}
              weather={weather}
              loading={weatherLoading}
            />

            {/* ==============================================
                TEMPERATURE
                Battery Temperature + Solar Panel Temperature
                ============================================== */}

            <ChartCard
              type="temperature"
              monitoring={monitoring}
              loading={loading}
            />

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
    flexDirection: "row",

    flexWrap: "wrap",

    gap:
      dashboardDimensions.monitorGap,
  },

  /*
   * Battery occupies the complete row.
   *
   * The remaining ChartCards use their
   * own width defined in ChartCard.tsx.
   */

  batteryCardContainer: {
    width: "100%",
  },
});