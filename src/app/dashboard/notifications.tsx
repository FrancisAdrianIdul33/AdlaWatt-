import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import Copyright from "@/components/forms/Copyright";
import NavBar from "@/components/layout/Navbar";
import ScreenContainer2 from "@/components/layout/ScreenContainer2";
import Sidebar from "@/components/layout/Sidebar";
import AppText from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";

export default function NotificationsScreen() {
  const [sidebarVisible, setSidebarVisible] =
    useState(false);

  const notifications = [
    {
      title: "Battery Discharging",
      message:
        "The battery is currently supplying power to connected appliances.",
      time: "10:42 AM",
      type: "warning",
    },
    {
      title: "Solar Input Detected",
      message:
        "Solar energy is currently being received by the system.",
      time: "10:35 AM",
      type: "success",
    },
    {
      title: "Appliance Connected",
      message:
        "An appliance has been connected to the AdlaWatt system.",
      time: "10:28 AM",
      type: "info",
    },
    {
      title: "System Online",
      message:
        "AdlaWatt is connected and monitoring the system.",
      time: "10:15 AM",
      type: "success",
    },
  ];

  return (
    <ScreenContainer2>
      {/* Fixed Navbar */}
      <NavBar
        onMenuPress={() =>
          setSidebarVisible(true)
        }
      />

      {/* Notifications */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerCard}>
          <AppText
            variant="heading"
            style={styles.title}
          >
            Notifications
          </AppText>

          <AppText
            variant="caption"
            style={styles.subtitle}
          >
            System notifications and important
            alerts will appear here.
          </AppText>
        </View>

        {/* Notification List */}
        <View style={styles.notificationList}>
          {notifications.map(
            (notification, index) => (
              <View
                key={`${notification.title}-${index}`}
                style={styles.notificationCard}
              >
                {/* Status Indicator */}
                <View
                  style={[
                    styles.indicator,
                    notification.type ===
                      "success" &&
                      styles.successIndicator,
                    notification.type ===
                      "warning" &&
                      styles.warningIndicator,
                    notification.type ===
                      "info" &&
                      styles.infoIndicator,
                  ]}
                />

                {/* Notification Content */}
                <View style={styles.notificationContent}>
                  <AppText
                    variant="body"
                    style={styles.notificationTitle}
                  >
                    {notification.title}
                  </AppText>

                  <AppText
                    variant="caption"
                    style={styles.notificationMessage}
                  >
                    {notification.message}
                  </AppText>

                  <AppText
                    variant="caption"
                    style={styles.notificationTime}
                  >
                    {notification.time}
                  </AppText>
                </View>
              </View>
            ),
          )}
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

const notificationDimensions = {
  borderWidth: 3,
  cardRadius: 16,
  cardPadding: 15,
  indicatorSize: 11,
  cardSpacing: 12,
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,

    backgroundColor:
      Colors.light.background,
  },

  content: {
    padding: 16,

    paddingBottom: 24,
  },

  /* Header */

  headerCard: {
    backgroundColor:
      Colors.glass.white,

    borderWidth:
      notificationDimensions.borderWidth,

    borderColor:
      Colors.light.primary,

    borderRadius:
      notificationDimensions.cardRadius,

    padding: 18,

    marginBottom: 18,
  },

  title: {
    color: "#000000",

    fontWeight: "700",
  },

  subtitle: {
    color:
      Colors.light.textSecondary,

    marginTop: 6,

    fontWeight: "400",

    lineHeight: 19,
  },

  /* Notification List */

  notificationList: {
    width: "100%",

    gap: notificationDimensions.cardSpacing,
  },

  notificationCard: {
    width: "100%",

    minHeight: 90,

    flexDirection: "row",

    alignItems: "center",

    backgroundColor:
      Colors.glass.white,

    borderWidth:
      notificationDimensions.borderWidth,

    borderColor:
      Colors.light.secondary,

    borderRadius:
      notificationDimensions.cardRadius,

    padding:
      notificationDimensions.cardPadding,
  },

  indicator: {
    width:
      notificationDimensions.indicatorSize,

    height:
      notificationDimensions.indicatorSize,

    borderRadius:
      notificationDimensions.indicatorSize / 2,

    marginRight: 12,
  },

  successIndicator: {
    backgroundColor:
      Colors.light.primary,
  },

  warningIndicator: {
    backgroundColor:
      Colors.light.secondary,
  },

  infoIndicator: {
    backgroundColor:
      Colors.light.primary,
  },

  notificationContent: {
    flex: 1,
  },

  notificationTitle: {
    color: "#000000",

    fontWeight: "700",

    marginBottom: 3,
  },

  notificationMessage: {
    color:
      Colors.light.textSecondary,

    lineHeight: 18,

    fontWeight: "400",
  },

  notificationTime: {
    color:
      Colors.light.textSecondary,

    fontSize: 10,

    marginTop: 5,

    fontWeight: "400",
  },
});