import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { Colors } from "@/constants/colors";
import { Routes } from "@/constants/routes";
import { supabase } from "@/lib/supabase";

import AppText from "@/components/ui/AppText";

interface NavBarProps {
  onNotificationPress?: () => void;
  onMenuPress?: () => void;
}

type DeviceStatus = "Online" | "Offline";

export default function NavBar({
  onNotificationPress,
  onMenuPress,
}: NavBarProps) {
  const [hasUnreadNotifications, setHasUnreadNotifications] =
    useState(false);

  const [deviceStatus, setDeviceStatus] =
    useState<DeviceStatus>("Offline");

  /*
   * Get device status from Supabase.
   */
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const loadDeviceStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setDeviceStatus("Offline");
        return;
      }

      const { data, error } = await supabase
        .from("monitoring")
        .select("device_status")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error loading device status:", error);
        setDeviceStatus("Offline");
        return;
      }

      setDeviceStatus(
        data?.device_status === "Online"
          ? "Online"
          : "Offline",
      );

      channel = supabase
        .channel(`navbar-device-status-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "monitoring",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            setDeviceStatus(
              payload.new.device_status === "Online"
                ? "Online"
                : "Offline",
            );
          },
        )
        .subscribe();
    };

    loadDeviceStatus();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  /*
   * Check for unread notifications.
   */
  useEffect(() => {
    const checkUnreadNotifications = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setHasUnreadNotifications(false);
        return;
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("notif_id")
        .eq("user_id", user.id)
        .eq("read", false)
        .limit(1);

      if (error) {
        console.error(
          "Error checking unread notifications:",
          error,
        );
        return;
      }

      setHasUnreadNotifications(
        (data?.length ?? 0) > 0,
      );
    };

    checkUnreadNotifications();
  }, []);

  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress();
      return;
    }

    router.push(Routes.NOTIFICATIONS);
  };

  const isOnline = deviceStatus === "Online";

  return (
    <View style={navBarStyles.wrapper}>
      <View style={navBarStyles.container}>

        {/* Device Status */}
        <View style={navBarStyles.deviceStatus}>
          <View
            style={[
              navBarStyles.statusDot,
              isOnline
                ? navBarStyles.onlineDot
                : navBarStyles.offlineDot,
            ]}
          />

          <AppText
            variant="caption"
            style={navBarStyles.statusText}
          >
            {deviceStatus}
          </AppText>
        </View>

        {/* Right-side actions */}
        <View style={navBarStyles.actions}>

          {/* Notification */}
          <Pressable
            onPress={handleNotificationPress}
            style={navBarStyles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Ionicons
              name="notifications-outline"
              size={navBarDimensions.notificationIconSize}
              color={Colors.light.text}
            />

            {hasUnreadNotifications && (
              <View style={navBarStyles.notificationDot} />
            )}
          </Pressable>

          {/* Menu */}
          <Pressable
            onPress={onMenuPress}
            style={navBarStyles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Menu"
          >
            <Ionicons
              name="menu-outline"
              size={navBarDimensions.menuIconSize}
              color={Colors.light.text}
            />
          </Pressable>

        </View>
      </View>

      {/* Secondary accent line */}
      <View style={navBarStyles.accentLine} />
    </View>
  );
}

const navBarDimensions = {
  height: 72,
  horizontalPadding: 16,
  iconButtonWidth: 42,
  iconButtonHeight: 42,
  notificationIconSize: 27,
  menuIconSize: 31,
  notificationDotSize: 8,
  accentHeight: 3,

  // Device status capsule
  deviceStatusWidth: 80,
  deviceStatusHeight: 29,
  deviceStatusRadius: 20,
  statusDotSize: 9,
  statusDotMargin: 8,
};
const navBarStyles = StyleSheet.create({
  wrapper: {
    width: "100%",
    zIndex: 100,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },

  container: {
    height: navBarDimensions.height,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // ← changed
    paddingHorizontal:
      navBarDimensions.horizontalPadding,
    backgroundColor: Colors.light.primary,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  iconButton: {
    width: navBarDimensions.iconButtonWidth,
    height: navBarDimensions.iconButtonHeight,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  notificationDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: navBarDimensions.notificationDotSize,
    height: navBarDimensions.notificationDotSize,
    borderRadius:
      navBarDimensions.notificationDotSize / 2,
    backgroundColor: Colors.light.error,
  },

  accentLine: {
    width: "100%",
    height: navBarDimensions.accentHeight,
    backgroundColor: Colors.light.secondary,
  },

  // Device status capsule
  deviceStatus: {
    width: navBarDimensions.deviceStatusWidth,
    height: navBarDimensions.deviceStatusHeight,
    borderRadius: navBarDimensions.deviceStatusRadius,
    backgroundColor: "#F0EAD6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  statusDot: {
    width: navBarDimensions.statusDotSize,
    height: navBarDimensions.statusDotSize,
    borderRadius: navBarDimensions.statusDotSize / 2,
    marginRight: navBarDimensions.statusDotMargin,
  },

  onlineDot: {
    backgroundColor: "#00A86B",
  },

  offlineDot: {
    backgroundColor: Colors.light.error,
  },

  statusText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
});