import React from "react";
import {
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

import AppText from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/theme";

interface CopyrightProps {
  style?: StyleProp<ViewStyle>;
}

export default function Copyright({ style }: CopyrightProps) {
  return (
    <View style={[styles.container, style]}>
      <AppText
        variant="caption"
        style={styles.text}
      >
        © 2026 AdlaWatt
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: "auto",
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
  },

  text: {
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
});