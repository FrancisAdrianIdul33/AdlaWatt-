import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors } from "@/constants/colors";
import { Routes } from "@/constants/routes";

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

const screenWidth = Dimensions.get("window").width;

export default function Sidebar({
  visible,
  onClose,
}: SidebarProps) {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const loadUsername = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUsername("");
        return;
      }

      const { data } = await supabase
        .from("users")
        .select("username")
        .eq("id", user.id)
        .single();

      setUsername(data?.username ?? "");
    };

    if (visible) {
      loadUsername();
    }
  }, [visible]);

  if (!visible) {
    return null;
  }

  const handleNavigation = (route: string) => {
    onClose();
    router.push(route as any);
  };

  const handleLogout = () => {
    const logout = () => {
      onClose();
      router.replace(Routes.LOGIN);
    };

    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Are you sure you want to sign out?",
      );

      if (confirmed) {
        logout();
      }

      return;
    }

    Alert.alert(
      "Log Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          style: "destructive",
          onPress: logout,
        },
      ],
    );
  };

  const handleExit = () => {
    Alert.alert(
      "Exit AdlaWatt",
      "Are you sure you want to exit AdlaWatt?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Exit",
          style: "destructive",
          onPress: () => {
            onClose();
          },
        },
      ],
    );
  };

  return (
    <View style={sidebarStyles.overlayContainer}>
      {/* Dark overlay */}
      <Pressable
        style={sidebarStyles.overlay}
        onPress={onClose}
      />

      {/* Sidebar */}
      <View style={sidebarStyles.sidebar}>
        {/* Close Button */}
        <View style={sidebarStyles.closeContainer}>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              sidebarStyles.closeButton,
              pressed && sidebarStyles.buttonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Close sidebar"
          >
            <Ionicons
              name="close"
              size={sidebarDimensions.closeIconSize}
              color="#000000"
            />
          </Pressable>
        </View>

        {/* Main navigation */}


        <View style={sidebarStyles.navigation}>
          {username ? (
            <Text style={sidebarStyles.username}>
              User: {username}
            </Text>
          ) : null}

          <SidebarButton
            icon="home-outline"
            label="Dashboard"
            onPress={() =>
              handleNavigation(Routes.DASHBOARD)
            }
          />

          <SidebarButton
            icon="flash-outline"
            label="Appliances"
            onPress={() =>
              handleNavigation(Routes.APPLIANCES)
            }
          />

          <SidebarButton
            icon="hardware-chip-outline"
            label="Components"
            onPress={() =>
              handleNavigation(Routes.COMPONENTS)
            }
          />

          <SidebarButton
            icon="list-outline"
            label="Activity Logs"
            onPress={() =>
              handleNavigation(Routes.ACTIVITY_LOGS)
            }
          />

          <SidebarButton
            icon="information-circle-outline"
            label="About Us"
            onPress={() =>
              handleNavigation(Routes.ABOUT_US)
            }
          />

          <SidebarButton
            icon="settings-outline"
            label="Settings"
            onPress={() =>
              handleNavigation(Routes.SETTINGS)
            }
          />
        </View>

        {/* Divider */}
        <View style={sidebarStyles.divider} />

        {/* Log Out / Exit */}
        <View style={sidebarStyles.bottomActions}>
          <SidebarButton
            icon="log-out-outline"
            label="Log Out"
            danger
            onPress={handleLogout}
          />

          <SidebarButton
            icon="exit-outline"
            label="Exit"
            danger
            onPress={handleExit}
          />
        </View>
      </View>
    </View>
  );
}

interface SidebarButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

function SidebarButton({
  icon,
  label,
  onPress,
  danger = false,
}: SidebarButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        sidebarStyles.button,

        danger
          ? sidebarStyles.dangerButton
          : sidebarStyles.navigationButton,

        pressed && sidebarStyles.buttonPressed,
      ]}
    >
      <Ionicons
        name={icon}
        size={30}
        color={
          danger
            ? Colors.light.error
            : Colors.light.text
        }
      />

      <Text
        style={[
          sidebarStyles.buttonText,

          danger
            ? sidebarStyles.dangerText
            : sidebarStyles.navigationText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const sidebarDimensions = {
  width: screenWidth * 0.82,

  horizontalPadding: 18,

  // Space above the first navigation button
  navigationTopMargin: 25,

  buttonHeight: 50,

  buttonRadius: 14,

  buttonBorderWidth: 3.5,

  buttonSpacing: 12,

  dividerHeight: 3,

  dividerMargin: 20,

  overlayOpacity: 0.5,

  // Close icon
  closeIconSize: 31,
};

const sidebarStyles = StyleSheet.create({
  overlayContainer: {
    position: "absolute",

    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    zIndex: 1000,

    flexDirection: "row",
  },

  overlay: {
    flex: 1,

    backgroundColor: `rgba(0, 0, 0, ${sidebarDimensions.overlayOpacity})`,
  },

  sidebar: {
    width: sidebarDimensions.width,

    height: "100%",

    backgroundColor: Colors.light.background,

    paddingHorizontal:
      sidebarDimensions.horizontalPadding,

    paddingBottom: 24,

    elevation: 20,

    shadowColor: "#000",

    shadowOffset: {
      width: -3,
      height: 0,
    },

    shadowOpacity: 0.2,

    shadowRadius: 8,
  },

  closeContainer: {
    width: "100%",

    height: 72,

    alignItems: "flex-end",

    justifyContent: "center",
  },

  closeButton: {
    alignItems: "center",

    justifyContent: "center",
  },

  navigation: {
    width: "100%",

    marginTop:
      sidebarDimensions.navigationTopMargin,
  },

  button: {
    width: "100%",

    height: sidebarDimensions.buttonHeight,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 16,

    borderRadius:
      sidebarDimensions.buttonRadius,

    borderWidth:
      sidebarDimensions.buttonBorderWidth,

    marginBottom:
      sidebarDimensions.buttonSpacing,

    gap: 12,
  },

  navigationButton: {
    backgroundColor: Colors.light.primary,

    borderColor: Colors.light.secondary,
  },

  dangerButton: {
    backgroundColor: "#000000",

    borderColor: Colors.light.error,
  },

  buttonPressed: {
    opacity: 0.75,
  },

  buttonText: {
    fontSize: 16,

    fontWeight: "600",
  },

  navigationText: {
    color: Colors.light.surface,
  },

  dangerText: {
    color: "#FFFFFF",
  },

  divider: {
    width: "100%",

    height: sidebarDimensions.dividerHeight,

    backgroundColor: Colors.light.border,

    marginVertical:
      sidebarDimensions.dividerMargin,
  },

  bottomActions: {
    width: "100%",
  },

  username: {
  color: "#000000",
  fontSize: 18,
  fontWeight: "600",
  marginBottom: 20,
  paddingHorizontal: 16,
},
});