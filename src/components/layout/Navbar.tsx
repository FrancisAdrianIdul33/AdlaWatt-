import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Pressable,
    StyleSheet,
    View,
} from "react-native";

import AppLogo from "@/components/ui/AppLogo";
import { Colors } from "@/constants/colors";
import { LinearGradient } from "expo-linear-gradient";

interface NavBarProps {
  onNotificationPress?: () => void;
  onMenuPress?: () => void;
}

export default function NavBar({
  onNotificationPress,
  onMenuPress,
}: NavBarProps) {
  return (
    <View style={navBarStyles.wrapper}>
        
    <LinearGradient
    colors={[
      Colors.gradient.navBarStart,
      Colors.gradient.navBarEnd,
    ]}
    start={{ x: -50, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={navBarStyles.container}
    >
        {/* AdlaWatt Logo */}
        <View style={navBarStyles.logoContainer}>
          <AppLogo
            width={105}
            height={50}
          />
        </View>

        {/* Right-side actions */}
        <View style={navBarStyles.actions}>
          {/* Notification */}
          <Pressable
            onPress={onNotificationPress}
            style={navBarStyles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Ionicons
              name="notifications-outline"
              size={27}
              color={Colors.light.text}
            />

            <View style={navBarStyles.notificationDot} />
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
              size={31}
              color={Colors.light.text}
            />
          </Pressable>
    
      </View>
      </LinearGradient>

      {/* Orange accent line */}
      <View style={navBarStyles.accentLine} />
      
    </View>
  );
}

const navBarDimensions = {
  height: 72,

  horizontalPadding: 16,

  logoWidth: 105,
  logoHeight: 50,

  // Manual logo position adjustment
  logoOffsetX: -20,
  logoOffsetY: 10,

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

    backgroundColor: Colors.light.surface,

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

    justifyContent: "space-between",

    paddingHorizontal:
      navBarDimensions.horizontalPadding,
  },

  logoContainer: {
  width: navBarDimensions.logoWidth,
  height: navBarDimensions.logoHeight,
  alignItems: "flex-start",
  justifyContent: "center",

  transform: [
    { translateX: navBarDimensions.logoOffsetX },
    { translateY: navBarDimensions.logoOffsetY },
  ],
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

    backgroundColor: Colors.light.secondary,
  },

  accentLine: {
    width: "100%",

    height: navBarDimensions.accentHeight,

    backgroundColor: Colors.light.secondary,
  },
});