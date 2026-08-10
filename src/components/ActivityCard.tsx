import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";

type ActivityType = "info" | "warning" | "error";

interface ActivityCardProps {
  type: ActivityType;
  title: string;
  description: string;
  date: string;
  time: string;
}

export default function ActivityCard({
  type,
  title,
  description,
  date,
  time,
}: ActivityCardProps) {
  const getActivityColor = () => {
    switch (type) {
      case "warning":
        return Colors.light.secondary;

      case "error":
        return Colors.light.error;

      case "info":
      default:
        return Colors.light.primary;
    }
  };

  const getActivityIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case "warning":
        return "warning-outline";

      case "error":
        return "alert-circle-outline";

      case "info":
      default:
        return "information-circle-outline";
    }
  };

  const activityColor = getActivityColor();

  return (
    <View
      style={[
        styles.card,
        {
          borderColor: activityColor,
        },
      ]}
    >
      {/* Activity Content */}
      <View style={styles.content}>
        {/* Left Content */}
        <View style={styles.mainContent}>
          <View style={styles.titleRow}>
            {/* Activity Type Icon */}
            <Ionicons
              name={getActivityIcon()}
              size={20}
              color={activityColor}
              style={styles.activityIcon}
            />

            {/* Activity Title */}
            <AppText
              variant="body"
              style={styles.title}
              numberOfLines={2}
            >
              {title}
            </AppText>
          </View>

          {/* Activity Description */}
          <AppText
            variant="caption"
            style={styles.description}
          >
            {description}
          </AppText>
        </View>

        {/* Date and Time */}
        <View style={styles.dateTimeContainer}>
          <View style={styles.dateRow}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={Colors.light.textSecondary}
            />

            <AppText
              variant="caption"
              style={styles.dateText}
              numberOfLines={1}
            >
              {date}
            </AppText>
          </View>

          <View style={styles.timeRow}>
            <Ionicons
              name="time-outline"
              size={14}
              color={Colors.light.textSecondary}
            />

            <AppText
              variant="caption"
              style={styles.timeText}
              numberOfLines={1}
            >
              {time}
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
}

const activityCardDimensions = {
  borderWidth: 3,
  radius: 16,
  padding: 16,

  iconSize: 20,
  dateIconSize: 14,

  contentGap: 12,
  titleGap: 8,

  dateTimeGap: 4,
};

const styles = StyleSheet.create({
  card: {
    width: "100%",

    backgroundColor: Colors.glass.white,

    borderWidth: activityCardDimensions.borderWidth,
    borderRadius: activityCardDimensions.radius,

    padding: activityCardDimensions.padding,
  },

  content: {
    width: "100%",

    flexDirection: "row",
    alignItems: "flex-start",

    gap: activityCardDimensions.contentGap,
  },

  mainContent: {
    flex: 1,

    minWidth: 0,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",

    gap: activityCardDimensions.titleGap,

    paddingRight: 4,
  },

  activityIcon: {
    marginTop: 2,
  },

  title: {
    flex: 1,

    color: "#000000",

    fontWeight: "700",

    lineHeight: 21,
  },

  description: {
    color: Colors.light.textSecondary,

    lineHeight: 19,

    marginTop: 6,

    paddingRight: 4,
  },

  dateTimeContainer: {
    alignItems: "flex-end",

    gap: activityCardDimensions.dateTimeGap,

    minWidth: 105,
  },

  dateRow: {
    flexDirection: "row",

    alignItems: "center",

    gap: 4,
  },

  timeRow: {
    flexDirection: "row",

    alignItems: "center",

    gap: 4,
  },

  dateText: {
    color: Colors.light.textSecondary,

    fontSize: 11,

    lineHeight: 15,

    textAlign: "right",
  },

  timeText: {
    color: Colors.light.textSecondary,

    fontSize: 11,

    fontWeight: "600",

    lineHeight: 15,

    textAlign: "right",
  },
});