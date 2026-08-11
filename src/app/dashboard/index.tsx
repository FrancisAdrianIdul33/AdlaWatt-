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
import ChartCard from "@/components/ChartCard";
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

  const recentActivities = activities.slice(0, 5);

  const dashboardData = {
    batteryLevel: 50,
    batteryStatus: "Discharging",
    timeRemaining: "4h 12m",
    solarInput: "46W",
    solarStatus: "Moderate" as const,
    currentLoad: "170W",
    deviceStatus: "Online" as const,
    batteryTemperature: 20.0,
    batteryTemperatureStatus: "Normal" as const,
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

          <View style={styles.monitorGrid}>
            <ChartCard
              type="battery"
              value={dashboardData.batteryLevel}
              status={dashboardData.batteryStatus}
              timeRemaining={dashboardData.timeRemaining}
            />

            <ChartCard
              type="solar"
              value={dashboardData.solarInput}
              status={dashboardData.solarStatus}
            />

            <ChartCard
              type="load"
              value={dashboardData.currentLoad}
            />

            <ChartCard
              type="device"
              status={dashboardData.deviceStatus}
            />

            <ChartCard
              type="temperature"
              value={dashboardData.batteryTemperature}
              status={dashboardData.batteryTemperatureStatus}
            />
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
  monitorGap: 10,
  recommendationHeight: 76,
};

const styles = StyleSheet.create({
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

  monitorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: dashboardDimensions.monitorGap,
  },

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