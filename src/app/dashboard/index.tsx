import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import ActivityCard, {
  ActivityCardData,
} from "@/components/ActivityCard";
import Copyright from "@/components/forms/Copyright";
import NavBar from "@/components/layout/Navbar";
import ScreenContainer2 from "@/components/layout/ScreenContainer2";
import Sidebar from "@/components/layout/Sidebar";
import AppText from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";
import { Routes } from "@/constants/routes";
import { router } from "expo-router";

export default function DashboardScreen() {
  const [sidebarVisible, setSidebarVisible] =
    useState(false);

  /*
   * Activity data currently matches the same
   * activity data used by activity-logs.tsx.
   *
   * Later, this can be replaced with data fetched
   * from the database.
   */
  const activities: ActivityCardData[] = [
    {
      id: "1",
      type: "info",
      title: "Solar Charging Started",
      details:
        "The solar panel is currently charging the battery using available sunlight.",
      date: "Aug 10, 2026",
      time: "08:42 AM",
    },
    {
      id: "2",
      type: "info",
      title: "Appliance Connected",
      details:
        "An electric fan was detected and added to the current power load.",
      date: "Aug 10, 2026",
      time: "08:35 AM",
    },
    {
      id: "3",
      type: "warning",
      title: "Battery Level Low",
      details:
        "The battery level has dropped below the recommended operating level.",
      date: "Aug 10, 2026",
      time: "07:58 AM",
    },
    {
      id: "4",
      type: "info",
      title: "Battery Level Updated",
      details:
        "The battery level changed from 52% to 50%.",
      date: "Aug 10, 2026",
      time: "07:44 AM",
    },
    {
      id: "5",
      type: "warning",
      title: "High Power Consumption",
      details:
        "The current appliance load is higher than the recommended level.",
      date: "Aug 10, 2026",
      time: "07:20 AM",
    },
    {
      id: "6",
      type: "error",
      title: "Sensor Connection Lost",
      details:
        "The battery temperature sensor is no longer responding.",
      date: "Aug 10, 2026",
      time: "06:52 AM",
    },
    {
      id: "7",
      type: "info",
      title: "System Online",
      details:
        "AdlaWatt successfully connected to the monitoring system.",
      date: "Aug 10, 2026",
      time: "06:30 AM",
    },
    {
      id: "8",
      type: "error",
      title: "Inverter Overload Detected",
      details:
        "The inverter detected a load that exceeded the recommended operating level.",
      date: "Aug 09, 2026",
      time: "09:15 PM",
    },
  ];

  /*
   * The activity data is already arranged from newest
   * to oldest, matching activity-logs.tsx.
   *
   * Only the latest 5 activities are shown on the
   * Dashboard.
   */
  const recentActivities = activities.slice(0, 5);

  const dashboardData = {
    batteryLevel: 50,
    batteryStatus: "Discharging",
    timeRemaining: "4h 12m",

    solarInput: "46W",
    solarStatus: "Moderate",

    currentLoad: "170W",

    deviceStatus: "Online",

    batteryTemperature: "20.0°C",

    recommendedAppliance: "Electric Fan",
  };

  return (
    <ScreenContainer2>
      {/* Fixed Navbar */}
      <NavBar
        onMenuPress={() =>
          setSidebarVisible(true)
        }
      />

      {/* Dashboard */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Dashboard Header */}
        <View style={styles.headerCard}>
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

        {/* Appliance Recommendation */}
        <View style={styles.section}>
          <AppText
            variant="body"
            style={styles.sectionTitle}
          >
            Appliance Recommendation
          </AppText>

          <View style={styles.recommendation}>
            <View style={styles.recommendationIcon}>
              <AppText style={styles.bolt}>
                ⚡
              </AppText>
            </View>

            <View style={styles.recommendationInfo}>
              <AppText
                variant="body"
                style={styles.recommendationTitle}
              >
                {dashboardData.recommendedAppliance}
              </AppText>

              <AppText
                variant="caption"
                style={styles.secondaryText}
              >
                Recommended based on available power.
              </AppText>
            </View>
          </View>
        </View>

        {/* Real-Time Monitoring */}
        <View style={styles.section}>
          <AppText
            variant="body"
            style={styles.sectionTitle}
          >
            Real-Time Monitoring
          </AppText>

          {/* Battery */}
          <View style={styles.batterySection}>
            <View style={styles.batteryCircle}>
              <AppText
                variant="heading"
                style={styles.batteryPercentage}
              >
                {dashboardData.batteryLevel}%
              </AppText>

              <AppText
                variant="caption"
                style={styles.batteryLabel}
              >
                Battery
              </AppText>

              <View style={styles.batteryStatus}>
                <AppText
                  variant="caption"
                  style={styles.batteryStatusText}
                >
                  {dashboardData.batteryStatus}
                </AppText>
              </View>
            </View>

            <AppText
              variant="caption"
              style={styles.remainingText}
            >
              Time Remaining:{" "}
              {dashboardData.timeRemaining}
            </AppText>
          </View>

          {/* Monitoring Values */}
          <View style={styles.monitorGrid}>
            {/* Solar Input */}
            <View style={styles.monitorCard}>
              <AppText
                variant="caption"
                style={styles.monitorLabel}
              >
                Solar Input
              </AppText>

              <AppText
                variant="heading"
                style={styles.monitorValue}
              >
                {dashboardData.solarInput}
              </AppText>

              <View style={styles.statusBadge}>
                <AppText
                  variant="caption"
                  style={styles.statusBadgeText}
                >
                  {dashboardData.solarStatus}
                </AppText>
              </View>
            </View>

            {/* Load */}
            <View style={styles.monitorCard}>
              <AppText
                variant="caption"
                style={styles.monitorLabel}
              >
                Load Now
              </AppText>

              <AppText
                variant="heading"
                style={styles.monitorValue}
              >
                {dashboardData.currentLoad}
              </AppText>
            </View>

            {/* Device */}
            <View style={styles.monitorCard}>
              <AppText
                variant="caption"
                style={styles.monitorLabel}
              >
                Device
              </AppText>

              <AppText
                variant="heading"
                style={styles.onlineValue}
              >
                {dashboardData.deviceStatus}
              </AppText>
            </View>

            {/* Battery Temperature */}
            <View style={styles.monitorCard}>
              <AppText
                variant="caption"
                style={styles.monitorLabel}
              >
                Battery Temp
              </AppText>

              <AppText
                variant="heading"
                style={styles.monitorValue}
              >
                {dashboardData.batteryTemperature}
              </AppText>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.activityHeader}>
            <AppText
              variant="body"
              style={styles.sectionTitle}
            >
              Recent Activity
            </AppText>

            <Pressable
              onPress={() =>
                router.push(Routes.ACTIVITY_LOGS)
              }
            >
              <AppText
                variant="caption"
                style={styles.viewAll}
              >
                View All
              </AppText>
            </Pressable>
          </View>

          <View style={styles.activityList}>
            {recentActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
              />
            ))}
          </View>
        </View>

        <Copyright />
      </ScrollView>

      {/* Sidebar */}
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

  borderWidth: 3,

  cardRadius: 16,

  innerRadius: 12,

  batteryCircleSize: 128,

  monitorGap: 10,

  monitorHeight: 86,

  recommendationHeight: 76,

  activityHeight: 62,
};

