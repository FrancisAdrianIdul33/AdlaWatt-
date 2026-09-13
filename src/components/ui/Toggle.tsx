import React from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import AppText from "@/components/ui/AppText";

import { Colors } from "@/constants/colors";

// ============================================================
// TYPES
// ============================================================

export type ToggleOption =
  | "All"
  | "Advisable"
  | "notAdvisable";

interface ToggleProps {
  value: ToggleOption;
  onChange: (option: ToggleOption) => void;
}

// ============================================================
// TOGGLE COMPONENT
// ============================================================

export default function Toggle({
  value,
  onChange,
}: ToggleProps) {
  return (
    <View style={styles.statusToggle}>
      {(
        [
          "All",
          "Advisable",
          "notAdvisable",
        ] as ToggleOption[]
      ).map((option) => (
        <Pressable
          key={option}
          onPress={() =>
            onChange(option)
          }
          style={({ pressed }) => [
            styles.statusButton,
            value === option && {
              backgroundColor:
                option === "Advisable"
                  ? Colors.light.primary
                  : option === "notAdvisable"
                    ? "#EF4444"
                    : Colors.light.primary,
            },
            pressed && styles.pressed,
          ]}
        >
          <AppText
            variant="caption"
            style={[
              styles.statusText,
              value === option &&
                styles.activeStatusText,
            ]}
          >
            {option === "notAdvisable"
              ? "Not Advisable"
              : option}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  statusToggle: {
    width: "100%",
    flexDirection: "row",
    backgroundColor: Colors.glass.white,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderRadius: 14,
    padding: 3,
    marginTop: 10,
  },

  statusButton: {
    flex: 1,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
  },

  statusText: {
    color: Colors.light.text,
    fontSize: 13,
    fontWeight: "700",
  },

  activeStatusText: {
    color: "#FFFFFF",
  },

  pressed: {
    opacity: 0.7,
  },
});