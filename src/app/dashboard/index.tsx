import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import ActivityCard from "@/components/ActivityCard";
import AppRecCard from "@/components/AppRecCard";
import ChartCard from "@/components/ChartCard";
import Copyright from "@/components/forms/Copyright";
import NavBar from "@/components/layout/Navbar";
import ScreenContainer2 from "@/components/layout/ScreenContainer2";
import Sidebar from "@/components/layout/Sidebar";
import AppText from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";

export default function DashboardScreen() {
  const [sidebarVisible, setSidebarVisible] = useState(false);

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
  };

  return (
    <ScreenContainer2>
      {/* Fixed Navbar */}
      <NavBar
        onMenuPress={() => setSidebarVisible(true)}
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

        {/* Appliance Recommendation */}
        <View style={styles.section}>
          <AppText
            variant="body"
            style={styles.sectionTitle}
          >
            Appliance Recommendation
          </AppText>

          <AppRecCard />
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <ActivityCard />
        </View>

      <Copyright />
    </ScrollView>

      {/* Sidebar */ }
  <Sidebar
    visible={sidebarVisible}
    onClose={() => setSidebarVisible(false)}
  />
    </ScreenContainer2 >
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
    backgroundColor: Colors.light.background,
  },

  scrollContent: {
    paddingHorizontal: dashboardDimensions.horizontalPadding,
    paddingTop: 20,
    paddingBottom: 24,
  },

  headerCard: {
    backgroundColor: Colors.glass.white,
    borderWidth: 3,
    borderColor: Colors.light.secondary,
    borderRadius: dashboardDimensions.cardRadius,
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
    marginBottom: dashboardDimensions.sectionSpacing,
  },

  sectionTitle: {
    color: "#000000",
    fontWeight: "700",
    marginBottom: 10,
  },

  monitorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: dashboardDimensions.monitorGap,
  },

});