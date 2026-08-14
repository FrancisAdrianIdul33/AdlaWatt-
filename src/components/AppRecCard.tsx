import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import AppText from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";
import { Radius, Spacing } from "@/constants/theme";

type Status = "advisable" | "notAdvisable";

type Appliance = {
  id: string;
  name: string;
  watts: string;
  status: Status;
};

type AppRecCardProps = {
  onViewAll?: () => void;
};

const defaultImage = require("@/assets/images/developers/avatar.jpg");

const appliances: Appliance[] = [
  { id: "1", name: "Stand Fan / Desk Fan", watts: "35–75W", status: "advisable" },
  { id: "2", name: '32" to 43" LED Smart TV', watts: "30–80W", status: "advisable" },
  { id: "3", name: "Wi-Fi Router / Fiber Modem", watts: "10–20W", status: "advisable" },
  { id: "4", name: "LED Bulb / Ceiling Light", watts: "7–15W", status: "advisable" },
  { id: "5", name: "Laptop Power Adapter", watts: "45–65W", status: "advisable" },
  { id: "6", name: "Small Inverter Refrigerator", watts: "60–120W", status: "notAdvisable" },
  { id: "7", name: "Small Rice Cooker", watts: "300–500W", status: "notAdvisable" },
  { id: "8", name: "Basic Kitchen Blender", watts: "200–350W", status: "notAdvisable" },
];

const tips = [
  "Use lower-wattage appliances first to extend the available battery energy.",
  "Avoid using several high-power appliances at the same time.",
  "Turn off appliances when they are not needed to conserve stored energy.",
  "Prioritize essential appliances during a power interruption.",
];

export default function AppRecCard({
  onViewAll,
}: AppRecCardProps) {
  const [mode, setMode] = useState<Status>("advisable");
  const [index, setIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  const filteredAppliances = useMemo(
    () => appliances.filter((item) => item.status === mode),
    [mode],
  );

  const current = filteredAppliances[index % filteredAppliances.length];

  const isAdvisable = mode === "advisable";
  const statusColor = isAdvisable
    ? Colors.light.primary
    : "#EF4444";

  // Appliance changes every 5 seconds
  useEffect(() => {
    setIndex(0);

    const timer = setInterval(() => {
      setIndex((currentIndex) => currentIndex + 1);
    }, 5000);

    return () => clearInterval(timer);
  }, [mode]);

  // Tip changes every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((currentIndex) => (currentIndex + 1) % tips.length);
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  if (!current) return null;

  return (
    <View style={styles.wrapper}>
      {/* Appliance Carousel */}
      <View
        style={[
          styles.applianceBox,
          { borderColor: statusColor },
        ]}
      >
        <View
          style={[
            styles.imageContainer,
            { borderColor: statusColor },
          ]}
        >
          <Image
            source={defaultImage}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        <AppText
          variant="caption"
          style={styles.name}
          numberOfLines={2}
        >
          {current.name}
        </AppText>

        <AppText
          variant="caption"
          style={styles.watts}
        >
          {current.watts}
        </AppText>

        <View
          style={[
            styles.status,
            { backgroundColor: statusColor },
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
            style={styles.statusText}
          >
            {isAdvisable
              ? "OK to use"
              : "Not advisable"}
          </AppText>
        </View>
      </View>

      {/* Carousel Indicator */}
      <View style={styles.indicator}>
        {filteredAppliances.map((item, itemIndex) => (
          <View
            key={item.id}
            style={[
              styles.dot,
              {
                backgroundColor:
                  itemIndex === index % filteredAppliances.length
                    ? statusColor
                    : Colors.light.border,
              },
            ]}
          />
        ))}
      </View>

      {/* Status Toggle */}
      <View style={styles.toggle}>
        <Pressable
          onPress={() => setMode("advisable")}
          style={({ pressed }) => [
            styles.toggleButton,
            mode === "advisable" && {
              backgroundColor: Colors.light.primary,
            },
            pressed && styles.pressed,
          ]}
        >
          <AppText
            variant="caption"
            style={[
              styles.toggleText,
              mode === "advisable" && styles.activeToggleText,
            ]}
          >
            Advisable
          </AppText>
        </Pressable>

        <Pressable
          onPress={() => setMode("notAdvisable")}
          style={({ pressed }) => [
            styles.toggleButton,
            mode === "notAdvisable" && {
              backgroundColor: "#EF4444",
            },
            pressed && styles.pressed,
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
        onPress={onViewAll}
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    alignItems: "center",
  },

  applianceBox: {
    width: "72%",
    maxWidth: 280,
    backgroundColor: "#e6e3e3",
    borderWidth: 2,
    borderRadius: Radius.md,
    padding: 12,
    alignItems: "center",
  },

  imageContainer: {
    width: "100%",
    aspectRatio: 1,
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
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
    textAlign: "center",
    marginTop: 10,
  },

  watts: {
    color: Colors.light.textSecondary,
    fontSize: 13,
    marginTop: 3,
  },

  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: Radius.md,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginTop: 8,
  },

  statusText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  indicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginVertical: 10,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  toggle: {
    width: "100%",
    maxWidth: 360,
    flexDirection: "row",
    backgroundColor: Colors.glass.white,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    padding: 3,
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

  viewAll: {
    width: "100%",
    maxWidth: 360,
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.md,
    marginTop: 8,
  },

  viewAllText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  tip: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255, 165, 0, 0.08)",
    borderWidth: 1,
    borderColor: Colors.light.secondary,
    borderRadius: Radius.md,
    padding: 10,
    marginTop: Spacing.md,
  },

  tipContent: {
    flex: 1,
    marginLeft: 8,
  },

  tipTitle: {
    color: "#000000",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 2,
  },

  tipText: {
    color: Colors.light.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },

  pressed: {
    opacity: 0.7,
  },
});