const styles = StyleSheet.create({
  /* =========================
     MAIN DASHBOARD
  ========================= */

  scrollView: {
    flex: 1,

    backgroundColor: Colors.light.background,
  },

  scrollContent: {
    paddingHorizontal:
      dashboardDimensions.horizontalPadding,

    paddingTop: 20,

    paddingBottom: 24,
  },

  /* =========================
     HEADER
  ========================= */

  headerCard: {
    backgroundColor: Colors.glass.white,

    borderWidth: 3,

    borderColor: Colors.light.secondary,

    borderRadius: 16,

    padding: 18,

    marginBottom: 18,
  },

  headerTitle: {
    color: "#000000",

    fontWeight: "700",
  },

  headerSubtitle: {
    color: Colors.light.textSecondary,

    marginTop: 6,
  },

  /* =========================
     SECTIONS
  ========================= */

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

  /* =========================
     APPLIANCE RECOMMENDATION
  ========================= */

  recommendation: {
    minHeight:
      dashboardDimensions.recommendationHeight,

    width: "100%",

    borderWidth:
      dashboardDimensions.borderWidth,

    borderColor: Colors.light.primary,

    borderRadius:
      dashboardDimensions.cardRadius,

    backgroundColor: Colors.glass.white,

    paddingHorizontal: 14,

    flexDirection: "row",

    alignItems: "center",
  },

  recommendationIcon: {
    width: 46,

    height: 46,

    borderRadius: 23,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: Colors.light.primary,

    marginRight: 12,
  },

  bolt: {
    fontSize: 22,

    color: "#FFFFFF",
  },

  recommendationInfo: {
    flex: 1,
  },

  recommendationTitle: {
    color: "#000000",

    fontWeight: "700",

    marginBottom: 3,
  },

  secondaryText: {
    color: Colors.light.textSecondary,

    lineHeight: 19,

    fontWeight: "400",
  },

  /* =========================
     BATTERY
  ========================= */

  batterySection: {
    alignItems: "center",

    marginBottom: 18,
  },

  batteryCircle: {
    width:
      dashboardDimensions.batteryCircleSize,

    height:
      dashboardDimensions.batteryCircleSize,

    borderWidth:
      dashboardDimensions.borderWidth,

    borderColor: Colors.light.primary,

    borderRadius:
      dashboardDimensions.batteryCircleSize / 2,

    backgroundColor: Colors.glass.white,

    alignItems: "center",

    justifyContent: "center",
  },

  batteryPercentage: {
    color: "#000000",

    fontSize: 28,

    fontWeight: "700",
  },

  batteryLabel: {
    color: "#000000",

    marginTop: -2,

    fontWeight: "400",
  },

  batteryStatus: {
    paddingHorizontal: 9,

    paddingVertical: 3,

    borderRadius: 8,

    backgroundColor: Colors.light.primary,

    marginTop: 4,
  },

  batteryStatusText: {
    color: "#FFFFFF",

    fontSize: 8,

    fontWeight: "600",
  },

  remainingText: {
    color: Colors.light.textSecondary,

    marginTop: 9,

    fontWeight: "400",
  },

  /* =========================
     MONITORING
  ========================= */

  monitorGrid: {
    flexDirection: "row",

    flexWrap: "wrap",

    gap: dashboardDimensions.monitorGap,
  },

  monitorCard: {
    width: "48%",

    minHeight:
      dashboardDimensions.monitorHeight,

    borderWidth:
      dashboardDimensions.borderWidth,

    borderColor: Colors.light.secondary,

    borderRadius:
      dashboardDimensions.innerRadius,

    backgroundColor: Colors.glass.white,

    alignItems: "center",

    justifyContent: "center",

    paddingHorizontal: 6,
  },

  monitorLabel: {
    color: "#000000",

    textAlign: "center",

    marginBottom: 3,

    fontWeight: "400",
  },

  monitorValue: {
    color: "#000000",

    fontSize: 21,

    fontWeight: "700",

    textAlign: "center",
  },

  onlineValue: {
    color: Colors.light.primary,

    fontSize: 21,

    fontWeight: "700",

    textAlign: "center",
  },

  statusBadge: {
    marginTop: 4,

    paddingHorizontal: 9,

    paddingVertical: 3,

    borderRadius: 8,

    backgroundColor: Colors.light.primary,
  },

  statusBadgeText: {
    color: "#FFFFFF",

    fontSize: 8,

    fontWeight: "600",
  },

  /* =========================
     ACTIVITY
  ========================= */

  activityHeader: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  viewAll: {
    color: "#FFFFFF",

    fontWeight: "700",

    backgroundColor: Colors.light.primary,

    paddingHorizontal: 12,

    paddingVertical: 6,

    borderRadius: 15,

    fontSize: 12,

    marginTop: -10,

    marginRight: 2,
  },

  activityList: {
    width: "100%",

    gap: 9,
  },
});