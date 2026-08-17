import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import ComponentStatusBox from "@/components/forms/ComponentStatusBox";
import Copyright from "@/components/forms/Copyright";
import NavBar from "@/components/layout/Navbar";
import ScreenContainer2 from "@/components/layout/ScreenContainer2";
import Sidebar from "@/components/layout/Sidebar";
import AppText from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";

export default function ComponentsScreen() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [statusFilter, setStatusFilter] =
  useState<"All" | "Active" | "Inactive">("All");

  return (
    <ScreenContainer2>
      <NavBar onMenuPress={() => setSidebarVisible(true)} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={styles.card}>
          <AppText variant="heading" style={styles.title}>
            Components
          </AppText>

          <AppText variant="caption" style={styles.subtitle}>
            Monitor AdlaWatt system components.
          </AppText>
        </View>

        <View style={styles.statusToggle}>
          {(["All", "Active", "Inactive"] as const).map((option) => (
            <Pressable
              key={option}
              onPress={() => setStatusFilter(option)}
              style={({ pressed }) => [
                styles.statusButton,
                statusFilter === option && {
                  backgroundColor:
                    option === "Inactive"
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
                {option}
              </AppText>
            </Pressable>
          ))}
        </View>

        <View style={styles.componentGrid}>
          {[
            {
              name: "ESP32",
              status: "Connected" as const,
              color: Colors.light.primary,
            },
            {
              name: "INA226 (Input)",
              status: "Active" as const,
              color: Colors.light.primary,
            },
            {
              name: "INA226 (Output)",
              status: "Active" as const,
              color: Colors.light.primary,
            },
            {
              name: "DS18B20",
              status: "Active" as const,
              color: "#4A90E2",
            },
            {
              name: "Buck Converter",
              status: "Active" as const,
              color: Colors.light.secondary,
            },
            {
              name: "Voltage Sensor",
              status: "Active" as const,
              color: "#16A085",
            },
            {
              name: "Relay Module 5V 1 Channel",
              status: "Active" as const,
              color: "#E67E22",
            },
            {
              name: "LCD2004 with I2C",
              status: "Active" as const,
              color: "#9B59B6",
            },
          ]
            .filter((component) => {
              if (statusFilter === "All") return true;

              const active =
                component.status === "Active" ||
                component.status === "Connected";

              return statusFilter === "Active" ? active : !active;
            })
            .map((component) => (
              <ComponentStatusBox
                key={component.name}
                name={component.name}
                status={component.status}
              />
            ))}
        </View>
        <Copyright />
      </ScrollView>

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
  },

  card: {
    backgroundColor: Colors.glass.white,
    borderWidth: 3,
    borderColor: Colors.light.secondary,
    borderRadius: 16,
    padding: 18,
  },

  title: {
    color: "#000000",
    fontWeight: "700",
  },

  subtitle: {
    color: Colors.light.textSecondary,
    marginTop: 6,
  },

  componentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 20,
  },

  statusToggle: {
    width: "100%",
    flexDirection: "row",
    backgroundColor: Colors.glass.white,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderRadius: 14,
    padding: 3,
    marginTop: 18,
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

  pressed: {
    opacity: 0.7,
  },
});