import React from "react";
import { StyleSheet, View } from "react-native";

import AppText from "../ui/AppText";

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export default function AuthHeader({
  title,
  subtitle,
}: AuthHeaderProps) {
  return (
    <View style={styles.container}>
      <AppText
        variant="title"
        style={styles.title}
      >
        {title}
      </AppText>

      <AppText
        variant="caption"
        style={styles.subtitle}
      >
        {subtitle}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 36,
  },

  title: {
    marginBottom: 8,
    textAlign: "center",
  },

  subtitle: {
    textAlign: "center",
    maxWidth: 320,
    lineHeight: 22,
  },
});