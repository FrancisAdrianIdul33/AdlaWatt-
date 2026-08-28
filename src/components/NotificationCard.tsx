import { Ionicons } from "@expo/vector-icons";

import React from "react";

import { StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";

import { Colors } from "@/constants/colors";

export type NotificationType =
  "normal" | "alert";

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
  const safeNotification: NotificationCardData =
    notification ?? {
      id: "unknown",
      title: "Notification",
      message:
        "No notification details available.",
      date: "",
      time: "",
      type: "normal",
      isRead: true,
    };

  const isAlert =
    safeNotification.type === "alert";

  const iconName: keyof typeof Ionicons.glyphMap =
    isAlert
      ? "alert-circle-outline"
      : "notifications-outline";

  const iconColor = isAlert
    ? Colors.light.error
    : Colors.light.primary;

  return (
    <View
      style={[
        styles.notificationCard,
        !safeNotification.isRead &&
          styles.unreadNotification,
      ]}
    >
      <View style={styles.notificationWrapper}>
        {/* Notification Icon */}
        <Ionicons
          name={iconName}
          size={24}
          color={iconColor}
        />

        {/* Notification Content */}
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

          <AppText
            variant="caption"
            style={styles.notificationTimestamp}
          >
            {safeNotification.date}
            {safeNotification.date &&
            safeNotification.time
              ? " • "
              : ""}
            {safeNotification.time}
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  notificationCard: {
    width: "100%",
    backgroundColor: Colors.glass.white,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderRadius: 16,
    padding: 14,
  },

  unreadNotification: {
    backgroundColor:
      "rgba(245, 245, 245, 0.85)",
  },

  notificationWrapper: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  notificationContent: {
    flex: 1,
  },

  notificationTitle: {
    color: "#000000",
    fontWeight: "700",
  },

  notificationMessage: {
    color: Colors.light.textSecondary,
    marginTop: 3,
    lineHeight: 18,
  },

  notificationTimestamp: {
    color: Colors.light.textSecondary,
    marginTop: 5,
    fontSize: 11,
  },
});