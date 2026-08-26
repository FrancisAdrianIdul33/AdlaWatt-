import { router } from "expo-router";

import React from "react";

import { Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";

import { Colors } from "@/constants/colors";

import { Routes } from "@/constants/routes";

export type ActivityCardData = {
  id: string;
  type: "info" | "warning" | "error" | "critical";
  title: string;
  details: string;
  date: string;
  time: string;
};

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
    type: "critical",
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
    details: "The battery level changed from 52% to 50%.",
    date: "Aug 10, 2026",
    time: "07:44 AM",
  },
  {
    id: "5",
    type: "error",
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
    type: "critical",
    title: "Inverter Overload Detected",
    details:
      "The inverter detected a load that exceeded the recommended operating level.",
    date: "Aug 09, 2026",
    time: "09:15 PM",
  },
];

const recentActivities = activities.slice(0, 5);

export default function ActivityCard() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <AppText variant="body" style={styles.title}>
          Recent Activity
        </AppText>

        <Pressable
          onPress={() => router.push(Routes.ACTIVITY_LOGS)}
        >
          <AppText variant="caption" style={styles.viewAll}>
            View All
          </AppText>
        </Pressable>
      </View>

      <View style={styles.list}>
        {recentActivities.map((activity) => (
          <View
            key={activity.id}
            style={styles.item}
          >
            <View
              style={[
                styles.indicator,
                {
                  backgroundColor:
                    activity.type === "info"
                      ? Colors.light.primary
                      : activity.type === "warning"
                        ? Colors.light.secondary
                        : "#EF4444",
                },
              ]}
            />

            <View style={styles.content}>
              <AppText
                variant="caption"
                style={styles.activityTitle}
              >
                {activity.title}
              </AppText>

              <AppText
                variant="caption"
                style={styles.details}
              >
                {activity.details}
              </AppText>

              <AppText
                variant="caption"
                style={styles.timestamp}
              >
                {activity.date} • {activity.time}
              </AppText>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  wrapper: {
    marginTop: 20,
  },

  title: {
    color: "#000000",
    fontWeight: "700",
    marginBottom: 10,
  },

  viewAll: {
    color: "#FFFFFF",
    fontWeight: "700",
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    fontSize: 12,
    marginTop: -14,
    marginRight: 2,
  },

  list: {
    width: "100%",
    gap: 10,
  },

  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.glass.white,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderRadius: 16,
    padding: 12,
  },

  indicator: {
    width: 10,
    height: 10,
    borderRadius: 4,
    marginTop: 5,
    marginRight: 10,
  },

  content: {
    flex: 1,
  },

  activityTitle: {
    color: "#000000",
    fontWeight: "700",
  },

  details: {
    color: Colors.light.textSecondary,
    marginTop: 3,
  },

  timestamp: {
    color: Colors.light.textSecondary,
    marginTop: 10,
    fontSize: 11,
  },
});