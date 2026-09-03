import React, { useState } from "react";

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

export default function DashboardScreen() {
  const [sidebarVisible, setSidebarVisible] =
    useState(false);

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
        contentContainerStyle={
          styles.scrollContent
        }
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
            {/* Battery - Full Row */}
            <View style={styles.batteryCardContainer}>
              <ChartCard type="battery" />
            </View>

            {/* Row 1 */}
            <ChartCard type="solar" />
            <ChartCard type="load" />

            {/* Row 2 */}
            <ChartCard type="device" />
            <ChartCard type="dod" />

            {/* Row 3 */}
            <ChartCard type="temperature" />
            <ChartCard type="solar_temperature" />
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
   * The remaining ChartCards use their
   * own width defined in ChartCard.tsx.
   */
  batteryCardContainer: {
    width: "100%",
  },
});