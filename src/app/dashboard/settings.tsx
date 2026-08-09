import React, { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from "react-native";

import Copyright from "@/components/forms/Copyright";
import NavBar from "@/components/layout/Navbar";
import ScreenContainer2 from "@/components/layout/ScreenContainer2";
import Sidebar from "@/components/layout/Sidebar";
import AppText from "@/components/ui/AppText";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";

export default function SettingsScreen() {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Dropdown states
  const [accountExpanded, setAccountExpanded] = useState(false);
  const [preferencesExpanded, setPreferencesExpanded] = useState(false);

  // Account states
  const [isEditingAccount, setIsEditingAccount] = useState(false);

  const [username, setUsername] = useState("Francis Adrian Idul");
  const [email, setEmail] = useState("francisadrian@example.com");

  const [editUsername, setEditUsername] = useState(username);
  const [editEmail, setEditEmail] = useState(email);

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [confirmationVisible, setConfirmationVisible] =
    useState(false);

  // Preferences
  const [darkMode, setDarkMode] = useState(false);
  const [colorBlindMode, setColorBlindMode] = useState(false);

  const [fontSize, setFontSize] = useState<
    "Small" | "Medium" | "Big"
  >("Medium");

  const [fontWeight, setFontWeight] = useState<
    "Thin" | "Regular" | "Bold"
  >("Regular");

  const [fontFamily, setFontFamily] =
    useState("System Default");

  const [language, setLanguage] = useState("English");

  const [vibration, setVibration] = useState(true);
  const [emailNotifications, setEmailNotifications] =
    useState(false);

  // Dropdown states
  const [fontFamilyOpen, setFontFamilyOpen] =
    useState(false);

  const [languageOpen, setLanguageOpen] =
    useState(false);

  const handleUpdatePress = () => {
    setEditUsername(username);
    setEditEmail(email);
    setNewPassword("");
    setConfirmNewPassword("");
    setCurrentPassword("");
    setIsEditingAccount(true);
  };

  const handleCancelUpdate = () => {
    setEditUsername(username);
    setEditEmail(email);
    setNewPassword("");
    setConfirmNewPassword("");
    setCurrentPassword("");
    setIsEditingAccount(false);
  };

  const handleSubmitAccountUpdate = () => {
    if (!editUsername.trim()) {
      Alert.alert("Invalid Username", "Username cannot be empty.");
      return;
    }

    if (!editEmail.trim()) {
      Alert.alert("Invalid Email", "Email cannot be empty.");
      return;
    }

    if (
      newPassword.length > 0 ||
      confirmNewPassword.length > 0
    ) {
      if (newPassword !== confirmNewPassword) {
        Alert.alert(
          "Password Mismatch",
          "New password and confirmation password do not match.",
        );
        return;
      }

      if (newPassword.length < 6) {
        Alert.alert(
          "Invalid Password",
          "New password must contain at least 6 characters.",
        );
        return;
      }
    }

    setConfirmationVisible(true);
  };

  const handleConfirmChanges = () => {
    if (!currentPassword.trim()) {
      Alert.alert(
        "Password Required",
        "Enter your current password to confirm these changes.",
      );
      return;
    }

    /*
     * Temporary static authentication.
     *
     * This will later be replaced with actual
     * database/server password verification.
     */
    const temporaryPassword = "password";

    if (currentPassword !== temporaryPassword) {
      Alert.alert(
        "Incorrect Password",
        "The current password you entered is incorrect.",
      );
      return;
    }

    setUsername(editUsername.trim());
    setEmail(editEmail.trim());

    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");

    setConfirmationVisible(false);
    setIsEditingAccount(false);

    Alert.alert(
      "Changes Saved",
      "Your account information has been updated successfully.",
    );
  };

  const renderToggle = (
    value: boolean,
    onValueChange: (value: boolean) => void,
  ) => (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{
        false: Colors.light.border,
        true: Colors.light.primary,
      }}
      thumbColor="#FFFFFF"
      ios_backgroundColor={Colors.light.border}
    />
  );

  return (
    <ScreenContainer2>
      <NavBar
        onMenuPress={() => setSidebarVisible(true)}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Settings Header */}
        <View style={styles.headerCard}>
          <AppText
            variant="heading"
            style={styles.headerTitle}
          >
            Settings
          </AppText>

          <AppText
            variant="caption"
            style={styles.headerSubtitle}
          >
            Manage your AdlaWatt account and application
            preferences.
          </AppText>
        </View>

        {/* ================= ACCOUNT PROFILE ================= */}
        <View style={styles.sectionContainer}>
         <Pressable
  onPress={() => {
    if (accountExpanded && isEditingAccount) {
      handleCancelUpdate();
    }

    setAccountExpanded(!accountExpanded);
  }}
            style={({ pressed }) => [
              styles.dropdownHeader,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.dropdownHeaderText}>
              <AppText
                variant="body"
                style={styles.dropdownTitle}
              >
                Account Profile
              </AppText>

              <AppText
                variant="caption"
                style={styles.dropdownSubtitle}
              >
                Manage your account information
              </AppText>
            </View>

            <Ionicons
  name={
    accountExpanded
      ? "chevron-up-outline"
      : "chevron-down-outline"
  }
  size={22}
  color="#000000"
/>
          </Pressable>

          {accountExpanded && (
            <View style={styles.expandedContent}>
              {!isEditingAccount ? (
                <>
                  {/* Username */}
                  <View style={styles.infoRow}>
                    <AppText
                      variant="caption"
                      style={styles.infoLabel}
                    >
                      Username
                    </AppText>

                    <AppText
                      variant="body"
                      style={styles.infoValue}
                    >
                      {username}
                    </AppText>
                  </View>

                  {/* Email */}
                  <View style={styles.infoRow}>
                    <AppText
                      variant="caption"
                      style={styles.infoLabel}
                    >
                      Email
                    </AppText>

                    <AppText
                      variant="body"
                      style={styles.infoValue}
                    >
                      {email}
                    </AppText>
                  </View>

                  {/* Password */}
                  <View style={styles.infoRow}>
                    <AppText
                      variant="caption"
                      style={styles.infoLabel}
                    >
                      Password
                    </AppText>

                    <AppText
                      variant="body"
                      style={styles.infoValue}
                    >
                      ••••••••••••
                    </AppText>
                  </View>

                  <Pressable
                    onPress={handleUpdatePress}
                    style={({ pressed }) => [
                      styles.primaryButton,
                      pressed && styles.pressed,
                    ]}
                  >
                    <AppText style={styles.primaryButtonText}>
                      Update
                    </AppText>
                  </Pressable>
                </>
              ) : (
                <>
                  {/* Username */}
                  <View style={styles.inputGroup}>
                    <AppText
                      variant="caption"
                      style={styles.inputLabel}
                    >
                      Username
                    </AppText>

                    <TextInput
                      value={editUsername}
                      onChangeText={setEditUsername}
                      style={styles.input}
                      placeholder="Enter username"
                      placeholderTextColor={
                        Colors.light.textSecondary
                      }
                    />
                  </View>

                  {/* Email */}
                  <View style={styles.inputGroup}>
                    <AppText
                      variant="caption"
                      style={styles.inputLabel}
                    >
                      Email
                    </AppText>

                    <TextInput
                      value={editEmail}
                      onChangeText={setEditEmail}
                      style={styles.input}
                      placeholder="Enter email"
                      placeholderTextColor={
                        Colors.light.textSecondary
                      }
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  {/* New Password */}
                  <View style={styles.inputGroup}>
                    <AppText
                      variant="caption"
                      style={styles.inputLabel}
                    >
                      New Password
                    </AppText>

                    <View style={styles.passwordInputContainer}>
                      <TextInput
                        value={newPassword}
                        onChangeText={setNewPassword}
                        style={styles.passwordInput}
                        placeholder="Leave blank to keep current"
                        placeholderTextColor={
                          Colors.light.textSecondary
                        }
                        secureTextEntry={!showNewPassword}
                      />

                      <Pressable
                        onPress={() =>
                          setShowNewPassword(
                            !showNewPassword,
                          )
                        }
                        style={styles.eyeButton}
                      >
                        <AppText style={styles.eyeText}>
                          {showNewPassword ? "◉" : "○"}
                        </AppText>
                      </Pressable>
                    </View>
                  </View>

                  {/* Confirm New Password */}
                  <View style={styles.inputGroup}>
                    <AppText
                      variant="caption"
                      style={styles.inputLabel}
                    >
                      Confirm New Password
                    </AppText>

                    <View style={styles.passwordInputContainer}>
                      <TextInput
                        value={confirmNewPassword}
                        onChangeText={
                          setConfirmNewPassword
                        }
                        style={styles.passwordInput}
                        placeholder="Confirm new password"
                        placeholderTextColor={
                          Colors.light.textSecondary
                        }
                        secureTextEntry={
                          !showConfirmPassword
                        }
                      />

                      <Pressable
                        onPress={() =>
                          setShowConfirmPassword(
                            !showConfirmPassword,
                          )
                        }
                        style={styles.eyeButton}
                      >
                        <AppText style={styles.eyeText}>
                          {showConfirmPassword ? "◉" : "○"}
                        </AppText>
                      </Pressable>
                    </View>
                  </View>

                  {/* Edit Actions */}
                  <View style={styles.actionRow}>
                    <Pressable
                      onPress={handleCancelUpdate}
                      style={({ pressed }) => [
                        styles.secondaryButton,
                        pressed && styles.pressed,
                      ]}
                    >
                      <AppText
                        style={styles.secondaryButtonText}
                      >
                        Cancel
                      </AppText>
                    </Pressable>

                    <Pressable
                      onPress={handleSubmitAccountUpdate}
                      style={({ pressed }) => [
                        styles.primaryButton,
                        styles.actionButton,
                        pressed && styles.pressed,
                      ]}
                    >
                      <AppText
                        style={styles.primaryButtonText}
                      >
                        Submit
                      </AppText>
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          )}
        </View>

        {/* ================= PREFERENCES ================= */}
        <View style={styles.sectionContainer}>
          <Pressable
            onPress={() =>
              setPreferencesExpanded(
                !preferencesExpanded,
              )
            }
            style={({ pressed }) => [
              styles.dropdownHeader,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.dropdownHeaderText}>
              <AppText
                variant="body"
                style={styles.dropdownTitle}
              >
                Preferences
              </AppText>

              <AppText
                variant="caption"
                style={styles.dropdownSubtitle}
              >
                Customize your AdlaWatt experience
              </AppText>
            </View>

            <Ionicons
  name={
    accountExpanded
      ? "chevron-up-outline"
      : "chevron-down-outline"
  }
  size={22}
  color="#000000"
/>
          </Pressable>

          {preferencesExpanded && (
            <View style={styles.expandedContent}>
              {/* APPEARANCE */}
              <AppText
                variant="caption"
                style={styles.sectionLabel}
              >
                APPEARANCE
              </AppText>

              <View style={styles.preferenceCard}>
                <View style={styles.preferenceText}>
                  <AppText
                    variant="body"
                    style={styles.preferenceTitle}
                  >
                    Dark Mode
                  </AppText>

                  <AppText
                    variant="caption"
                    style={styles.preferenceDescription}
                  >
                    Switch between light and dark
                    appearance.
                  </AppText>
                </View>

                {renderToggle(
                  darkMode,
                  setDarkMode,
                )}
              </View>

              <View style={styles.preferenceCard}>
                <View style={styles.preferenceText}>
                  <AppText
                    variant="body"
                    style={styles.preferenceTitle}
                  >
                    Color Blind Mode
                  </AppText>

                  <AppText
                    variant="caption"
                    style={styles.preferenceDescription}
                  >
                    Adjust colors for better
                    accessibility.
                  </AppText>
                </View>

                {renderToggle(
                  colorBlindMode,
                  setColorBlindMode,
                )}
              </View>

              {/* TYPOGRAPHY */}
              <AppText
                variant="caption"
                style={styles.sectionLabel}
              >
                TYPOGRAPHY
              </AppText>

              {/* Font Size */}
              <View style={styles.preferenceGroup}>
                <AppText
                  variant="caption"
                  style={styles.groupLabel}
                >
                  Font Size
                </AppText>

                <View style={styles.optionRow}>
                  {["Small", "Medium", "Big"].map(
                    (option) => (
                      <Pressable
                        key={option}
                        onPress={() =>
                          setFontSize(
                            option as
                              | "Small"
                              | "Medium"
                              | "Big",
                          )
                        }
                        style={[
                          styles.optionButton,
                          fontSize === option &&
                            styles.selectedOption,
                        ]}
                      >
                        <AppText
                          style={[
                            styles.optionText,
                            fontSize === option &&
                              styles.selectedOptionText,
                          ]}
                        >
                          {option}
                        </AppText>
                      </Pressable>
                    ),
                  )}
                </View>
              </View>

              {/* Font Weight */}
              <View style={styles.preferenceGroup}>
                <AppText
                  variant="caption"
                  style={styles.groupLabel}
                >
                  Font Weight
                </AppText>

                <View style={styles.optionRow}>
                  {["Thin", "Regular", "Bold"].map(
                    (option) => (
                      <Pressable
                        key={option}
                        onPress={() =>
                          setFontWeight(
                            option as
                              | "Thin"
                              | "Regular"
                              | "Bold",
                          )
                        }
                        style={[
                          styles.optionButton,
                          fontWeight === option &&
                            styles.selectedOption,
                        ]}
                      >
                        <AppText
                          style={[
                            styles.optionText,
                            fontWeight === option &&
                              styles.selectedOptionText,
                          ]}
                        >
                          {option}
                        </AppText>
                      </Pressable>
                    ),
                  )}
                </View>
              </View>

              {/* Font Family */}
              <View style={styles.preferenceGroup}>
                <AppText
                  variant="caption"
                  style={styles.groupLabel}
                >
                  Font Family
                </AppText>

                <Pressable
                  onPress={() =>
                    setFontFamilyOpen(
                      !fontFamilyOpen,
                    )
                  }
                  style={styles.dropdownInput}
                >
                  <AppText
                    style={styles.dropdownInputText}
                  >
                    {fontFamily}
                  </AppText>

                 <Ionicons
  name={
    preferencesExpanded
      ? "chevron-up-outline"
      : "chevron-down-outline"
  }
  size={22}
  color="#000000"
/>
                </Pressable>

                {fontFamilyOpen && (
                  <View style={styles.selectionMenu}>
                    {[
                      "Times New Roman",
                      "Roboto",
                      "Inter",
                      "System Default",
                      "Monospace",
                    ].map((font) => (
                      <Pressable
                        key={font}
                        onPress={() => {
                          setFontFamily(font);
                          setFontFamilyOpen(false);
                        }}
                        style={styles.selectionItem}
                      >
                        <AppText
                          style={[
                            styles.selectionText,
                            fontFamily === font &&
                              styles.selectedSelectionText,
                          ]}
                        >
                          {font}
                        </AppText>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>

              {/* LANGUAGE */}
              <AppText
                variant="caption"
                style={styles.sectionLabel}
              >
                LANGUAGE
              </AppText>

              <View style={styles.preferenceGroup}>
                <Pressable
                  onPress={() =>
                    setLanguageOpen(!languageOpen)
                  }
                  style={styles.dropdownInput}
                >
                  <AppText
                    style={styles.dropdownInputText}
                  >
                    {language}
                  </AppText>

             <Ionicons
  name={
    preferencesExpanded
      ? "chevron-up-outline"
      : "chevron-down-outline"
  }
  size={22}
  color="#000000"
/>
                </Pressable>

                {languageOpen && (
                  <View style={styles.selectionMenu}>
                    {[
                      "English",
                      "Cebuano (Bisaya)",
                      "Tagalog",
                    ].map((item) => (
                      <Pressable
                        key={item}
                        onPress={() => {
                          setLanguage(item);
                          setLanguageOpen(false);
                        }}
                        style={styles.selectionItem}
                      >
                        <AppText
                          style={[
                            styles.selectionText,
                            language === item &&
                              styles.selectedSelectionText,
                          ]}
                        >
                          {item}
                        </AppText>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>

              {/* ALERTS & VIBRATION */}
              <AppText
                variant="caption"
                style={styles.sectionLabel}
              >
                ALERTS & VIBRATION
              </AppText>

              <View style={styles.preferenceCard}>
                <View style={styles.preferenceText}>
                  <AppText
                    variant="body"
                    style={styles.preferenceTitle}
                  >
                    Vibration
                  </AppText>

                  <AppText
                    variant="caption"
                    style={styles.preferenceDescription}
                  >
                    Vibrate when important alerts are
                    received.
                  </AppText>
                </View>

                {renderToggle(
                  vibration,
                  setVibration,
                )}
              </View>

              <View style={styles.preferenceCard}>
                <View style={styles.preferenceText}>
                  <AppText
                    variant="body"
                    style={styles.preferenceTitle}
                  >
                    Email Notifications
                  </AppText>

                  <AppText
                    variant="caption"
                    style={styles.preferenceDescription}
                  >
                    Allow AdlaWatt to send alerts and
                    notifications through your email.
                  </AppText>
                </View>

                {renderToggle(
                  emailNotifications,
                  setEmailNotifications,
                )}
              </View>
            </View>
          )}
        </View>

        {/* ================= APP VERSION ================= */}
        <View style={styles.versionSection}>
          <AppText
            variant="caption"
            style={styles.versionLabel}
          >
            APP VERSION
          </AppText>

          <View style={styles.versionCard}>
            <AppText
              variant="body"
              style={styles.versionTitle}
            >
              AdlaWatt
            </AppText>

            <AppText
              variant="caption"
              style={styles.versionNumber}
            >
              v1.0.0
            </AppText>
          </View>
        </View>

        <Copyright />
      </ScrollView>

      {/* Password Confirmation Modal */}
      <Modal
        visible={confirmationVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setConfirmationVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <AppText
              variant="heading"
              style={styles.modalTitle}
            >
              Confirm Changes
            </AppText>

            <AppText
              variant="caption"
              style={styles.modalDescription}
            >
              Enter your current password to confirm
              these account changes.
            </AppText>

            <View style={styles.inputGroup}>
              <AppText
                variant="caption"
                style={styles.inputLabel}
              >
                Current Password
              </AppText>

              <View style={styles.passwordInputContainer}>
                <TextInput
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  style={styles.passwordInput}
                  placeholder="Enter current password"
                  placeholderTextColor={
                    Colors.light.textSecondary
                  }
                  secureTextEntry={!showCurrentPassword}
                />

                <Pressable
                  onPress={() =>
                    setShowCurrentPassword(
                      !showCurrentPassword,
                    )
                  }
                  style={styles.eyeButton}
                >
                  <AppText style={styles.eyeText}>
                    {showCurrentPassword ? "◉" : "○"}
                  </AppText>
                </Pressable>
              </View>
            </View>

            <View style={styles.actionRow}>
              <Pressable
                onPress={() =>
                  setConfirmationVisible(false)
                }
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.pressed,
                ]}
              >
                <AppText
                  style={styles.secondaryButtonText}
                >
                  Cancel
                </AppText>
              </Pressable>

              <Pressable
                onPress={handleConfirmChanges}
                style={({ pressed }) => [
                  styles.primaryButton,
                  styles.actionButton,
                  pressed && styles.pressed,
                ]}
              >
                <AppText
                  style={styles.primaryButtonText}
                >
                  Confirm
                </AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
      />
    </ScreenContainer2>
  );
}

const settingsDimensions = {
  horizontalPadding: 16,
  sectionSpacing: 16,
  borderWidth: 3,
  borderRadius: 16,
  innerRadius: 12,
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },

  content: {
    paddingHorizontal:
      settingsDimensions.horizontalPadding,
    paddingTop: settingsDimensions.sectionSpacing,
    paddingBottom: 30,
  },

  /* ================= HEADER ================= */

  headerCard: {
    backgroundColor: Colors.glass.white,
    borderWidth: settingsDimensions.borderWidth,
    borderColor: Colors.light.primary,
    borderRadius: settingsDimensions.borderRadius,
    padding: 18,
    marginBottom: settingsDimensions.sectionSpacing,
  },

  headerTitle: {
    color: "#000000",
    fontWeight: "700",
  },

  headerSubtitle: {
    color: Colors.light.textSecondary,
    marginTop: 6,
    lineHeight: 20,
  },

  /* ================= DROPDOWN SECTIONS ================= */

  sectionContainer: {
    width: "100%",
    marginBottom: settingsDimensions.sectionSpacing,
  },

  dropdownHeader: {
    width: "100%",
    backgroundColor: Colors.glass.white,
    borderWidth: settingsDimensions.borderWidth,
    borderColor: Colors.light.secondary,
    borderRadius: settingsDimensions.borderRadius,
    paddingHorizontal: 18,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dropdownHeaderText: {
    flex: 1,
  },

  dropdownTitle: {
    color: "#000000",
    fontWeight: "700",
  },

  dropdownSubtitle: {
    color: Colors.light.textSecondary,
    marginTop: 4,
  },

  dropdownArrow: {
    color: Colors.light.primary,
    fontSize: 25,
    fontWeight: "700",
    marginLeft: 10,
  },

  expandedContent: {
    paddingTop: 14,
    paddingBottom: 4,
  },

  /* ================= ACCOUNT ================= */

  infoRow: {
    marginBottom: 14,
    paddingHorizontal: 4,
  },

  infoLabel: {
    color: Colors.light.textSecondary,
    fontWeight: "600",
    marginBottom: 4,
  },

  infoValue: {
    color: "#000000",
    fontWeight: "500",
  },

  primaryButton: {
    minHeight: 44,
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    alignSelf: "flex-end",
    marginTop: 6,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  secondaryButton: {
    minHeight: 44,
    backgroundColor: Colors.glass.white,
    borderWidth: 3,
    borderColor: Colors.light.secondary,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  secondaryButtonText: {
    color: Colors.light.secondary,
    fontWeight: "700",
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
  },

  actionButton: {
    alignSelf: "auto",
    marginTop: 0,
  },

  pressed: {
    opacity: 0.7,
  },

  /* ================= INPUTS ================= */

  inputGroup: {
    marginBottom: 14,
  },

  inputLabel: {
    color: "#000000",
    fontWeight: "600",
    marginBottom: 6,
  },

  input: {
    minHeight: 48,
    backgroundColor: Colors.glass.white,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    borderRadius: 12,
    paddingHorizontal: 14,
    color: "#000000",
    fontSize: 15,
  },

  passwordInputContainer: {
    minHeight: 48,
    backgroundColor: Colors.glass.white,
    borderWidth: 2,
    borderColor: Colors.light.error,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  passwordInput: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: 14,
    color: "#000000",
    fontSize: 15,
  },

  eyeButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  eyeText: {
    color: Colors.light.primary,
    fontSize: 17,
    fontWeight: "700",
  },

  /* ================= PREFERENCES ================= */

  sectionLabel: {
    color: Colors.light.text,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginTop: 8,
    marginBottom: 10,
    paddingHorizontal: 4,
  },

  preferenceCard: {
    width: "100%",
    backgroundColor: Colors.glass.white,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    borderRadius: settingsDimensions.innerRadius,
    paddingHorizontal: 15,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  preferenceText: {
    flex: 1,
    paddingRight: 12,
  },

  preferenceTitle: {
    color: "#000000",
    fontWeight: "600",
  },

  preferenceDescription: {
    color: Colors.light.textSecondary,
    marginTop: 3,
    lineHeight: 18,
  },

  preferenceGroup: {
    marginBottom: 15,
  },

  groupLabel: {
    color: "#000000",
    fontWeight: "600",
    marginBottom: 7,
    paddingHorizontal: 4,
  },

  optionRow: {
    flexDirection: "row",
    gap: 8,
  },

  optionButton: {
    flex: 1,
    minHeight: 44,
    backgroundColor: Colors.glass.white,
    borderWidth: 2,
    borderColor: Colors.light.secondary,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },

  selectedOption: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },

  optionText: {
    color: "#000000",
    fontWeight: "600",
    fontSize: 13,
  },

  selectedOptionText: {
    color: "#FFFFFF",
  },

  dropdownInput: {
    minHeight: 48,
    backgroundColor: Colors.glass.white,
    borderWidth: 2,
    borderColor: Colors.light.secondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dropdownInputText: {
    color: "#000000",
    fontWeight: "500",
  },

  dropdownInputArrow: {
    color: Colors.light.primary,
    fontSize: 20,
    fontWeight: "700",
  },

  selectionMenu: {
    backgroundColor: Colors.glass.white,
    borderWidth: 2,
    borderColor: Colors.light.secondary,
    borderRadius: 12,
    marginTop: 5,
    overflow: "hidden",
  },

  selectionItem: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },

  selectionText: {
    color: "#000000",
    fontWeight: "500",
  },

  selectedSelectionText: {
    color: Colors.light.primary,
    fontWeight: "700",
  },

  /* ================= VERSION ================= */

  versionSection: {
    marginBottom: 18,
  },

  versionLabel: {
    color: Colors.light.primary,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 10,
    paddingHorizontal: 4,
  },

  versionCard: {
    backgroundColor: Colors.glass.white,
    borderWidth: settingsDimensions.borderWidth,
    borderColor: Colors.light.secondary,
    borderRadius: settingsDimensions.borderRadius,
    padding: 18,
  },

  versionTitle: {
    color: "#000000",
    fontWeight: "700",
  },

  versionNumber: {
    color: Colors.light.textSecondary,
    marginTop: 4,
  },

  /* ================= MODAL ================= */

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  modalCard: {
    width: "100%",
    maxWidth: 430,
    backgroundColor: Colors.light.background,
    borderWidth: 3,
    borderColor: Colors.light.primary,
    borderRadius: 18,
    padding: 20,
    elevation: 10,
  },

  modalTitle: {
    color: "#000000",
    fontWeight: "700",
  },

  modalDescription: {
    color: Colors.light.textSecondary,
    marginTop: 7,
    marginBottom: 18,
    lineHeight: 20,
  },
});