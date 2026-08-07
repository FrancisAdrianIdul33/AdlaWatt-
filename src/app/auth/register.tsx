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

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleRegister = () => {
    // Temporary navigation until authentication is connected.
    router.replace(Routes.LOGIN);
  };

  const handleLogin = () => {
    router.replace(Routes.LOGIN);
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <AppLogo
          width={300}
          height={180}
        />

        <AuthHeader
          title="Create Account"
          subtitle="Create your AdlaWatt account to start monitoring your energy."
        />

        <View style={styles.form}>
          <AppInput
            label="Username"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your username"
            autoCapitalize="words"
            autoCorrect={false}
          />

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
            placeholder="Create a password"
          />

          <PasswordInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your password"
          />

          <AppCheckbox
            label="I agree to the Terms and Conditions"
            checked={acceptedTerms}
            onPress={() => setAcceptedTerms((previous) => !previous)}
          />

          <AppButton
            title="Create Account"
            onPress={handleRegister}
            disabled={!acceptedTerms}
          />
        </View>

        <View style={styles.loginContainer}>
          <AppText
            variant="caption"
            style={styles.loginText}
          >
            Already have an account?
          </AppText>

          <AppText
            variant="body"
            style={styles.loginLink}
            onPress={handleLogin}
          >
            Sign In
          </AppText>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
  },

  form: {
    width: "100%",
  },

  loginContainer: {
    alignItems: "center",
    marginTop: 28,
  },

  loginText: {
    textAlign: "center",
  },

  loginLink: {
    color: Colors.light.primary,
    fontWeight: "600",
    marginTop: 6,
  },
});