import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import AppText from "../ui/AppText";
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
        error={error}
      />

      <Pressable
        style={styles.toggle}
        onPress={() => setShowPassword(!showPassword)}
      >
        <AppText variant="caption">
          {showPassword ? "Hide" : "Show"}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },

  toggle: {
    position: "absolute",
    right: 16,
    top: 42,
    padding: 4,
  },
});