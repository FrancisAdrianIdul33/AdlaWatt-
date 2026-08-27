import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import ApplianceModal from "@/components/forms/ApplianceModal";
import EmptyState from "@/components/ui/EmptyState";
import AppText from "@/components/ui/AppText";

import { Colors } from "@/constants/colors";
import { Routes } from "@/constants/routes";
import { Radius } from "@/constants/theme";
import { supabase } from "@/lib/supabase";

type Status =
  | "advisable"
  | "notAdvisable";

type Appliance = {
  id: string;
  name: string;
  watts: string;
  status: Status;
};

type AppRecCardProps = {
  onViewAll?: () => void;
};

const defaultImage = require(
  "@/assets/images/developers/avatar.jpg",
);

const tips = [
  "Use lower-wattage appliances first to extend the available battery energy.",
  "Avoid using several high-power appliances at the same time.",
  "Turn off appliances when they are not needed to conserve stored energy.",
  "Prioritize essential appliances during a power interruption.",
];

export default function AppRecCard({
  onViewAll,
}: AppRecCardProps) {
  const [mode, setMode] =
    useState<Status>("advisable");

  const [index, setIndex] = useState(0);

  const [tipIndex, setTipIndex] = useState(0);

  const [appliances, setAppliances] =
    useState<Appliance[]>([]);

  const [hasSelectedAppliances, setHasSelectedAppliances] =
    useState(false);

  const [modalVisible, setModalVisible] =
    useState(false);

  const buttonScale =
    useRef(new Animated.Value(1)).current;

  // ============================================
  // FILTER APPLIANCES BY STATUS
  // ============================================

  const filteredAppliances = useMemo(
    () =>
      appliances.filter(
        (item) => item.status === mode,
      ),
    [appliances, mode],
  );

  // ============================================
  // CAROUSEL ITEMS
  // ============================================

  const currentAppliances = useMemo(() => {
    if (filteredAppliances.length === 0) {
      return [];
    }

    const count = Math.min(
      2,
      filteredAppliances.length,
    );

    return Array.from(
      { length: count },
      (_, offset) =>
        filteredAppliances[
          (index + offset) %
            filteredAppliances.length
        ],
    );
  }, [filteredAppliances, index]);

  const isAdvisable =
    mode === "advisable";

  const statusColor = isAdvisable
    ? Colors.light.primary
    : "#EF4444";

  // ============================================
  // LOAD USER APPLIANCES
  // ============================================

  const loadAppliances = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setAppliances([]);
      setHasSelectedAppliances(false);
      return;
    }

    const { data, error } =
      await supabase
        .from("appliances")
        .select(
          "app_id, appliance_name, wattage, selection",
        )
        .eq("user_id", user.id)
        .order("appliance_name");

    if (error) {
      console.error(
        "Failed to load appliances:",
        error.message,
      );

      setAppliances([]);
      setHasSelectedAppliances(false);
      return;
    }

    const selectedRows =
      (data ?? []).filter(
        (item) => item.selection === true,
      );

    setHasSelectedAppliances(
      selectedRows.length > 0,
    );

    const mapped: Appliance[] =
      selectedRows.map((item) => {
        const values =
          String(item.wattage)
            .match(/\d+/g)
            ?.map(Number) ?? [];

        const maxWatts = Math.max(
          ...values,
          0,
        );

        return {
          id: item.app_id,
          name: item.appliance_name,
          watts: item.wattage,
          status:
            maxWatts > 300
              ? "notAdvisable"
              : "advisable",
        };
      });

    setAppliances(mapped);
  };

  // ============================================
  // INITIAL LOAD
  // ============================================

  useEffect(() => {
    loadAppliances();
  }, []);

  // ============================================
  // RESET CAROUSEL
  // ============================================

  useEffect(() => {
    setIndex(0);
  }, [mode]);

  // ============================================
  // APPLIANCE CAROUSEL
  // ============================================

  useEffect(() => {
    if (filteredAppliances.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      setIndex(
        (currentIndex) =>
          currentIndex + 1,
      );
    }, 5000);

    return () =>
      clearInterval(timer);
  }, [filteredAppliances.length]);

  // ============================================
  // ROTATING TIP
  // ============================================

  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex(
        (currentIndex) =>
          (currentIndex + 1) %
          tips.length,
      );
    }, 10000);

    return () =>
      clearInterval(timer);
  }, []);

  // ============================================
  // OPEN / CLOSE APPLIANCE MODAL
  // ============================================

  const openApplianceModal = () => {
    setModalVisible(true);
  };

  const closeApplianceModal = () => {
    setModalVisible(false);
    loadAppliances();
  };

  // ============================================
  // GET STARTED BUTTON ANIMATION
  // ============================================

  const animateButton = (
    scale: number,
  ) => {
    Animated.spring(buttonScale, {
      toValue: scale,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  // ============================================
  // MODE 1: NO SELECTED APPLIANCES
  // ============================================

  if (!hasSelectedAppliances) {
    return (
      <>
        <View style={styles.wrapper}>
          <View style={styles.getStartedBox}>
            <AppText
              variant="body"
              style={styles.getStartedTitle}
            >
              Welcome to AdlaWatt, Get started!
            </AppText>

            <Pressable
              onPress={openApplianceModal}
              onPressIn={() =>
                animateButton(0.95)
              }
              onPressOut={() =>
                animateButton(1)
              }
              accessibilityRole="button"
              accessibilityLabel="Add Appliances"
            >
              <Animated.View
                style={[
                  styles.addAppliancesButton,
                  {
                    transform: [
                      {
                        scale: buttonScale,
                      },
                    ],
                  },
                ]}
              >
                <Ionicons
                  name="add"
                  size={21}
                  color="#FFFFFF"
                />

                <AppText
                  variant="caption"
                  style={
                    styles.addAppliancesButtonText
                  }
                >
                  Add Appliances
                </AppText>
              </Animated.View>
            </Pressable>
          </View>
        </View>

        <ApplianceModal
          visible={modalVisible}
          onClose={closeApplianceModal}
        />
      </>
    );
  }

  // ============================================
  // MODE 2: SELECTED APPLIANCES EXIST
  // ============================================

  return (
    <>
      <View style={styles.wrapper}>
        {/* Rotating Tip */}
        <View style={styles.tip}>
          <Ionicons
            name="bulb-outline"
            size={19}
            color={Colors.light.secondary}
          />

          <View style={styles.tipContent}>
            <AppText
              variant="caption"
              style={styles.tipTitle}
            >
              Tip
            </AppText>

            <AppText
              variant="caption"
              style={styles.tipText}
            >
              {tips[tipIndex]}
            </AppText>
          </View>
        </View>

        {/* Appliances / Empty State */}
        {filteredAppliances.length > 0 ? (
          <>
            <View style={styles.applianceRow}>
              {currentAppliances.map(
                (appliance) => (
                  <View
                    key={appliance.id}
                    style={[
                      styles.applianceBox,
                      {
                        borderColor:
                          statusColor,
                      },
                    ]}
                  >
                    {/* Fixed Image Area */}
                    <View
                      style={[
                        styles.imageContainer,
                        {
                          borderColor:
                            statusColor,
                        },
                      ]}
                    >
                      <Image
                        source={defaultImage}
                        style={styles.image}
                        resizeMode="cover"
                      />
                    </View>

                    {/* Bounded Appliance Name */}
                    <AppText
                      variant="caption"
                      style={styles.name}
                      numberOfLines={2}
                    >
                      {appliance.name}
                    </AppText>

                    {/* Wattage */}
                    <AppText
                      variant="caption"
                      style={styles.watts}
                      numberOfLines={1}
                    >
                      {appliance.watts}
                    </AppText>

                    {/* Status */}
                    <View
                      style={[
                        styles.status,
                        {
                          backgroundColor:
                            statusColor,
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          isAdvisable
                            ? "checkmark-circle-outline"
                            : "alert-circle-outline"
                        }
                        size={13}
                        color="#FFFFFF"
                      />

                      <AppText
                        variant="caption"
                        style={
                          styles.statusText
                        }
                        numberOfLines={1}
                      >
                        {isAdvisable
                          ? "OK to use"
                          : "Not advisable"}
                      </AppText>
                    </View>
                  </View>
                ),
              )}
            </View>

            {/* Carousel Indicator */}
            <View style={styles.indicator}>
              {filteredAppliances.map(
                (item, itemIndex) => (
                  <View
                    key={item.id}
                    style={[
                      styles.dot,
                      {
                        backgroundColor:
                          itemIndex ===
                          index %
                            filteredAppliances.length
                            ? statusColor
                            : Colors.light.border,
                      },
                    ]}
                  />
                ),
              )}
            </View>
          </>
        ) : (
          <View
            style={
              styles.recommendationEmptyState
            }
          >
            <EmptyState
              icon="hardware-chip-outline"
              title={
                isAdvisable
                  ? "No Advisable Appliances"
                  : "No Not Advisable Appliances"
              }
              description={
                isAdvisable
                  ? "No selected appliances are currently advisable to use."
                  : "No selected appliances are currently not advisable to use."
              }
            />
          </View>
        )}

        {/* Status Toggle */}
        <View style={styles.toggle}>
          <Pressable
            onPress={() =>
              setMode("advisable")
            }
            accessibilityRole="button"
            accessibilityLabel="Show advisable appliances"
            style={({ pressed }) => [
              styles.toggleButton,
              mode === "advisable" && {
                backgroundColor:
                  Colors.light.primary,
              },
              pressed &&
                styles.pressed,
            ]}
          >
            <AppText
              variant="caption"
              style={[
                styles.toggleText,
                mode === "advisable" &&
                  styles.activeToggleText,
              ]}
            >
              Advisable
            </AppText>
          </Pressable>

          <Pressable
            onPress={() =>
              setMode("notAdvisable")
            }
            accessibilityRole="button"
            accessibilityLabel="Show not advisable appliances"
            style={({ pressed }) => [
              styles.toggleButton,
              mode === "notAdvisable" && {
                backgroundColor:
                  "#EF4444",
              },
              pressed &&
                styles.pressed,
            ]}
          >
            <AppText
              variant="caption"
              style={[
                styles.toggleText,
                mode === "notAdvisable" &&
                  styles.activeToggleText,
              ]}
            >
              Not Advisable
            </AppText>
          </Pressable>
        </View>

        {/* View All */}
        <Pressable
          onPress={() =>
            onViewAll
              ? onViewAll()
              : router.push(
                  Routes.APPLIANCES,
                )
          }
          accessibilityRole="button"
          accessibilityLabel="View all appliances"
          style={({ pressed }) => [
            styles.viewAll,
            pressed && styles.pressed,
          ]}
        >
          <AppText
            variant="caption"
            style={styles.viewAllText}
          >
            View All
          </AppText>

          <Ionicons
            name="arrow-forward"
            size={16}
            color="#FFFFFF"
          />
        </Pressable>
      </View>

      <ApplianceModal
        visible={modalVisible}
        onClose={closeApplianceModal}
      />
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    alignItems: "center",
    gap: 2,
  },

  // ============================================
  // FIXED APPLIANCE CAROUSEL
  // ============================================

  applianceRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: 12,
    minHeight: 220,
  },

  applianceBox: {
    width: "46%",
    maxWidth: 150,
    height: 220,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderRadius: Radius.md,
    padding: 12,
    alignItems: "center",
    justifyContent: "flex-start",
    overflow: "hidden",
  },

  imageContainer: {
    width: 110,
    height: 110,
    flexShrink: 0,
    backgroundColor: "#dfdfdf",
    borderWidth: 2,
    borderRadius: Radius.md,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  name: {
    width: "100%",
    height: 40,
    flexShrink: 0,
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },

  watts: {
    width: "100%",
    height: 18,
    flexShrink: 0,
    color: Colors.light.textSecondary,
    fontSize: 13,
    textAlign: "center",
    marginTop: 2,
  },

  status: {
    maxWidth: "100%",
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderRadius: Radius.md,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginTop: 6,
    flexShrink: 0,
  },

  statusText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    flexShrink: 1,
  },

  // ============================================
  // CAROUSEL INDICATOR
  // ============================================

  indicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    minHeight: 7,
    marginTop: 10,
    marginBottom: 16,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  // ============================================
  // STATUS TOGGLE
  // ============================================

  toggle: {
    width: "100%",
    maxWidth: 360,
    minHeight: 46,
    flexDirection: "row",
    backgroundColor: Colors.glass.white,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    padding: 3,
    marginTop: 2,
  },

  toggleButton: {
    flex: 1,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
  },

  toggleText: {
    color: Colors.light.text,
    fontSize: 13,
    fontWeight: "700",
  },

  activeToggleText: {
    color: "#FFFFFF",
  },

  // ============================================
  // VIEW ALL
  // ============================================

  viewAll: {
    width: "100%",
    maxWidth: 360,
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.md,
    marginTop: 12,
    marginBottom: 15,
  },

  viewAllText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  // ============================================
  // TIP
  // ============================================

  tip: {
    width: "100%",
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      "rgba(255, 165, 0, 0.08)",
    borderWidth: 1,
    borderColor: Colors.light.secondary,
    borderRadius: Radius.md,
    padding: 10,
    marginTop: 5,
    marginBottom: 14,
  },

  tipContent: {
    flex: 1,
    marginLeft: 8,
  },

  tipTitle: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },

  tipText: {
    color: Colors.light.textSecondary,
    fontSize: 14,
    lineHeight: 17,
    flexShrink: 1,
  },

  // ============================================
  // EMPTY STATE
  // ============================================

  recommendationEmptyState: {
    width: "100%",
    marginBottom: 14,
  },

  // ============================================
  // MODE 1 - GET STARTED
  // ============================================

  getStartedBox: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    paddingVertical: 22,
    paddingHorizontal: 16,
    alignItems: "center",
  },

  getStartedTitle: {
    color: "#000000",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },

  addAppliancesButton: {
    minHeight: 46,
    width: "100%",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.md,
  },

  addAppliancesButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  // ============================================
  // PRESS FEEDBACK
  // ============================================

  pressed: {
    opacity: 0.7,
  },
});