import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Pressable,
  StyleSheet,
  ViewStyle,
} from "react-native";

import AppText from "@/components/ui/AppText";

import { Colors } from "@/constants/colors";
import { Radius } from "@/constants/theme";

type AppButton1Props = {
  title: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
};

export default function AppButton1({
  title,
  onPress,
  icon = "arrow-forward",
  style,
}: AppButton1Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        style,
      ]}
    >
      <AppText
        variant="caption"
        style={styles.text}
      >
        {title}
      </AppText>

      <Ionicons
        name={icon}
        size={16}
        color="#FFFFFF"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    maxWidth: 360,
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.md,
    marginTop: 12,
    marginBottom: 15,
  },

  text: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  pressed: {
    opacity: 0.7,
  },
});