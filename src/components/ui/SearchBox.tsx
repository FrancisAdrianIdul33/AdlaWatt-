import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    StyleSheet,
    TextInput,
    TextInputProps,
    View,
} from "react-native";

interface AppSearchBoxProps extends TextInputProps {}

export default function AppSearchBox({
  style,
  ...props
}: AppSearchBoxProps) {
  return (
    <View style={styles.container}>
      <TextInput
        {...props}
        placeholderTextColor={Colors.light.textSecondary}
        style={[styles.input, style]}
      />

      <Ionicons
        name="search-outline"
        size={20}
        color={Colors.light.primary}
        style={styles.icon}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    marginBottom: 18,
  },

  input: {
    backgroundColor: Colors.light.surface,
    color: Colors.light.textSecondary,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    paddingLeft: 16,
    paddingRight: 48, // Space reserved for the icon
    paddingVertical: 14,
    fontSize: 16,
  },

  icon: {
    position: "absolute",
    right: 16,
    top: 14,
  },
});