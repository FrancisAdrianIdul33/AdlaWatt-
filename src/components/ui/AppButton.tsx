import React from "react";
import {
  Pressable,
  StyleSheet,
  ViewStyle,
} from "react-native";

import { Colors } from "@/constants/colors";
import AppText from "./AppText";

interface AppButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function AppButton({
  title,
  onPress,
  disabled = false,
  style,
}: AppButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <AppText variant="button">
        {title}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.light.primary,
    marginTop: 15,
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  disabled: {
    opacity: 0.5,
  },

  pressed: {
    opacity: 0.85,
  },
});