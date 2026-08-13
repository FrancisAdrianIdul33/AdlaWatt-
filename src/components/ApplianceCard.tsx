import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import AppText from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";

type PowerLevel = "All" | "Highest" | "Moderate" | "Low";

type Area =
  | "All Areas"
  | "Living Area"
  | "Dining Area"
  | "Bedroom"
  | "Office"
  | "Kitchen"
  | "Other";

type Appliance = {
  name: string;
  watts: string;
  power: number;
  powerLevel: Exclude<PowerLevel, "All">;
  area: Exclude<Area, "All Areas">;
  icon: keyof typeof Ionicons.glyphMap;
};

type ApplianceCardProps = {
  batteryLevel?: number;
  powerFilter?: PowerLevel;
  areaFilter?: Area;
};

const appliances: Appliance[] = [
  {
    name: "Emergency Light",
    watts: "5–10W",
    power: 10,
    powerLevel: "Low",
    area: "Bedroom",
    icon: "flashlight-outline",
  },
  {
    name: "LED Bulb",
    watts: "9W",
    power: 9,
    powerLevel: "Low",
    area: "Living Area",
    icon: "bulb-outline",
  },
  {
    name: "Router",
    watts: "10–20W",
    power: 20,
    powerLevel: "Low",
    area: "Office",
    icon: "wifi-outline",
  },
  {
    name: "Phone Charger",
    watts: "20W",
    power: 20,
    powerLevel: "Low",
    area: "Bedroom",
    icon: "phone-portrait-outline",
  },
  {
    name: "TV",
    watts: "30–50W",
    power: 50,
    powerLevel: "Moderate",
    area: "Living Area",
    icon: "tv-outline",
  },
  {
    name: "Fan",
    watts: "50–75W",
    power: 75,
    powerLevel: "Highest",
    area: "Living Area",
    icon: "speedometer-outline",
  },
  {
    name: "Laptop",
    watts: "65W",
    power: 65,
    powerLevel: "Highest",
    area: "Office",
    icon: "laptop-outline",
  },
];

export default function ApplianceCard({
  batteryLevel = 50,
  powerFilter = "All",
  areaFilter = "All Areas",
}: ApplianceCardProps) {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const [autoMove, setAutoMove] = useState(true);
  const [offset, setOffset] = useState(0);
  const direction = useRef(1);

  const filteredAppliances = appliances.filter((appliance) => {
    const matchesPower =
      powerFilter === "All" ||
      appliance.powerLevel === powerFilter;

    const matchesArea =
      areaFilter === "All Areas" ||
      appliance.area === areaFilter;

    return matchesPower && matchesArea;
  });

  const getStatus = (power: number) =>
    batteryLevel >= 80 ||
    (batteryLevel >= 40 && power <= 30) ||
    (batteryLevel < 40 && power <= 10);

  useEffect(() => {
    if (!autoMove) return;

    const timer = setInterval(() => {
      setOffset((current) => {
        const next =
          current + direction.current * 2;

        if (next >= 120) direction.current = -1;
        if (next <= 0) direction.current = 1;

        const position = Math.max(
          0,
          Math.min(120, next),
        );

        scrollRef.current?.scrollTo({
          x: position,
          animated: true,
        });

        return position;
      });
    }, 80);

    return () => clearInterval(timer);
  }, [autoMove]);

  const note =
    batteryLevel >= 80
      ? "Your battery has plenty of energy. You can safely use your supported appliances."
      : batteryLevel >= 40
        ? "Your battery is at a moderate level. Consider using low-power appliances first."
        : "Your battery is getting low. Save energy for essential appliances.";

  return (
    <View style={styles.container}>
      <AppText
        variant="body"
        style={styles.title}
      >
        Recommended Appliances
      </AppText>

      <AppText
        variant="caption"
        style={styles.subtitle}
      >
        Based on your current battery level
      </AppText>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        scrollEventThrottle={16}
      >
        {filteredAppliances.length > 0 ? (
          filteredAppliances.map((appliance) => {
            const okay = getStatus(appliance.power);

            return (
              <View
                key={appliance.name}
                style={styles.item}
              >
                <Ionicons
                  name={appliance.icon}
                  size={23}
                  color={
                    okay
                      ? Colors.light.primary
                      : Colors.light.error
                  }
                />

                <AppText
                  variant="caption"
                  style={styles.name}
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
                    okay
                      ? styles.okStatus
                      : styles.notOkStatus,
                  ]}
                >
                  <Ionicons
                    name={
                      okay
                        ? "checkmark-outline"
                        : "close-outline"
                    }
                    size={11}
                    color="#FFFFFF"
                  />

                  <AppText
                    variant="caption"
                    style={styles.statusText}
                  >
                    {okay
                      ? "OK to use"
                      : "Not advised"}
                  </AppText>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.empty}>
            <Ionicons
              name="search-outline"
              size={25}
              color={Colors.light.textSecondary}
            />

            <AppText
              variant="caption"
              style={styles.emptyText}
            >
              No appliances match the selected filters.
            </AppText>
          </View>
        )}
      </ScrollView>

      <View style={styles.controls}>
        <Pressable
          onPress={() =>
            setAutoMove((value) => !value)
          }
          style={({ pressed }) => [
            styles.controlButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name={
              autoMove
                ? "pause-outline"
                : "play-outline"
            }
            size={16}
            color="#FFFFFF"
          />

          <AppText
            variant="caption"
            style={styles.controlText}
          >
            {autoMove ? "Pause" : "Auto"}
          </AppText>
        </Pressable>

        <Pressable
          onPress={() =>
            router.push("/dashboard/appliances")
          }
          style={({ pressed }) => [
            styles.controlButton,
            pressed && styles.pressed,
          ]}
        >
          <AppText
            variant="caption"
            style={styles.controlText}
          >
            View Full
          </AppText>

          <Ionicons
            name="chevron-forward-outline"
            size={16}
            color="#FFFFFF"
          />
        </Pressable>
      </View>

      <View style={styles.note}>
        <Ionicons
          name="bulb-outline"
          size={18}
          color={Colors.light.secondary}
        />

        <AppText
          variant="caption"
          style={styles.noteText}
        >
          {note}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: Colors.glass.white,
    borderWidth: 3,
    borderColor: Colors.light.primary,
    borderRadius: 16,
    padding: 18,
  },

  title: {
    color: "#000000",
    fontWeight: "700",
  },

  subtitle: {
    color: Colors.light.textSecondary,
    marginTop: 4,
    marginBottom: 14,
  },

  list: {
    gap: 10,
    paddingRight: 10,
  },

  item: {
    width: 120,
    minHeight: 125,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.glass.white,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderRadius: 14,
    padding: 10,
  },

  name: {
    color: "#000000",
    fontWeight: "700",
    textAlign: "center",
    marginTop: 5,
  },

  watts: {
    color: Colors.light.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },

  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    borderRadius: 9,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginTop: 6,
  },

  okStatus: {
    backgroundColor: Colors.light.primary,
  },

  notOkStatus: {
    backgroundColor: Colors.light.error,
  },

  statusText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "600",
  },

  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
  },

  controlButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.light.primary,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },

  controlText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },

  pressed: {
    opacity: 0.7,
  },

  note: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },

  noteText: {
    flex: 1,
    color: Colors.light.textSecondary,
    fontSize: 11,
    lineHeight: 17,
  },

  empty: {
    width: "100%",
    minHeight: 80,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  emptyText: {
    color: Colors.light.textSecondary,
    textAlign: "center",
    fontSize: 11,
  },
});