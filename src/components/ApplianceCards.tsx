import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";

type Appliance = {
  id: string;
  name: string;
  watts: string;
  power: number;
  icon: keyof typeof Ionicons.glyphMap;
  area: string;
};

type ApplianceCardsProps = {
  powerFilter?: "All" | "Highest" | "Moderate" | "Low";
  areaFilter?:
    | "All Areas"
    | "Living Area"
    | "Dining Area"
    | "Bedroom"
    | "Office"
    | "Kitchen"
    | "Other";
};

const appliances: Appliance[] = [
  {
    id: "1",
    name: "Emergency Light",
    watts: "5–10W",
    power: 10,
    icon: "flashlight-outline",
    area: "Living Area",
  },
  {
    id: "2",
    name: "LED Bulb",
    watts: "9W",
    power: 9,
    icon: "bulb-outline",
    area: "Living Area",
  },
  {
    id: "3",
    name: "Router",
    watts: "10–20W",
    power: 20,
    icon: "wifi-outline",
    area: "Office",
  },
  {
    id: "4",
    name: "Phone Charger",
    watts: "20W",
    power: 20,
    icon: "phone-portrait-outline",
    area: "Bedroom",
  },
  {
    id: "5",
    name: "TV",
    watts: "30–50W",
    power: 50,
    icon: "tv-outline",
    area: "Living Area",
  },
  {
    id: "6",
    name: "Fan",
    watts: "50–75W",
    power: 75,
    icon: "speedometer-outline",
    area: "Bedroom",
  },
  {
    id: "7",
    name: "Laptop",
    watts: "65W",
    power: 65,
    icon: "laptop-outline",
    area: "Office",
  },
  {
    id: "8",
    name: "Electric Bulb",
    watts: "15W",
    power: 15,
    icon: "bulb-outline",
    area: "Dining Area",
  },
];

const getAreaColor = (area: string) => {
  switch (area) {
    case "Living Area":
      return Colors.light.primary;
    case "Dining Area":
      return Colors.light.secondary;
    case "Office":
      return "#4A90E2";
    case "Bedroom":
      return "#9B59B6";
    default:
      return Colors.light.border;
  }
};

const getPowerLevel = (power: number) => {
  if (power >= 50) return "Highest";
  if (power >= 20) return "Moderate";
  return "Low";
};

export default function ApplianceCards({
  powerFilter,
  areaFilter,
}: ApplianceCardsProps) {
  const filteredAppliances = appliances.filter((appliance) => {
    const matchesPower =
      !powerFilter ||
      powerFilter === "All" ||
      getPowerLevel(appliance.power) === powerFilter;

    const matchesArea =
      !areaFilter ||
      areaFilter === "All Areas" ||
      appliance.area === areaFilter;

    return matchesPower && matchesArea;
  });

  return (
    <View style={styles.grid}>
      {filteredAppliances.map((appliance) => {
        const areaColor = getAreaColor(appliance.area);

        return (
          <View
            key={appliance.id}
            style={[
              styles.item,
              { borderColor: areaColor },
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                { borderColor: areaColor },
              ]}
            >
              <Ionicons
                name={appliance.icon}
                size={23}
                color={areaColor}
              />
            </View>

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

            <View style={styles.status}>
              <Ionicons
                name="checkmark-outline"
                size={11}
                color="#FFFFFF"
              />

              <AppText
                variant="caption"
                style={styles.statusText}
              >
                OK to use
              </AppText>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },

  item: {
    width: "48%",
    minHeight: 125,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.glass.white,
    borderWidth: 2,
    borderRadius: 14,
    padding: 10,
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderWidth: 2,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },

  name: {
    color: "#000000",
    fontWeight: "700",
    textAlign: "center",
    marginTop: 2,
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
    backgroundColor: Colors.light.primary,
    borderRadius: 9,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginTop: 6,
  },

  statusText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "600",
  },
});