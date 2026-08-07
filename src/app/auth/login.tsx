import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

import Copyright from "@/components/forms/Copyright";
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
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
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
        {/* AdlaWatt Logo */}
        <View style={styles.logoContainer}>
          <AppLogo
            width={300}
            height={200}
          />
        </View>

        <AuthHeader
          title="Welcome Back"
          subtitle="Sign in to continue using AdlaWatt."
        />

        <View style={styles.form}>
          <AppInput
            label="Username or Email"
            value={usernameOrEmail}
            onChangeText={setUsernameOrEmail}
            placeholder="Enter your username or email"
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
              onPress={() =>
                setRememberMe((previous) => !previous)
              }
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

        <Copyright />
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

  logoContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },

  form: {
    width: "100%",
  },

  options: {
    width: "100%",
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