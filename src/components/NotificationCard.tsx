import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";

export type NotificationType = "normal" | "alert";

export interface NotificationCardData {
  id: string;
  title: string;
  message: string;
  date: string;
  time: string;
  type: NotificationType;
  isRead: boolean;
}

interface NotificationCardProps {
  notification?: NotificationCardData | null;
}

export default function NotificationCard({
  notification,
}: NotificationCardProps) {
  /*
   * Safety fallback
   */
  const safeNotification: NotificationCardData =
    notification ?? {
      id: "unknown",
      title: "Notification",
      message: "No notification details available.",
      date: "",
      time: "",
      type: "normal",
      isRead: true,
    };

  /*
   * Normalize notification type
   */
  const notificationType: NotificationType =
    safeNotification.type === "alert"
      ? "alert"
      : "normal";

  const isRecent = !safeNotification.isRead;
  const isAlert = notificationType === "alert";

  return (
    <View
      style={[
        styles.notificationCard,

        isRecent
          ? styles.recentNotification
          : styles.earlierNotification,

        isAlert
          ? styles.alertNotification
          : styles.normalNotification,
      ]}
    >
      {/*
       * Unread indicator
       */}
      {isRecent && (
        <View style={styles.unreadIndicator} />
      )}

      {/*
       * Notification icon
       */}
      <View
        style={styles.notificationIconContainer}
      >
        <Ionicons
          name={
            isAlert
              ? "alert-circle-outline"
              : "notifications-outline"
          }
          size={21}
          color={
            isAlert
              ? Colors.light.error
              : "#2196F3"
          }
        />
      </View>

      {/*
       * Notification content
       */}
      <View style={styles.notificationContent}>
        <AppText
          variant="body"
          style={styles.notificationTitle}
        >
          {safeNotification.title}
        </AppText>

        <AppText
          variant="caption"
          style={styles.notificationMessage}
        >
          {safeNotification.message}
        </AppText>

        <View style={styles.dateTimeRow}>
          {safeNotification.date ? (
            <AppText
              variant="caption"
              style={styles.dateText}
            >
              {safeNotification.date}
            </AppText>
          ) : null}

          {safeNotification.time ? (
            <AppText
              variant="caption"
              style={styles.timeText}
            >
              {safeNotification.time}
            </AppText>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const notificationDimensions = {
  borderWidth: 3,
  cardRadius: 16,
  cardPadding: 15,

  indicatorSize: 9,
};

const styles = StyleSheet.create({
  /* Notification Card */

  notificationCard: {
    width: "100%",

    minHeight: 96,

    flexDirection: "row",
    alignItems: "flex-start",

    borderWidth:
      notificationDimensions.borderWidth,

    borderRadius:
      notificationDimensions.cardRadius,

    padding:
      notificationDimensions.cardPadding,
  },

  /*
   * Recent notifications
   *
   * Light-gray background distinguishes
   * recent/unread notifications.
   */
  recentNotification: {
    backgroundColor:
      "rgba(225, 225, 225, 0.65)",
  },

  /*
   * Earlier/read notifications
   *
   * Uses the normal glass background.
   */
  earlierNotification: {
    backgroundColor: Colors.glass.white,
  },

  /* Notification Type Borders */

  normalNotification: {
    borderColor: "#2196F3",
  },

  alertNotification: {
    borderColor: Colors.light.error,
  },

  /* Recent / Unread Dot */

  unreadIndicator: {
    width:
      notificationDimensions.indicatorSize,

    height:
      notificationDimensions.indicatorSize,

    borderRadius:
      notificationDimensions.indicatorSize / 2,

    backgroundColor:
      Colors.light.error,

    marginTop: 6,

    marginRight: 8,
  },

  /* Notification Icon */

  notificationIconContainer: {
    width: 28,

    alignItems: "center",

    marginTop: 1,

    marginRight: 7,
  },

  /* Notification Content */

  notificationContent: {
    flex: 1,
  },

  notificationTitle: {
    color: "#000000",

    fontWeight: "700",

    marginBottom: 3,
  },

  notificationMessage: {
    color: Colors.light.textSecondary,

    lineHeight: 18,

    fontWeight: "400",
  },

  /* Date and Time */

  dateTimeRow: {
    flexDirection: "row",

    justifyContent: "flex-end",

    alignItems: "center",

    gap: 10,

    marginTop: 7,
  },

  dateText: {
    color: Colors.light.textSecondary,

    fontSize: 10,
  },

  timeText: {
    color: Colors.light.textSecondary,

    fontSize: 10,

    fontWeight: "600",
  },
});