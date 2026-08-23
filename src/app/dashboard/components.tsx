import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import ComponentStatusBox from "@/components/forms/ComponentStatusBox";
import Copyright from "@/components/forms/Copyright";
import NavBar from "@/components/layout/Navbar";
import ScreenContainer2 from "@/components/layout/ScreenContainer2";
import Sidebar from "@/components/layout/Sidebar";
import AppText from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";
import { supabase } from "@/lib/supabase";

export default function ComponentsScreen() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [statusFilter, setStatusFilter] =
    useState<"All" | "Active" | "Inactive">("All");

  const [components, setComponents] = useState<
    {
      comp_id: string;
      component_name: string;
      status: boolean;
    }[]
  >([]);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel>;

    const loadComponents = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("components")
        .select("comp_id, component_name, status")
        .eq("user_id", user.id)
        .order("component_name", { ascending: true });

      if (error) {
        console.error("Error loading components:", error.message);
        return;
      }

      setComponents(data ?? []);

      channel = supabase
        .channel(`components-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "components",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            loadComponents();
          },
        )
        .subscribe();
    };

    loadComponents();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

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
          {[...components]
            .sort((a, b) =>
              a.component_name.localeCompare(b.component_name),
            )
            .filter((component) => {
              if (statusFilter === "All") return true;

              return statusFilter === "Active"
                ? component.status
                : !component.status;
            })
            .map((component) => {
              const status =
                component.component_name === "ESP32"
                  ? component.status
                    ? "Connected"
                    : "Not Connected"
                  : component.status
                    ? "Active"
                    : "Inactive";

              return (
                <ComponentStatusBox
                  key={component.comp_id}
                  name={component.component_name}
                  status={status}
                />
              );
            })}
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