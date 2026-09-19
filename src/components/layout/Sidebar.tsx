import { Colors } from "@/constants/colors";
import { Routes } from "@/constants/routes";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import React, { useEffect } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

const screenWidth = Dimensions.get("window").width;

/*
 * The logo asset is 500x220 (2.27:1). Keep this ratio so the
 * logo renders with its true proportions inside its container.
 */
const LOGO_ASPECT_RATIO = 500 / 220;

export default function Sidebar({
  visible,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  // While the sidebar is open, lock page scrolling and stop the
  // browser from applying pinch / trackpad zoom, which expands
  // the page beyond its bounds and exposes a white screen.
  // Restored on close.
  useDisableSidebarScrollAndZoom(visible);

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
          onPress: onClose,
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
        {/* ==================================================
            HEADER - CLOSE BUTTON + LOGO
            (pinned so the top always looks organized while
            the logo image is still loading)
            ================================================== */}

        <View style={sidebarStyles.header}>
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

          <View style={sidebarStyles.logoContainer}>
            <Image
              source={require("@/assets/images/adlawatt-logo.png")}
              style={sidebarStyles.logo}
              resizeMode="contain"
              fadeDuration={0}
              accessibilityLabel="AdlaWatt logo"
            />
          </View>
        </View>

        {/* ==================================================
            MAIN NAVIGATION
            (scrollable so nothing is ever cut off on short
            screens - the layout stays organized at any size)
            ================================================== */}

        <ScrollView
          style={sidebarStyles.navigationScroll}
          contentContainerStyle={
            sidebarStyles.navigationContent
          }
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <SidebarButton
            icon="home-outline"
            label="Dashboard"
            active={pathname === Routes.DASHBOARD}
            onPress={() =>
              handleNavigation(Routes.DASHBOARD)
            }
          />

          <SidebarButton
            icon="flash-outline"
            label="Appliances"
            active={pathname === Routes.APPLIANCES}
            onPress={() =>
              handleNavigation(Routes.APPLIANCES)
            }
          />

          <SidebarButton
            icon="analytics-outline"
            label="Analytics"
            active={pathname === Routes.ANALYTICS}
            onPress={() =>
              handleNavigation(Routes.ANALYTICS)
            }
          />

          <SidebarButton
            icon="hardware-chip-outline"
            label="Components"
            active={pathname === Routes.COMPONENTS}
            onPress={() =>
              handleNavigation(Routes.COMPONENTS)
            }
          />

          <SidebarButton
            icon="list-outline"
            label="Activity Logs"
            active={pathname === Routes.ACTIVITY_LOGS}
            onPress={() =>
              handleNavigation(Routes.ACTIVITY_LOGS)
            }
          />

          <SidebarButton
            icon="information-circle-outline"
            label="About Us"
            active={pathname === Routes.ABOUT_US}
            onPress={() =>
              handleNavigation(Routes.ABOUT_US)
            }
          />

          <SidebarButton
            icon="settings-outline"
            label="Settings"
            active={pathname === Routes.SETTINGS}
            onPress={() =>
              handleNavigation(Routes.SETTINGS)
            }
          />
        </ScrollView>

        {/* ==================================================
            DIVIDER + LOG OUT / EXIT
            (pinned at the bottom and always visible)
            ================================================== */}

        <View style={sidebarStyles.divider} />

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

/*
 * While the sidebar is open:
 *  - web: the page scroll is locked (mouse wheel, trackpad and
 *    touch drag) and pinch / double-tap / ctrl+wheel zoom is
 *    blocked, so the content behind the overlay never moves.
 *  - native: no-op. The full-screen overlay already swallows
 *    touches, so the screen's ScrollView can't scroll behind
 *    the sidebar.
 */
function useDisableSidebarScrollAndZoom(
  active: boolean,
) {
  useEffect(() => {
    if (!active || typeof document === "undefined") {
      return;
    }

    const cancel = (event: Event) => {
      event.preventDefault();
    };

    const cancelWheelZoom = (event: WheelEvent) => {
      if (event.ctrlKey) {
        event.preventDefault();
      }
    };

    const root = document.documentElement;
    const body = document.body;

    // Lock the page so the background can't scroll while the
    // sidebar is open. Wheel and touch events land on the
    // overlay and can only scroll the document, which is now
    // locked. The sidebar's own ScrollView is a nested scroll
    // container and keeps its independent scrolling.
    const previousOverflow = body.style.overflow;
    const previousOverScroll =
      body.style.overscrollBehavior;
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";

    const previousTouchAction = root.style.touchAction;
    root.style.touchAction = "pan-y";

    document.addEventListener(
      "gesturestart",
      cancel,
      { passive: false },
    );
    document.addEventListener(
      "gesturechange",
      cancel,
      { passive: false },
    );
    document.addEventListener(
      "gestureend",
      cancel,
      { passive: false },
    );
    document.addEventListener(
      "dblclick",
      cancel,
      { passive: false },
    );
    document.addEventListener(
      "wheel",
      cancelWheelZoom,
      { passive: false },
    );

    return () => {
      body.style.overflow = previousOverflow;
      body.style.overscrollBehavior =
        previousOverScroll;
      root.style.touchAction =
        previousTouchAction;

      document.removeEventListener(
        "gesturestart",
        cancel,
      );
      document.removeEventListener(
        "gesturechange",
        cancel,
      );
      document.removeEventListener(
        "gestureend",
        cancel,
      );
      document.removeEventListener(
        "dblclick",
        cancel,
      );
      document.removeEventListener(
        "wheel",
        cancelWheelZoom,
      );
    };
  }, [active]);
}

interface SidebarButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
  active?: boolean;
}

function SidebarButton({
  icon,
  label,
  onPress,
  danger = false,
  active = false,
}: SidebarButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        sidebarStyles.button,
        danger
          ? sidebarStyles.dangerButton
          : active
            ? sidebarStyles.activeButton
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
            : sidebarDimensions.iconColor
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

  // Fixed logo area
  logoContainerHeight: 105,
  logoWidth: 150,
  logoHeight: 96,

  buttonHeight: 50,
  buttonWidth: "100%",
  buttonRadius: 15,
  buttonBorderWidth: 3.5,
  buttonSpacing: 15,
  dividerHeight: 3,
  dividerMargin: 20,
  overlayOpacity: 0.5,

  // Close icon
  closeIconSize: 31,

  // Navigation icon color - matches the ChartCard.tsx icon hex
  // (#FACC15). Log Out / Exit keep their red danger color.
  iconColor: "#FACC15",
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
    boxShadow: "-3px 0px 8px rgba(0,0,0,0.2)",
  },

  /*
   * Fixed header keeps the close button and logo in a stable
   * position regardless of nav scrolling or image loading.
   */
  header: {
    width: "100%",
  },

  closeContainer: {
    width: "100%",
    height: 72,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },

  logoContainer: {
    width: "100%",
    height: sidebarDimensions.logoContainerHeight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  logo: {
    height: sidebarDimensions.logoHeight,
    aspectRatio: LOGO_ASPECT_RATIO,
  },

  navigationScroll: {
    width: "100%",
    flexGrow: 1,
    flexShrink: 1,
    marginTop:
      sidebarDimensions.navigationTopMargin,
  },

  navigationContent: {
    paddingBottom: 8,
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
    borderColor: "transparent",
  },

  activeButton: {
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
});