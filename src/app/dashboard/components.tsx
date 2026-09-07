import React, {
  useEffect,
  useState,
} from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import ComponentStatusBox from "@/components/forms/ComponentStatusBox";
import Copyright from "@/components/forms/Copyright";

import NavBar from "@/components/layout/Navbar";
import ScreenContainer2 from "@/components/layout/ScreenContainer2";
import Sidebar from "@/components/layout/Sidebar";

import AppText from "@/components/ui/AppText";
import EmptyState from "@/components/ui/EmptyState";

import { Colors } from "@/constants/colors";
import { supabase } from "@/lib/supabase";

// ============================================
// COMPONENT IMAGE MAPPING
// ============================================

const componentImages: Record<string, any> = {
  "Buck Converter": require(
    "@/assets/images/components/Buck Converter.png",
  ),

  DS18B20: require(
    "@/assets/images/components/DS18B20.png",
  ),

  ESP32: require(
    "@/assets/images/components/ESP32.png",
  ),

  "INA228 (Input)": require(
    "@/assets/images/components/INA228.png",
  ),

  "INA228 (Output)": require(
    "@/assets/images/components/INA228.png",
  ),

  "LCD2004 with I2C": require(
    "@/assets/images/components/LCD2004.png",
  ),

  "I2C OLED 1.3-inch": require(
    "@/assets/images/components/OLED 1.3Inch.png",
  ),

  "Relay Module 5V 1 Channel": require(
    "@/assets/images/components/Relay.png",
  ),

  "Voltage Sensor": require(
    "@/assets/images/components/Voltage Sensor.png",
  ),
};

// ============================================
// TYPES
// ============================================

type ComponentData = {
  component_id: string;
  component_name: string;
  status: boolean;
};

type DeviceStatus =
  | "Online"
  | "Offline"
  | "online"
  | "offline"
  | null;

// ============================================
// COMPONENT
// ============================================

