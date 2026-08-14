import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import ApplianceCards from "@/components/ApplianceCards";
import ApplianceModal from "@/components/forms/ApplianceModal";
import Copyright from "@/components/forms/Copyright";
import NavBar from "@/components/layout/Navbar";
import ScreenContainer2 from "@/components/layout/ScreenContainer2";
import Sidebar from "@/components/layout/Sidebar";
import AppText from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";

type PowerLevel = "All" | "Highest" | "Moderate" | "Low";

type Area =
  | "All Areas"
  | "Living Area"
  | "Dining Area"
  | "Bedroom"
  | "Office"
  | "Kitchen"
  | "Other";

export default function AppliancesScreen() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [powerFilter, setPowerFilter] =
    useState<PowerLevel>("All");

  const [areaFilter, setAreaFilter] =
    useState<Area>("All Areas");

  const [powerDropdown, setPowerDropdown] =
    useState(false);

  const [areaDropdown, setAreaDropdown] =
    useState(false);

  const powerOptions: PowerLevel[] = [
    "All",
    "Highest",
    "Moderate",
    "Low",
  ];

  const areaOptions: Area[] = [
    "All Areas",
    "Living Area",
    "Dining Area",
    "Bedroom",
    "Office",
    "Kitchen",
    "Other",
  ];

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
        {/* Header */}
        <View style={styles.card}>
          <AppText variant="heading" style={styles.title}>
            Appliances
          </AppText>

          <AppText variant="caption" style={styles.subtitle}>
            Manage and monitor supported appliances.
          </AppText>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <Pressable
            onPress={() => setModalVisible(true)}
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.pressed,
            ]}
          >
            <AppText
              variant="caption"
              style={styles.addButtonText}
            >
              + Add New
            </AppText>
          </Pressable>

          {/* Power Dropdown */}
          <View style={styles.dropdownWrapper}>
            <Pressable
              onPress={() => {
                setPowerDropdown(!powerDropdown);
                setAreaDropdown(false);
              }}
              style={styles.dropdownButton}
            >
              <AppText
                variant="caption"
                style={styles.dropdownText}
              >
                {powerFilter}
              </AppText>

              <AppText style={styles.chevron}>
                {powerDropdown ? "▲" : "▼"}
              </AppText>
            </Pressable>

            {powerDropdown && (
              <View style={styles.dropdown}>
                {powerOptions.map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => {
                      setPowerFilter(option);
                      setPowerDropdown(false);
                    }}
                    style={styles.dropdownItem}
                  >
                    <AppText
                      variant="caption"
                      style={[
                        styles.dropdownItemText,
                        powerFilter === option &&
                          styles.selectedText,
                      ]}
                    >
                      {option}
                    </AppText>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Area Dropdown */}
          <View style={styles.dropdownWrapper}>
            <Pressable
              onPress={() => {
                setAreaDropdown(!areaDropdown);
                setPowerDropdown(false);
              }}
              style={styles.dropdownButton}
            >
              <AppText
                variant="caption"
                style={styles.dropdownText}
              >
                {areaFilter}
              </AppText>

              <AppText style={styles.chevron}>
                {areaDropdown ? "▲" : "▼"}
              </AppText>
            </Pressable>

            {areaDropdown && (
              <View style={styles.dropdown}>
                {areaOptions.map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => {
                      setAreaFilter(option);
                      setAreaDropdown(false);
                    }}
                    style={styles.dropdownItem}
                  >
                    <AppText
                      variant="caption"
                      style={[
                        styles.dropdownItemText,
                        areaFilter === option &&
                          styles.selectedText,
                      ]}
                    >
                      {option}
                    </AppText>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Appliance Label */}
        <AppText
          variant="body"
          style={styles.applianceLabel}
        >
          Appliances
        </AppText>

        {/* Appliance Cards */}
        <ApplianceCards
          powerFilter={
            powerFilter === "All"
              ? undefined
              : powerFilter
          }
          areaFilter={
            areaFilter === "All Areas"
              ? undefined
              : areaFilter
          }
        />

        <Copyright />
      </ScrollView>

      {/* Add Appliance Modal */}
      <ApplianceModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={() => {
          setModalVisible(false);
        }}
      />

      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
      />
    </ScreenContainer2>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },

  content: {
    padding: 16,
    paddingBottom: 24,
  },

  card: {
    backgroundColor: Colors.glass.white,
    borderWidth: 3,
    borderColor: Colors.light.primary,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },

  title: {
    color: "#000000",
    fontWeight: "700",
  },

  subtitle: {
    color: Colors.light.textSecondary,
    marginTop: 6,
  },

  controls: {
    width: "100%",
    flexDirection: "row",
    gap: 8,
    marginBottom: 18,
    zIndex: 10,
  },

  addButton: {
    minHeight: 44,
    paddingHorizontal: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 11,
  },

  dropdownWrapper: {
    flex: 1,
    position: "relative",
  },

  dropdownButton: {
    minHeight: 44,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.glass.white,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    borderRadius: 12,
  },

  dropdownText: {
    flex: 1,
    color: "#000000",
    fontWeight: "600",
    fontSize: 11,
  },

  chevron: {
    color: Colors.light.textSecondary,
    fontSize: 9,
  },

  dropdown: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 4,
    elevation: 10,
    zIndex: 100,
  },

  dropdownItem: {
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 11,
  },

  dropdownItemText: {
    color: "#000000",
    fontSize: 11,
  },

  selectedText: {
    color: Colors.light.primary,
    fontWeight: "700",
  },

  applianceLabel: {
    color: "#000000",
    fontWeight: "700",
    marginBottom: 10,
  },

  pressed: {
    opacity: 0.7,
  },
});