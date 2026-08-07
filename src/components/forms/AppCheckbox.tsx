import React from "react";
import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { Colors } from "@/constants/colors";
import AppText from "../ui/AppText";

interface AppCheckboxProps {
  label: string;
  checked: boolean;
  onPress: () => void;
}

export default function AppCheckbox({
  label,
  checked,
  onPress,
}: AppCheckboxProps) {
  return (
    <Pressable
      style={styles.container}
      onPress={onPress}
    >
      <View
        style={[
          styles.checkbox,
          checked && styles.checked,
        ]}
      >
        {checked && (
          <AppText
            style={styles.checkmark}
          >
            ✓
          </AppText>
        )}
      </View>

      <AppText>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },

  checkbox: {
    width: 22,
    height: 22,

    borderWidth: 1.5,
    borderColor: Colors.light.primary,

    borderRadius: 6,

    justifyContent: "center",
    alignItems: "center",

    marginRight: 10,

    backgroundColor: Colors.light.surface,
  },

  checked: {
    backgroundColor: Colors.light.primary,
  },

  checkmark: {
    color: Colors.light.onPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
});