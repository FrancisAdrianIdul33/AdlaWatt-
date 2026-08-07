import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import AppInput from "./AppInput";

interface PasswordInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
}

export default function PasswordInput({
  label = "Password",
  value,
  onChangeText,
  placeholder = "Enter your password",
  error,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <AppInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoCorrect={false}
        error={error}
        style={styles.input}
      />

      <Pressable
        style={styles.toggle}
        onPress={() => setShowPassword((previous) => !previous)}
        accessibilityRole="button"
        accessibilityLabel={
          showPassword ? "Hide password" : "Show password"
        }
      >
        <Ionicons
          name={showPassword ? "eye-off-outline" : "eye-outline"}
          size={22}
          color="#1c1c1c"
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },

  input: {
    paddingRight: 52,
  },

  toggle: {
    position: "absolute",
    right: 16,
    top: 42,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});