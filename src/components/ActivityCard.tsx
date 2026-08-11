import React from "react";
import { StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";

export type ActivityCardData = {
  id: string;
  title: string;
  details: string;
  date: string;
  time: string;
  type: "info" | "warning" | "error";
};

type ActivityCardProps = {
  activity: ActivityCardData;
};

export default function ActivityCard({
  activity,
}: ActivityCardProps) {
  const getActivityColor = () => {
    switch (activity.type) {
      case "warning":
        return Colors.light.secondary;

      case "error":
        return "#D32F2F";

      case "info":
      default:
        return Colors.light.primary;
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
      {/* Activity Indicator */}
      <View
        style={[
          styles.indicator,
          {
            backgroundColor: activityColor,
          },
        ]}
      />

      {/* Activity Content */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <AppText
            variant="body"
            style={styles.title}
          >
            {activity.title}
          </AppText>

          <View style={styles.dateTimeContainer}>
            <AppText
              variant="caption"
              style={styles.date}
            >
              {activity.date}
            </AppText>

            <AppText
              variant="caption"
              style={styles.time}
            >
              {activity.time}
            </AppText>
          </View>
        </View>

        <AppText
          variant="caption"
          style={styles.details}
        >
          {activity.details}
        </AppText>
      </View>
    </View>
  );
}

const activityDimensions = {
  borderWidth: 3,
  cardRadius: 16,
  cardPadding: 15,
  indicatorSize: 11,
};

const styles = StyleSheet.create({
  card: {
    width: "100%",

    minHeight: 90,

    flexDirection: "row",

    alignItems: "flex-start",

    backgroundColor: Colors.glass.white,

    borderWidth:
      activityDimensions.borderWidth,

    borderRadius:
      activityDimensions.cardRadius,

    padding:
      activityDimensions.cardPadding,
  },

  indicator: {
    width:
      activityDimensions.indicatorSize,

    height:
      activityDimensions.indicatorSize,

    borderRadius:
      activityDimensions.indicatorSize / 2,

    marginRight: 12,

    marginTop: 5,
  },

  content: {
    flex: 1,
  },

  titleRow: {
    width: "100%",

    flexDirection: "row",

    alignItems: "flex-start",

    justifyContent: "space-between",
  },

  title: {
    flex: 1,

    color: "#000000",

    fontWeight: "700",

    marginRight: 10,
  },

  dateTimeContainer: {
    alignItems: "flex-end",

    justifyContent: "flex-start",

    minWidth: 90,
  },

  date: {
    color:
      Colors.light.textSecondary,

    fontSize: 10,

    fontWeight: "400",

    textAlign: "right",
  },

  time: {
    color:
      Colors.light.textSecondary,

    fontSize: 10,

    fontWeight: "400",

    marginTop: 2,

    textAlign: "right",
  },

  details: {
    color:
      Colors.light.textSecondary,

    lineHeight: 18,

    fontWeight: "400",

    marginTop: 4,

    paddingRight: 4,
  },
});