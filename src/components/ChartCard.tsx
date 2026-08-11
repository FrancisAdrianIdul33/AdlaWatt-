import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import AppText from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";

type ChartCardProps =
  | {
      type: "battery";
      value?: number;
      status?: string;
      timeRemaining?: string;
    }
  | {
      type: "solar";
      value?: string;
      status?: "Normal" | "Moderate" | "Alarming";
    }
  | {
      type: "load";
      value?: string;
    }
  | {
      type: "device";
      status?: "Online" | "Offline";
    }
  | {
      type: "temperature";
      value?: number;
      status?: "Normal" | "Moderate" | "Alarming";
    };

const CARD = {
  radius: 16,
  border: 3,
  padding: 18,
};

const statusStyle = (
  status: "Normal" | "Moderate" | "Alarming",
) => {
  if (status === "Normal") {
    return {
      backgroundColor: Colors.light.primary,
      color: "#FFFFFF",
    };
  }

  if (status === "Moderate") {
    return {
      backgroundColor: Colors.light.secondary,
      color: "#000000",
    };
  }

  return {
    backgroundColor: Colors.light.error,
    color: "#FFFFFF",
  };
};

export default function ChartCard(props: ChartCardProps) {
  const renderContent = () => {
    switch (props.type) {
      case "battery": {
        const level = props.value ?? 50;
        const radius = 55;
        const strokeWidth = 12;
        const circumference = 2 * Math.PI * radius;
        const progress = Math.min(Math.max(level, 0), 100);
        const offset =
          circumference -
          (progress / 100) * circumference;

        return (
          <>
            <View style={styles.ring}>
              <Svg width={140} height={140}>
                <Circle
                  cx="70"
                  cy="70"
                  r={radius}
                  stroke={Colors.light.border}
                  strokeWidth={strokeWidth}
                  fill="none"
                />

                <Circle
                  cx="70"
                  cy="70"
                  r={radius}
                  stroke={Colors.light.primary}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={offset}
                  transform="rotate(-90 70 70)"
                />
              </Svg>

              <View style={styles.ringText}>
                <AppText style={styles.batteryValue}>
                  {progress}%
                </AppText>
              </View>
            </View>

            <AppText style={styles.cardLabel}>
              Battery
            </AppText>

            <View style={styles.statusRow}>
              <Ionicons
                name="flash-outline"
                size={15}
                color={Colors.light.primary}
              />

              <AppText style={styles.statusText}>
                {props.status ?? "Discharging"}
              </AppText>
            </View>

            <AppText style={styles.secondaryText}>
              Time Remaining:{" "}
              {props.timeRemaining ?? "4h 12m"}
            </AppText>
          </>
        );
      }

      case "solar": {
        const status = props.status ?? "Moderate";
        const badge = statusStyle(status);

        return (
          <>
            <Ionicons
              name="sunny-outline"
              size={24}
              color={Colors.light.primary}
            />

            <AppText style={styles.cardLabel}>
              Solar Input
            </AppText>

            <AppText style={styles.mainValue}>
              {props.value ?? "46W"}
            </AppText>

            <View
              style={[
                styles.badge,
                { backgroundColor: badge.backgroundColor },
              ]}
            >
              <AppText
                style={[
                  styles.badgeText,
                  { color: badge.color },
                ]}
              >
                {status}
              </AppText>
            </View>
          </>
        );
      }

      case "load":
        return (
          <>
            <Ionicons
              name="flash-outline"
              size={24}
              color={Colors.light.primary}
            />

            <AppText style={styles.cardLabel}>
              Load Now
            </AppText>

            <AppText style={styles.mainValue}>
              {props.value ?? "170W"}
            </AppText>
          </>
        );

      case "device": {
        const online =
          (props.status ?? "Online") === "Online";

        return (
          <>
            <Ionicons
              name="hardware-chip-outline"
              size={24}
              color={
                online
                  ? Colors.light.primary
                  : Colors.light.error
              }
            />

            <AppText style={styles.cardLabel}>
              Device
            </AppText>

            <AppText
              style={[
                styles.mainValue,
                {
                  color: online
                    ? Colors.light.primary
                    : Colors.light.error,
                },
              ]}
            >
              {online ? "Online" : "Offline"}
            </AppText>
          </>
        );
      }

      case "temperature": {
        const status = props.status ?? "Normal";
        const badge = statusStyle(status);

        return (
          <>
            <Ionicons
              name="thermometer-outline"
              size={24}
              color={Colors.light.primary}
            />

            <AppText style={styles.cardLabel}>
              Battery Temp
            </AppText>

            <AppText style={styles.mainValue}>
              {props.value ?? 20.0}°C
            </AppText>

            <View
              style={[
                styles.badge,
                { backgroundColor: badge.backgroundColor },
              ]}
            >
              <AppText
                style={[
                  styles.badgeText,
                  { color: badge.color },
                ]}
              >
                {status}
              </AppText>
            </View>
          </>
        );
      }
    }
  };

  return (
    <View style={styles.card}>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 150,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.glass.white,
    borderWidth: CARD.border,
    borderColor: Colors.light.primary,
    borderRadius: CARD.radius,
    padding: CARD.padding,
  },

  ring: {
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
  },

  ringText: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },

  batteryValue: {
    color: "#000000",
    fontSize: 26,
    fontWeight: "700",
  },

  cardLabel: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 8,
  },

  mainValue: {
    color: "#000000",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 6,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 5,
  },

  statusText: {
    color: Colors.light.primary,
    fontSize: 13,
    fontWeight: "600",
  },

  secondaryText: {
    color: Colors.light.textSecondary,
    fontSize: 12,
    marginTop: 5,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 7,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
});