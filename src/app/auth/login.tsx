import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

import AppCheckbox from "@/components/forms/AppCheckbox";
import AppInput from "@/components/forms/AppInput";
import PasswordInput from "@/components/forms/PasswordInput";
import AuthHeader from "@/components/layout/AuthHeader";
import ScreenContainer from "@/components/layout/ScreenContainer";
import AppButton from "@/components/ui/AppButton";
import AppLogo from "@/components/ui/AppLogo";
import AppText from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";
import { Routes } from "@/constants/routes";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    // Temporary navigation until authentication is connected.
    router.replace(Routes.DASHBOARD);
  };

  const handleRegister = () => {
    router.push(Routes.REGISTER);
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <AppLogo
          width={300}
          height={180}
        />

        <AuthHeader
          title="Welcome Back"
          subtitle="Sign in to continue using AdlaWatt."
        />

        <View style={styles.form}>
          <AppInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <PasswordInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
          />

          <View style={styles.options}>
            <AppCheckbox
              label="Remember Me"
              checked={rememberMe}
              onPress={() => setRememberMe((previous) => !previous)}
            />
          </View>

          <AppButton
            title="Login"
            onPress={handleLogin}
          />
        </View>

        <View style={styles.registerContainer}>
          <AppText variant="caption">
            Don't have an account?
          </AppText>

          <AppText
            variant="body"
            style={styles.registerLink}
            onPress={handleRegister}
          >
            Create Account
          </AppText>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-start",
  },

  form: {
    width: "100%",
  },

  options: {
    marginBottom: 12,
  },

  registerContainer: {
    alignItems: "center",
    marginTop: 28,
  },

  registerLink: {
    color: Colors.light.primary,
    fontWeight: "600",
    marginTop: 6,
  },
});