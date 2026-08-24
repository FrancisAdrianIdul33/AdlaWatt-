import React from "react";

import { StyleSheet, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import AppText from "@/components/ui/AppText";

import { Colors } from "@/constants/colors";

export type ActivityType =
  | "info"
  | "warning"
  | "error"
  | "critical";

export type ActivityCardData = {
  id: string;
  title: string;
  details: string;
  date: string;
  time: string;
  type: ActivityType;
};

type ActivityCardProps = {
  activity?: ActivityCardData | null;
};

export default function ActivityCard({
  activity,
}: ActivityCardProps) {
  /*
   * Safety fallback
   *
   * Prevents the component from crashing if
   * activity-logs.tsx temporarily passes undefined
   * or null.
   */
  const safeActivity: ActivityCardData =
    activity ?? {
      id: "unknown",
      title: "Activity",
      details: "No activity details available.",
      date: "",
      time: "",
      type: "info",
    };

  /*
   * Normalize the activity type.
   *
   * Supports all activity types allowed by
   * the activity_logs Supabase table:
   *
   * info
   * warning
   * error
   * critical
   */
  const activityType: ActivityType =
    safeActivity.type === "critical"
      ? "critical"
      : safeActivity.type === "error"
        ? "error"
        : safeActivity.type === "warning"
          ? "warning"
          : "info";

  /*
   * Activity border, indicator, and icon color.
   */
  const activityColor =
    activityType === "warning"
      ? Colors.light.secondary
      : activityType === "error" ||
          activityType === "critical"
        ? Colors.light.error
        : Colors.light.primary;

  /*
   * Activity icon.
   */
  const activityIcon =
    activityType === "warning"
      ? "warning-outline"
      : activityType === "error" ||
          activityType === "critical"
        ? "alert-circle-outline"
        : "information-circle-outline";

  return (
    <View
      style={[
        styles.card,
        {
          borderColor: activityColor,
        },
      ]}
    >
      {/* Activity Type Indicator */}
      <View
        style={[
          styles.indicator,
          {
            backgroundColor: activityColor,
          },
        ]}
      />

      {/* Activity Information */}
      <View style={styles.content}>
        <View style={styles.mainRow}>
          {/* Title and Details */}
          <View style={styles.textContainer}>
            <AppText
              variant="caption"
              style={styles.title}
              numberOfLines={2}
            >
              {safeActivity.title}
            </AppText>

            <AppText
              variant="caption"
              style={styles.details}
            >
              {safeActivity.details}
            </AppText>
          </View>

          {/* Date and Time */}
          <View style={styles.dateTimeContainer}>
            {safeActivity.date ? (
              <AppText
                variant="caption"
                style={styles.date}
              >
                {safeActivity.date}
              </AppText>
            ) : null}

            {safeActivity.time ? (
              <AppText
                variant="caption"
                style={styles.time}
              >
                {safeActivity.time}
              </AppText>
            ) : null}
          </View>
        </View>
      </View>

      {/* Activity Icon */}
      <View style={styles.iconContainer}>
        <Ionicons
          name={
            activityIcon as keyof typeof Ionicons.glyphMap
          }
          size={17}
          color={activityColor}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",

    minHeight: 90,

    flexDirection: "row",

    alignItems: "center",

    backgroundColor: Colors.glass.white,

    borderWidth: 3,

    borderRadius: 16,

    paddingVertical: 13,

    paddingHorizontal: 13,

    marginBottom: 9,
  },

  indicator: {
    width: 11,

    height: 11,

    borderRadius: 5.5,

    marginRight: 11,
  },

  content: {
    flex: 1,

    minWidth: 0,
  },

  mainRow: {
    width: "100%",

    flexDirection: "row",

    alignItems: "flex-start",

    justifyContent: "space-between",
  },

  textContainer: {
    flex: 1,

    minWidth: 0,

    paddingRight: 10,
  },

  title: {
    color: "#000000",

    fontWeight: "700",

    marginBottom: 3,
  },

  details: {
    color: Colors.light.textSecondary,

    lineHeight: 18,

    fontWeight: "400",
  },

  dateTimeContainer: {
    minWidth: 78,

    alignItems: "flex-end",

    justifyContent: "flex-start",

    marginLeft: 5,
  },

  date: {
    color: Colors.light.textSecondary,

    fontSize: 10,

    fontWeight: "400",

    textAlign: "right",
  },

  time: {
    color: Colors.light.textSecondary,

    fontSize: 10,

    fontWeight: "400",

    marginTop: 2,

    textAlign: "right",
  },

  iconContainer: {
    width: 24,

    height: 24,

    alignItems: "center",

    justifyContent: "center",

    marginLeft: 4,
  },
});