import React from "react";
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

import { Colors } from "@/constants/colors";
import AppText from "../ui/AppText";

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export default function AppInput({
  label,
  error,
  style,
  ...props
}: AppInputProps) {
  return (
    <View style={styles.container}>
      {label && (
        <AppText variant="body" style={styles.label}>
          {label}
        </AppText>
      )}

      <TextInput
        {...props}
        placeholderTextColor={Colors.light.textSecondary}
        style={[
          styles.input,
          error ? styles.inputError : null,
          style,
        ]}
      />

      {error && (
        <AppText variant="caption" style={styles.error}>
          {error}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },

  label: {
    marginBottom: 8,
    fontWeight: "600",
  },

input: {
  backgroundColor: Colors.light.surface,
  color: Colors.light.textSecondary,

  borderWidth: 1,
  borderColor: Colors.light.border,

  borderRadius: 12,

  paddingHorizontal: 16,
  paddingVertical: 14,

  fontSize: 16,
},

  inputError: {
    borderColor: Colors.light.error,
  },

  error: {
    marginTop: 6,
    color: Colors.light.error,
  },
});