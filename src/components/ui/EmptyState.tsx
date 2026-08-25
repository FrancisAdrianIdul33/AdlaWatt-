import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";


interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export default function EmptyState({
  title = "No Activity Logs",
  description = "No activities match the selected filters.",
  icon = "document-text-outline",
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons
        name={icon}
        size={42}
        color={Colors.light.textSecondary}
      />

      <AppText
        variant="body"
        style={styles.title}
      >
        {title}
      </AppText>

      <AppText
        variant="caption"
        style={styles.description}
      >
        {description}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.glass.white,
    borderWidth: 3,
    borderColor: Colors.light.border,
    borderRadius: 16,
    paddingVertical: 35,
    paddingHorizontal: 20,
  },

  title: {
    color: "#000000",
    fontWeight: "700",
    marginTop: 10,
  },

  description: {
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginTop: 5,
  },
});