export default function ComponentsScreen() {
  const [sidebarVisible, setSidebarVisible] =
    useState(false);

  const [statusFilter, setStatusFilter] =
    useState<
      "All" | "Active" | "Inactive"
    >("All");

  const [components, setComponents] =
    useState<ComponentData[]>([]);

  // ESP32 status from monitoring table
  const [deviceStatus, setDeviceStatus] =
    useState<DeviceStatus>(null);

  // ============================================
  // LOAD COMPONENTS + ESP32 STATUS + REALTIME
  // ============================================

  useEffect(() => {
    let cancelled = false;

    let componentsChannel:
      | ReturnType<typeof supabase.channel>
      | null = null;

    let monitoringChannel:
      | ReturnType<typeof supabase.channel>
      | null = null;

    // ==========================================
    // LOAD COMPONENTS
    // ==========================================

    const loadComponents = async (
      userId: string,
    ) => {
      const { data, error } =
        await supabase
          .from("components")
          .select(
            "component_id, component_name, status",
          )
          .eq("user_id", userId)
          .order("component_name", {
            ascending: true,
          });

      if (cancelled) return;

      if (error) {
        console.error(
          "Error loading components:",
          error.message,
        );
        return;
      }

      setComponents(data ?? []);
    };

    // ==========================================
    // LOAD ESP32 DEVICE STATUS
    // ==========================================

    const loadDeviceStatus = async (
      userId: string,
    ) => {
      const { data, error } =
        await supabase
          .from("monitoring")
          .select("device_status")
          .eq("user_id", userId)
          .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error(
          "Error loading device status:",
          error.message,
        );

        setDeviceStatus(null);
        return;
      }

      setDeviceStatus(
        data?.device_status ?? null,
      );
    };

    // ==========================================
    // SETUP
    // ==========================================

    const setup = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (userError) {
        console.error(
          "Error getting user:",
          userError.message,
        );
        return;
      }

      if (!user) {
        setComponents([]);
        setDeviceStatus(null);
        return;
      }

      // ========================================
      // LOAD INITIAL DATA
      // ========================================

      await Promise.all([
        loadComponents(user.id),
        loadDeviceStatus(user.id),
      ]);

      if (cancelled) return;

      // ========================================
      // COMPONENTS REALTIME
      // ========================================

      const newComponentsChannel =
        supabase.channel(
          `components-${user.id}-${Date.now()}`,
        );

      newComponentsChannel
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "components",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            if (!cancelled) {
              loadComponents(user.id);
            }
          },
        )
        .subscribe((status, error) => {
          console.log(
            "Components Realtime status:",
            status,
            error,
          );

          if (
            status === "CHANNEL_ERROR"
          ) {
            console.error(
              "Components Realtime channel error:",
              error,
            );
          }
        });

      componentsChannel =
        newComponentsChannel;

      // ========================================
      // MONITORING REALTIME
      // ========================================

      const newMonitoringChannel =
        supabase.channel(
          `monitoring-${user.id}-${Date.now()}`,
        );

      newMonitoringChannel
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "monitoring",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (cancelled) return;

            const updatedStatus =
              payload.new.device_status;

            setDeviceStatus(
              updatedStatus as DeviceStatus,
            );
          },
        )
        .subscribe((status, error) => {
          console.log(
            "Monitoring Realtime status:",
            status,
            error,
          );

          if (
            status === "CHANNEL_ERROR"
          ) {
            console.error(
              "Monitoring Realtime channel error:",
              error,
            );
          }
        });

      monitoringChannel =
        newMonitoringChannel;
    };

    setup();

    // ==========================================
    // CLEANUP
    // ==========================================

    return () => {
      cancelled = true;

      if (componentsChannel) {
        supabase.removeChannel(
          componentsChannel,
        );
      }

      if (monitoringChannel) {
        supabase.removeChannel(
          monitoringChannel,
        );
      }
    };
  }, []);

  // ============================================
  // RENDER
  // ============================================

  return (
    <ScreenContainer2>
      <NavBar
        onMenuPress={() =>
          setSidebarVisible(true)
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Header */}

        <View style={styles.card}>
          <AppText
            variant="heading"
            style={styles.title}
          >
            Components
          </AppText>

          <AppText
            variant="caption"
            style={styles.subtitle}
          >
            Monitor AdlaWatt system components.
          </AppText>
        </View>

        {/* STATUS FILTER */}

        <View style={styles.statusToggle}>
          {(
            [
              "All",
              "Active",
              "Inactive",
            ] as const
          ).map((option) => (
            <Pressable
              key={option}
              onPress={() =>
                setStatusFilter(option)
              }
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

                  statusFilter === option &&
                    styles.activeStatusText,
                ]}
              >
                {option}
              </AppText>
            </Pressable>
          ))}
        </View>

        {/* COMPONENT GRID */}

        <View style={styles.componentGrid}>
          {(() => {
            const filteredComponents =
              [...components]
                .sort((a, b) =>
                  a.component_name.localeCompare(
                    b.component_name,
                  ),
                )
                .filter((component) => {
                  // ==================================
                  // ALL FILTER
                  // ==================================

                  if (
                    statusFilter === "All"
                  ) {
                    return true;
                  }

                  // ==================================
                  // CHECK IF COMPONENT IS ESP32
                  // ==================================

                  const isESP32 =
                    component.component_name ===
                    "ESP32";

                  // ==================================
                  // ESP32 STATUS COMES FROM
                  // MONITORING.DEVICE_STATUS
                  // ==================================

                  const isActive = isESP32
                    ? String(
                        deviceStatus,
                      ).toLowerCase() ===
                      "online"
                    : component.status;

                  // ==================================
                  // ACTIVE / INACTIVE FILTER
                  // ==================================

                  return statusFilter ===
                    "Active"
                    ? isActive
                    : !isActive;
                });

            // ========================================
            // EMPTY STATE
            // ========================================

            if (
              filteredComponents.length === 0
            ) {
              return (
                <EmptyState
                  title={
                    statusFilter === "All"
                      ? "No Components"
                      : statusFilter ===
                          "Active"
                        ? "No Active Components"
                        : "No Inactive Components"
                  }
                  description={
                    statusFilter === "All"
                      ? "No components are available for this account."
                      : statusFilter ===
                          "Active"
                        ? "No components are currently active."
                        : "No components are currently inactive."
                  }
                  icon="hardware-chip-outline"
                />
              );
            }

            // ========================================
            // COMPONENT CARDS
            // ========================================

            return filteredComponents.map(
              (component) => {
                const isESP32 =
                  component.component_name ===
                  "ESP32";

                // ESP32 connection status
                // comes from monitoring table.
                const isConnected =
                  String(
                    deviceStatus,
                  ).toLowerCase() ===
                  "online";

                const status = isESP32
                  ? isConnected
                    ? "Connected"
                    : "Not Connected"
                  : component.status
                    ? "Active"
                    : "Inactive";

                return (
                  <ComponentStatusBox
                    key={
                      component.component_id
                    }
                    name={
                      component.component_name
                    }
                    status={status}
                    imageSource={
                      componentImages[
                        component.component_name
                      ]
                    }
                  />
                );
              },
            );
          })()}
        </View>

        <Copyright />
      </ScrollView>

      <Sidebar
        visible={sidebarVisible}
        onClose={() =>
          setSidebarVisible(false)
        }
      />
    </ScreenContainer2>
  );
}

// ============================================
// STYLES
// ============================================


const styles = StyleSheet.create({

  scrollView: {

    flex: 1,

    backgroundColor:
      Colors.light.background,

  },

  content: {

    padding: 16,

  },

  card: {

    backgroundColor:
      Colors.glass.white,

    borderWidth: 3,

    borderColor:
      Colors.light.secondary,

    borderRadius: 16,

    padding: 18,

  },

  title: {

    color: "#000000",

    fontWeight: "700",

  },

  subtitle: {

    color:
      Colors.light.textSecondary,

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

    backgroundColor:
      Colors.glass.white,

    borderWidth: 2,

    borderColor:
      Colors.light.border,

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