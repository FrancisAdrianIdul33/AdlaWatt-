import { Ionicons } from "@expo/vector-icons";

import { router, usePathname } from "expo-router";

import React from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import AppText from "@/components/ui/AppText";

import { Colors } from "@/constants/colors";
import { Routes } from "@/constants/routes";

// ============================================================
// ICON COLORS
// ============================================================

// Active tab icon - matches the ChartCard.tsx icon accent.
const ACTIVE_ICON = Colors.light.iconAccent;

// Inactive tab icons balance against the green body.
const IDLE_ICON = Colors.light.onPrimaryMuted;

// Every label sits at ~90% white so the text stays readable on
// top of the primary green while keeping the icon the focus.
const LABEL_COLOR = Colors.light.onPrimarySoft;

// ============================================================
// TABS (left -> right)
// ============================================================

const TABS = [
  {
    icon: "home" as const,
    label: "Dashboard",
    href: Routes.DASHBOARD,
  },
  {
    icon: "grid" as const,
    label: "Appliances",
    href: Routes.APPLIANCES,
  },
  {
    icon: "analytics" as const,
    label: "Analytics",
    href: Routes.ANALYTICS,
  },
  {
    icon: "menu" as const,
    label: "Menu",
    href: Routes.MENU,
  },
];

// ============================================================
// NAVBAR BOTTOM
// ============================================================

export default function NavBarBottom() {
  const pathname = usePathname();

  return (
    <View style={navBarBottomStyles.wrapper}>
      {/* ======================================================
          SECONDARY ACCENT LINE (on top, mirrors Navbar's
          accent flipped to the bottom edge)
          ====================================================== */}

      <View style={navBarBottomStyles.accentLine} />

      <View style={navBarBottomStyles.container}>
        {TABS.map((tab) => {
          const isActive = pathname === tab.href;

          return (
            <Pressable
              key={tab.href}
              onPress={() =>
                router.navigate(tab.href)
              }
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              style={({ pressed }) => [
                navBarBottomStyles.tab,
                pressed &&
                  navBarBottomStyles.pressed,
              ]}
            >
              <Ionicons
                name={tab.icon}
                size={navBarBottomDimensions.iconSize}
                color={
                  isActive
                    ? ACTIVE_ICON
                    : IDLE_ICON
                }
              />

              <AppText
                variant="caption"
                style={[
                  navBarBottomStyles.label,
                  isActive &&
                    navBarBottomStyles.activeLabel,
                ]}
              >
                {tab.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const navBarBottomDimensions = {
  height: 72,
  iconSize: 25,
};

const navBarBottomStyles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },

  accentLine: {
    width: "100%",
    height: 3,
    backgroundColor: Colors.light.secondary,
  },

  container: {
    height: navBarBottomDimensions.height,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    backgroundColor: Colors.light.primary,
  },

  tab: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },

  label: {
    color: LABEL_COLOR,
    fontSize: 11,
    fontWeight: "600",
  },

  activeLabel: {
    fontWeight: "700",
  },

  pressed: {
    opacity: 0.7,
  },
});