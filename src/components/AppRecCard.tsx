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
import { Routes } from "@/constants/routes";
import { Radius } from "@/constants/theme";
import { router } from "expo-router";

import { supabase } from "@/lib/supabase";

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
  const [appliances, setAppliances] = useState<Appliance[]>([]);

  const filteredAppliances = useMemo(
    () => appliances.filter((item) => item.status === mode),
    [appliances, mode],
  );

 const currentAppliances =
  filteredAppliances.length > 0
    ? Array.from(
        {
          length: Math.min(2, filteredAppliances.length),
        },
        (_, offset) =>
          filteredAppliances[
            (index + offset) % filteredAppliances.length
          ],
      )
    : [];

  const isAdvisable = mode === "advisable";
  const statusColor = isAdvisable
    ? Colors.light.primary
    : "#EF4444";

  // Appliance changes every 5 seconds
  useEffect(() => {
    loadAppliances();
  }, []);

  useEffect(() => {
    setIndex(0);

    const timer = setInterval(() => {
      setIndex((currentIndex) => currentIndex + 1);
    }, 5000);

    return () => clearInterval(timer);
  }, [mode, filteredAppliances.length]);

  // Tip changes every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((currentIndex) => (currentIndex + 1) % tips.length);
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  const loadAppliances = async () => {
    const { data, error } = await supabase
      .from("appliances")
      .select("app_id, appliance_name, wattage, selection")
      .eq("selection", true)
      .eq("status", true)
      .order("appliance_name");

    if (error) {
      console.error("Failed to load selected appliances:", error.message);
      setAppliances([]);
      return;
    }

    const mapped: Appliance[] = (data ?? []).map((item) => {
      const values = item.wattage.match(/\d+/g)?.map(Number) ?? [];
      const maxWatts = Math.max(...values, 0);

      return {
        id: item.app_id,
        name: item.appliance_name,
        watts: item.wattage,
        status: maxWatts > 300 ? "notAdvisable" : "advisable",
      };
    });

    setAppliances(mapped);
  };

  if (!currentAppliances.length) return null;

  return (
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

      {/* Appliance Carousel */}
      <View style={styles.applianceRow}>
        {currentAppliances.map((appliance) => (
          <View
            key={appliance.id}
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
              {appliance.name}
            </AppText>

            <AppText
              variant="caption"
              style={styles.watts}
            >
              {appliance.watts}
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
                {isAdvisable ? "OK to use" : "Not advisable"}
              </AppText>
            </View>
          </View>
        ))}
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
        onPress={() => router.push(Routes.APPLIANCES)}
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
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    alignItems: "center",
  },

  applianceRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },

  applianceBox: {
    width: "45%",
    maxWidth: 150,
    backgroundColor: "#FFFFFF",
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
    height: 72,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 165, 0, 0.08)",
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

  pressed: {
    opacity: 0.7,
  },
});