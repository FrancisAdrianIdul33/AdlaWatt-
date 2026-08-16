import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import ApplianceModal from "@/components/forms/ApplianceModal";
import ApplianceStatusBox from "@/components/forms/ApplianceStatusBox";
import Copyright from "@/components/forms/Copyright";
import NavBar from "@/components/layout/Navbar";
import ScreenContainer2 from "@/components/layout/ScreenContainer2";
import Sidebar from "@/components/layout/Sidebar";
import AppText from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";


type PowerLevel =
  | "All"
  | "Highest"
  | "Moderate"
  | "Low";

type Area =
  | "All Areas"
  | "Living Area"
  | "Bedroom"
  | "Kitchen & Dining Area"
  | "Work & Study Area"
  | "Bathroom & Laundry Area"
  | "Porch & Yard"
  | "Custom Appliances";

type SelectedAppliance = {
  id: string;
  name: string;
  watts: string;
  area: string;
};

type StatusFilter = "All" | "Advisable" | "notAdvisable";

export default function AppliancesScreen() {

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("All");

  const [selectedAppliances, setSelectedAppliances] =
    useState<SelectedAppliance[]>([]);

  const handleApplianceSave = (
    appliances: SelectedAppliance[],
  ) => {
    setSelectedAppliances(appliances);
  };

  const [applianceModalVisible, setApplianceModalVisible] =
    useState(false);

  const [sidebarVisible, setSidebarVisible] =
    useState(false);

  const [powerFilter, setPowerFilter] =
    useState<PowerLevel>("All");

  const [areaFilter, setAreaFilter] =
    useState<Area>("All Areas");

  const [powerDropdownVisible, setPowerDropdownVisible] =
    useState(false);

  const [areaDropdownVisible, setAreaDropdownVisible] =
    useState(false);

  const handlePowerFilter = (filter: PowerLevel) => {
    setPowerFilter(filter);
    setPowerDropdownVisible(false);
  };

  const handleAreaFilter = (filter: Area) => {
    setAreaFilter(filter);
    setAreaDropdownVisible(false);
  };

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
          <AppText
            variant="heading"
            style={styles.title}
          >
            Appliances
          </AppText>

          <AppText
            variant="caption"
            style={styles.subtitle}
          >
            Manage and monitor supported appliances.
          </AppText>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {/* Add New */}
          <Pressable
            onPress={() => setApplianceModalVisible(true)}
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="add-outline"
              size={18}
              color="#FFFFFF"
            />

            <AppText
              variant="caption"
              style={styles.addButtonText}
            >
              Add New
            </AppText>
          </Pressable>

          {/* Power Filter */}
          <View style={styles.filterWrapper}>
            <Pressable
              onPress={() => {
                setPowerDropdownVisible(
                  !powerDropdownVisible,
                );
                setAreaDropdownVisible(false);
              }}
              style={({ pressed }) => [
                styles.filterButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="flash-outline"
                size={18}
                color={Colors.light.primary}
              />

              <AppText
                variant="caption"
                style={styles.filterText}
              >
                {powerFilter}
              </AppText>

              <Ionicons
                name={
                  powerDropdownVisible
                    ? "chevron-up-outline"
                    : "chevron-down-outline"
                }
                size={17}
                color={Colors.light.text}
              />
            </Pressable>

            {powerDropdownVisible && (
              <View style={styles.dropdown}>
                {(
                  [
                    "All",
                    "Highest",
                    "Moderate",
                    "Low",
                  ] as PowerLevel[]
                ).map((option) => (
                  <Pressable
                    key={option}
                    onPress={() =>
                      handlePowerFilter(option)
                    }
                    style={({ pressed }) => [
                      styles.dropdownItem,
                      powerFilter === option &&
                      styles.selectedItem,
                      pressed &&
                      styles.dropdownPressed,
                    ]}
                  >
                    <AppText
                      variant="caption"
                      style={[
                        styles.dropdownText,
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

          {/* Area Filter */}
          <View style={styles.filterWrapper}>
            <Pressable
              onPress={() => {
                setAreaDropdownVisible(
                  !areaDropdownVisible,
                );
                setPowerDropdownVisible(false);
              }}
              style={({ pressed }) => [
                styles.filterButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="location-outline"
                size={18}
                color={Colors.light.primary}
              />

              <AppText
                variant="caption"
                style={styles.filterText}
              >
                {areaFilter}
              </AppText>

              <Ionicons
                name={
                  areaDropdownVisible
                    ? "chevron-up-outline"
                    : "chevron-down-outline"
                }
                size={17}
                color={Colors.light.text}
              />
            </Pressable>

            {areaDropdownVisible && (
              <View style={styles.dropdown}>
                {(
                  [
                    "All Areas",
                    "Living Area",
                    "Bedroom",
                    "Kitchen & Dining Area",
                    "Work & Study Area",
                    "Bathroom & Laundry Area",
                    "Porch & Yard",
                    "Custom Appliances",
                  ] as Area[]
                ).map((option) => (
                  <Pressable
                    key={option}
                    onPress={() =>
                      handleAreaFilter(option)
                    }
                    style={({ pressed }) => [
                      styles.dropdownItem,
                      areaFilter === option &&
                      styles.selectedItem,
                      pressed &&
                      styles.dropdownPressed,
                    ]}
                  >
                    <AppText
                      variant="caption"
                      style={[
                        styles.dropdownText,
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

        <View style={styles.statusToggle}>
          {(["All", "Advisable", "notAdvisable"] as StatusFilter[]).map(
            (option) => (
              <Pressable
                key={option}
                onPress={() => setStatusFilter(option)}
                style={({ pressed }) => [
                  styles.statusButton,
                  statusFilter === option && {
                    backgroundColor:
                      option === "Advisable"
                        ? Colors.light.primary
                        : option === "notAdvisable"
                          ? "#EF4444"
                          : Colors.light.primary,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <AppText
                  variant="caption"
                  style={[
                    styles.statusText,
                    statusFilter === option && styles.activeStatusText,
                  ]}
                >
                  {option === "notAdvisable"
                    ? "Not Advisable"
                    : option}
                </AppText>
              </Pressable>
            ),
          )}
        </View>

        <View style={styles.applianceGrid}>
          {selectedAppliances
            .filter((appliance) => {
              const power = parseInt(
                appliance.watts.match(/\d+/)?.[0] ?? "0",
              );

              const matchesPower =
                powerFilter === "All" ||
                (powerFilter === "Highest" && power >= 50) ||
                (powerFilter === "Moderate" && power >= 20 && power < 50) ||
                (powerFilter === "Low" && power < 20);

              const matchesArea =
                areaFilter === "All Areas" ||
                appliance.area === areaFilter;

              const status =
                power <= 100 ? "Advisable" : "notAdvisable";

              const matchesStatus =
                statusFilter === "All" ||
                status === statusFilter;

              return matchesPower && matchesArea && matchesStatus;
            })
            .map((appliance) => {
              const color =
                appliance.area === "Living Area"
                  ? Colors.light.primary
                  : appliance.area === "Bedroom"
                    ? "#9B59B6"
                    : appliance.area === "Kitchen & Dining Area"
                      ? Colors.light.secondary
                      : appliance.area === "Work & Study Area"
                        ? "#4A90E2"
                        : appliance.area === "Bathroom & Laundry Area"
                          ? "#16A085"
                          : appliance.area === "Porch & Yard"
                            ? "#E67E22"
                            : Colors.light.border;

              const power = parseInt(
                appliance.watts.match(/\d+/)?.[0] ?? "0",
              );

              const status =
                power <= 100 ? "OK to use" : "Not advised";

              return (
                <ApplianceStatusBox
                  key={appliance.id}
                  name={appliance.name}
                  wattage={appliance.watts}
                  color={color}
                  status={status}
                />
              );
            })}
        </View>

        <Copyright />
      </ScrollView>

      <ApplianceModal
        visible={applianceModalVisible}
        onClose={() => setApplianceModalVisible(false)}
        onSave={handleApplianceSave}
      />

      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
      />
    </ScreenContainer2>
  );
}

const dimensions = {
  padding: 16,
  radius: 16,
  borderWidth: 3,
  gap: 10,
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },

  content: {
    padding: dimensions.padding,
    paddingBottom: 24,
  },

  applianceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 20,
  },

  /* Header */

  card: {
    backgroundColor: Colors.glass.white,
    borderWidth: dimensions.borderWidth,
    borderColor: Colors.light.primary,
    borderRadius: dimensions.radius,
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

  /* Controls */

  controls: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: dimensions.gap,
    marginBottom: 18,
    zIndex: 20,
  },

  addButton: {
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,

    backgroundColor: Colors.light.primary,

    borderRadius: 14,

    paddingHorizontal: 12,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  filterWrapper: {
    flex: 1,
    position: "relative",
  },

  filterButton: {
    height: 46,
    width: "100%",

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: Colors.glass.white,

    borderWidth: dimensions.borderWidth,
    borderColor: Colors.light.primary,
    borderRadius: 14,

    paddingHorizontal: 11,
    gap: 6,
  },

  filterText: {
    flex: 1,
    color: "#000000",
    fontWeight: "600",
  },

  pressed: {
    opacity: 0.7,
  },

  /* Dropdown */

  dropdown: {
    position: "absolute",

    top: 52,
    left: 0,
    right: 0,

    backgroundColor: "#FFFFFF",

    borderWidth: 2,
    borderColor: Colors.light.primary,
    borderRadius: 14,

    paddingVertical: 5,

    zIndex: 100,
    elevation: 10,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },

  dropdownItem: {
    minHeight: 42,

    justifyContent: "center",

    paddingHorizontal: 12,
  },

  selectedItem: {
    backgroundColor: "rgba(0, 168, 107, 0.10)",
  },

  dropdownPressed: {
    opacity: 0.7,
  },

  dropdownText: {
    color: "#000000",
  },

  selectedText: {
    fontWeight: "700",
    color: Colors.light.primary,
  },

  /* Appliance Section */

  applianceSection: {
    width: "100%",
    marginBottom: 18,
  },

  sectionTitle: {
    color: "#000000",
    fontWeight: "700",
    marginBottom: 10,
  },

  /* Status Section */
  statusToggle: {
    width: "100%",
    flexDirection: "row",
    backgroundColor: Colors.glass.white,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderRadius: 14,
    padding: 3,
    marginTop: 10,
  },

  statusButton: {
    flex: 1,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
  },

  statusText: {
    color: Colors.light.text,
    fontSize: 13,
    fontWeight: "700",
  },

  activeStatusText: {
    color: "#FFFFFF",
  },
});