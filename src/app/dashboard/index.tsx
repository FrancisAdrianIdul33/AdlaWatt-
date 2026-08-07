import React from "react";
import {
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

import Copyright from "@/components/forms/Copyright";
import NavBar from "@/components/layout/Navbar";
import ScreenContainer2 from "@/components/layout/ScreenContainer2";
import AppText from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";

export default function DashboardScreen() {
  return (
    <ScreenContainer2>
      {/* Fixed Navbar */}
      <NavBar />

      {/* Scrollable Dashboard Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Appliance Recommendation */}
        <View style={styles.sectionCard}>
          <AppText
            variant="body"
            style={styles.sectionTitle}
          >
            Appliance Recommendation
          </AppText>

          <View style={styles.recommendationContent}>
            <AppText
              variant="caption"
              style={styles.secondaryText}
            >
              Recommended appliances will appear here.
            </AppText>
          </View>
        </View>

        {/* Real-Time Monitoring */}
        <View style={styles.sectionCard}>
          <AppText
            variant="body"
            style={styles.sectionTitle}
          >
            Real-Time Monitoring
          </AppText>

          {/* Battery */}
          <View style={styles.batteryContainer}>
            <View style={styles.batteryCircle}>
              <AppText
                variant="heading"
                style={styles.batteryPercentage}
              >
                50%
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
                  Discharging
                </AppText>
              </View>
            </View>

            <AppText
              variant="caption"
              style={styles.remainingText}
            >
              Time Remaining: 0h 4m 12secs
            </AppText>
          </View>

          {/* Monitoring Values */}
          <View style={styles.monitorGrid}>
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
                46W
              </AppText>

              <View style={styles.statusBadge}>
                <AppText
                  variant="caption"
                  style={styles.statusBadgeText}
                >
                  Moderate
                </AppText>
              </View>
            </View>

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
                170W
              </AppText>
            </View>

            <View style={styles.monitorCard}>
              <AppText
                variant="caption"
                style={styles.monitorLabel}
              >
                Device
              </AppText>

              <AppText
                variant="heading"
                style={styles.monitorValue}
              >
                Online
              </AppText>
            </View>

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
                20.0°C
              </AppText>
            </View>
          </View>
        </View>

        {/* Activity Log */}
        <View style={styles.activitySection}>
          <AppText
            variant="body"
            style={styles.sectionTitle}
          >
            Activity Log
          </AppText>

          <View style={styles.activityList}>
            {[
              "Activity 1",
              "Activity 2",
              "Activity 3",
              "Activity 4",
            ].map((activity, index) => (
              <View
                key={`${activity}-${index}`}
                style={styles.activityItem}
              >
                <AppText
                  variant="caption"
                  style={styles.activityText}
                >
                  {activity}
                </AppText>
              </View>
            ))}
          </View>
        </View>

        {/* Temporary extra content to test scrolling */}
        <View style={styles.testSection}>
          <AppText
            variant="body"
            style={styles.sectionTitle}
          >
            Dashboard Preview
          </AppText>

          <AppText
            variant="caption"
            style={styles.secondaryText}
          >
            This section is temporary and is only here to
            test dashboard scrolling. The NavBar should
            remain visible while this content moves.
          </AppText>
        </View>

        <View style={styles.testSection}>
          <AppText
            variant="body"
            style={styles.sectionTitle}
          >
            More Dashboard Content
          </AppText>

          <AppText
            variant="caption"
            style={styles.secondaryText}
          >
            Additional monitoring components will be
            added here later.
          </AppText>
        </View>

        <Copyright />
      </ScrollView>
    </ScreenContainer2>
  );
}

const dashboardDimensions = {
  horizontalPadding: 14,

  sectionSpacing: 14,

  cardRadius: 14,

  sectionPadding: 14,

  monitorGap: 10,

  monitorCardHeight: 72,

  activityItemHeight: 48,

  batteryCircleSize: 112,
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,

    backgroundColor: Colors.light.background,
  },

  scrollContent: {
    paddingHorizontal:
      dashboardDimensions.horizontalPadding,

    paddingTop: dashboardDimensions.sectionSpacing,

    paddingBottom: 20,
  },

  sectionCard: {
    width: "100%",

    backgroundColor: Colors.light.background,

    borderRadius: dashboardDimensions.cardRadius,

    padding: dashboardDimensions.sectionPadding,

    marginBottom:
      dashboardDimensions.sectionSpacing,
  },

  sectionTitle: {
    color: Colors.light.text,

    fontWeight: "600",

    marginBottom: 12,
  },

  recommendationContent: {
    minHeight: 42,

    borderRadius: 10,

    backgroundColor: Colors.light.surface,

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 12,
  },

  secondaryText: {
    color: Colors.light.textSecondary,

    lineHeight: 20,
  },

  batteryContainer: {
    alignItems: "center",

    marginBottom: 14,
  },

  batteryCircle: {
    width: dashboardDimensions.batteryCircleSize,
    height: dashboardDimensions.batteryCircleSize,

    borderWidth: 5,

    borderColor: Colors.light.text,

    borderRadius:
      dashboardDimensions.batteryCircleSize / 2,

    alignItems: "center",
    justifyContent: "center",
  },

  batteryPercentage: {
    color: Colors.light.text,

    fontWeight: "700",

    fontSize: 26,
  },

  batteryLabel: {
    color: Colors.light.text,

    marginTop: -2,
  },

  batteryStatus: {
    paddingHorizontal: 7,
    paddingVertical: 2,

    borderRadius: 6,

    backgroundColor: Colors.light.text,
  },

  batteryStatusText: {
    color: Colors.light.surface,

    fontSize: 8,
  },

  remainingText: {
    color: Colors.light.textSecondary,

    marginTop: 8,
  },

  monitorGrid: {
    flexDirection: "row",

    flexWrap: "wrap",

    gap: dashboardDimensions.monitorGap,
  },

  monitorCard: {
    width: "48%",

    minHeight:
      dashboardDimensions.monitorCardHeight,

    backgroundColor: Colors.light.surface,

    borderRadius: 10,

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 6,
  },

  monitorLabel: {
    color: Colors.light.textSecondary,

    textAlign: "center",
  },

  monitorValue: {
    color: Colors.light.text,

    fontSize: 20,

    fontWeight: "700",

    textAlign: "center",
  },

  statusBadge: {
    marginTop: 3,

    paddingHorizontal: 7,
    paddingVertical: 1,

    borderRadius: 6,

    backgroundColor: Colors.light.text,
  },

  statusBadgeText: {
    color: Colors.light.surface,

    fontSize: 8,
  },

  activitySection: {
    width: "100%",

    backgroundColor: Colors.light.background,

    borderRadius: dashboardDimensions.cardRadius,

    padding: dashboardDimensions.sectionPadding,

    borderWidth: 2,

    borderColor: Colors.light.secondary,

    marginBottom:
      dashboardDimensions.sectionSpacing,
  },

  activityList: {
    width: "100%",

    backgroundColor: Colors.light.surface,

    borderRadius: 10,

    padding: 10,

    gap: 8,
  },

  activityItem: {
    minHeight:
      dashboardDimensions.activityItemHeight,

    backgroundColor: Colors.light.text,

    borderRadius: 6,

    justifyContent: "center",

    paddingHorizontal: 14,
  },

  activityText: {
    color: Colors.light.surface,
  },

  testSection: {
    width: "100%",

    backgroundColor: Colors.light.background,

    borderRadius: dashboardDimensions.cardRadius,

    padding: dashboardDimensions.sectionPadding,

    marginBottom:
      dashboardDimensions.sectionSpacing,
  },
});