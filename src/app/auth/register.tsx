import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import AppCheckbox from "@/components/forms/AppCheckbox";
import AppInput from "@/components/forms/AppInput";
import PasswordInput from "@/components/forms/PasswordInput";
import TermsModal from "@/components/forms/TermsModal";
import AuthHeader from "@/components/layout/AuthHeader";
import ScreenContainer from "@/components/layout/ScreenContainer";
import AppButton from "@/components/ui/AppButton";
import AppLogo from "@/components/ui/AppLogo";
import AppText from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";
import { Routes } from "@/constants/routes";
import { Radius, Spacing } from "@/constants/theme";

import Copyright from "@/components/forms/Copyright";

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);

  const handleRegister = () => {
    if (!termsAgreed) {
      return;
    }

    // Temporary navigation until authentication is connected.
    router.replace(Routes.LOGIN);
  };

  const handleLogin = () => {
    router.replace(Routes.LOGIN);
  };

  const handleTermsAgree = () => {
    setTermsAgreed(true);
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
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
            autoCapitalize="none"
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

          <View style={styles.termsRow}>
            <AppCheckbox
              label="I agree to the Terms and Conditions"
              checked={termsAgreed}
              onPress={() => {
                if (termsAgreed) {
                  setTermsAgreed(false);
                } else {
                  setTermsModalVisible(true);
                }
              }}
            />

            <Pressable
              onPress={() => setTermsModalVisible(true)}
              style={styles.termsIconButton}
              accessibilityRole="button"
              accessibilityLabel="Open Terms and Conditions"
            >
              <Ionicons
                name="document-text-outline"
                size={22}
                color={Colors.light.primary}
              />
            </Pressable>
          </View>

          <AppButton
            title="Create Account"
            onPress={handleRegister}
            disabled={!termsAgreed}
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

        <Copyright />
      </View>

      <TermsModal
        visible={termsModalVisible}
        onClose={() => setTermsModalVisible(false)}
        onAgree={handleTermsAgree}
      />
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

  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },

  termsIconButton: {
    width: 42,
    height: 42,
    borderRadius: Radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },

  loginContainer: {
    alignItems: "center",
    marginTop: Spacing.lg,
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