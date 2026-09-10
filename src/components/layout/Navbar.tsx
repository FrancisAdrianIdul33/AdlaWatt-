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

interface NavBarProps {
  onNotificationPress?: () => void;
  onMenuPress?: () => void;
}

export default function NavBar({
  onNotificationPress,
  onMenuPress,
}: NavBarProps) {
  const [hasUnreadNotifications, setHasUnreadNotifications] =
    useState(false);

  /*
   * Check if the authenticated user has
   * at least one unread notification.
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

  return (
    <View style={navBarStyles.wrapper}>
      <View style={navBarStyles.container}>
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
    justifyContent: "flex-end",
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
});