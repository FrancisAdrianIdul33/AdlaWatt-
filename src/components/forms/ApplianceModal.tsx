import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import ApplianceBox from "@/components/forms/ApplianceBox";
import AppText from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";
import { Radius, Spacing, Typography } from "@/constants/theme";

import { supabase } from "@/lib/supabase";

type Appliance = {
  id: string;
  name: string;
  watts: string;
  area: string;
};

type ApplianceModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave?: (appliances: Appliance[]) => void;
  customAppliances?: Appliance[];
  onCustomAdd?: (appliance: Appliance) => void;
  onCustomUpdate?: (appliance: Appliance) => void;
  onCustomDelete?: (id: string) => void;
  selectedAppliances?: Appliance[];
};


const areaColors: Record<string, string> = {
  "Living Area": Colors.light.primary,
  Bedroom: "#9B59B6",
  "Kitchen & Dining Area": Colors.light.secondary,
  "Work & Study Area": "#4A90E2",
  "Bathroom & Laundry Area": "#16A085",
  "Porch & Yard": "#E67E22",
};

const getAreaColor = (area: string) =>
  areaColors[area] ?? Colors.light.border;

export default function ApplianceModal({
  visible,
  onClose,
  onSave,
  customAppliances = [],
  selectedAppliances = [],
  onCustomAdd,
  onCustomUpdate,
  onCustomDelete,
}: ApplianceModalProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [appliances, setAppliances] = useState<Appliance[]>([]);

  const [customVisible, setCustomVisible] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customWatts, setCustomWatts] = useState("");
  const [customError, setCustomError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editingCustom, setEditingCustom] =
    useState<Appliance | null>(null);

  const loadAppliances = async () => {
    const { data, error } = await supabase
      .from("appliances")
      .select("app_id, appliance_name, wattage, area, type, status")
      .order("area")
      .order("appliance_name");

    if (error) {
      console.error("Failed to load appliances:", error.message);
      return;
    }

    setAppliances(
      (data ?? []).map((item) => ({
        id: item.app_id,
        name: item.appliance_name,
        watts: item.wattage,
        area: item.area,
      })),
    );
  };

  useEffect(() => {
    if (visible) {
      loadAppliances();
      setSelected(selectedAppliances.map(({ id }) => id));
    } else {
      setSelected([]);
      setCustomVisible(false);
      setCustomName("");
      setCustomWatts("");
      setCustomError("");
      setSuccessMessage("");
      setEditingCustom(null);
    }
  }, [visible, selectedAppliances]);

  const toggleAppliance = (id: string) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const handleReset = () => {
    setSelected([]);
    setCustomName("");
    setCustomWatts("");
    setCustomError("");
    setCustomVisible(false);
    setEditingCustom(null);
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from("appliances")
      .update({ selection: false })
      .neq("app_id", "");

    if (error) {
      console.error("Reset appliance selection error:", error.message);
      return;
    }

    if (selected.length > 0) {
      const { error: selectionError } = await supabase
        .from("appliances")
        .update({ selection: true })
        .in("app_id", selected);

      if (selectionError) {
        console.error(
          "Update appliance selection error:",
          selectionError.message,
        );
        return;
      }
    }

    const selectedItems = appliances.filter((item) =>
      selected.includes(item.id),
    );

    onSave?.(selectedItems);
    onClose();
  };

  const handleCustomCancel = () => {
    setCustomName("");
    setCustomWatts("");
    setCustomError("");
    setCustomVisible(false);
  };

  const handleCustomAdd = async () => {
    const name = customName.trim();
    const watts = customWatts.trim();

    if (!/^[A-Za-z][A-Za-z0-9 /&.'-]{2,49}$/.test(name)) {
      setCustomError("Enter a valid appliance name.");
      return;
    }

    if (!/^\d+-\d+$/.test(watts)) {
      setCustomError("Enter wattage like 15-25.");
      return;
    }

    const { data, error } = await supabase
      .from("appliances")
      .insert({
        appliance_name: name,
        wattage: `${watts}W`,
        area: "Custom Appliances",
        type: "custom",
        selection: false,
        status: true,
      })
      .select("app_id, appliance_name, wattage, area")
      .single();

    if (error) {
      console.error("Custom appliance error:", error.message);
      setCustomError("Unable to add appliance. Please try again.");
      return;
    }

    const appliance: Appliance = {
      id: data.app_id,
      name: data.appliance_name,
      watts: data.wattage,
      area: data.area,
    };

    onCustomAdd?.(appliance);

    setAppliances((current) => [...current, appliance]);

    setCustomName("");
    setCustomWatts("");
    setCustomError("");
    setCustomVisible(false);

    setSuccessMessage(`${name} successfully added!`);

    setTimeout(() => {
      setSuccessMessage("");
    }, 5000);
  };

  const handleCustomUpdate = () => {
    if (!editingCustom) return;

    const name = customName.trim();
    const watts = customWatts.trim();

    if (!/^[A-Za-z][A-Za-z0-9 /&.'-]{2,49}$/.test(name)) {
      setCustomError("Enter a valid appliance name.");
      return;
    }

    if (!/^\d+-\d+$/.test(watts)) {
      setCustomError("Enter wattage like 15-25.");
      return;
    }

    onCustomUpdate?.({
      ...editingCustom,
      name,
      watts: `${watts}W`,
    });

    setEditingCustom(null);
    setCustomName("");
    setCustomWatts("");
    setCustomError("");
  };

  const openCustomEditor = (appliance: Appliance) => {
    setEditingCustom(appliance);
    setCustomName(appliance.name);
    setCustomWatts(appliance.watts.replace(/W$/, ""));
    setCustomError("");
  };

  const sections = [
    "Living Area",
    "Bedroom",
    "Kitchen & Dining Area",
    "Work & Study Area",
    "Bathroom & Laundry Area",
    "Porch & Yard",
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <AppText variant="heading" style={styles.title}>
              Add Appliances
            </AppText>

            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close Add Appliances"
            >
              <Ionicons
                name="close"
                size={24}
                color={Colors.light.text}
              />
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator
          >
            <AppText variant="caption" style={styles.subtitle}>
              Select the appliances you want to use with your AdlaWatt system.
            </AppText>

            {/* Battery Advisory */}
            <View style={styles.advisory}>
              <Ionicons
                name="battery-half-outline"
                size={22}
                color={Colors.light.primary}
              />

              <View style={styles.advisoryText}>
                <AppText variant="body" style={styles.advisoryTitle}>
                  Battery Capacity: 720 Wh
                </AppText>

                <AppText
                  variant="caption"
                  style={styles.advisoryDescription}
                >
                  Keep your selected appliances within the available energy
                  capacity.
                </AppText>
              </View>
            </View>

            {/* Custom Appliance */}
            <View style={styles.customSection}>
              <AppText variant="body" style={styles.sectionTitle}>
                Custom Appliance
              </AppText>

              <Pressable
                onPress={() => {
                  if (customVisible) {
                    setCustomName("");
                    setCustomWatts("");
                    setCustomError("");
                  }

                  setCustomVisible((value) => !value);
                }}
                style={({ pressed }) => [
                  styles.customButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={20}
                  color={Colors.light.primary}
                />

                <AppText
                  variant="caption"
                  style={styles.customButtonText}
                >
                  Add Custom Appliance
                </AppText>
              </Pressable>
            </View>

            {customVisible && (
              <View style={styles.customForm}>
                <AppText
                  variant="caption"
                  style={styles.infoNote}
                >
                  Check the appliance wattage first, for example,
                  soldering wire may use 15-25W.
                </AppText>

                <TextInput
                  value={customName}
                  onChangeText={(text) => {
                    setCustomName(text);
                    setCustomError("");
                  }}
                  placeholder="Enter valid appliance name"
                  placeholderTextColor={Colors.light.textSecondary}
                  style={styles.input}
                />

                <TextInput
                  value={customWatts}
                  onChangeText={(text) => {
                    setCustomWatts(
                      text.replace(/[^\d-]/g, ""),
                    );
                    setCustomError("");
                  }}
                  placeholder="Enter wattage like 15-20"
                  placeholderTextColor={Colors.light.textSecondary}
                  style={styles.input}
                  keyboardType="numeric"
                />

                {customError ? (
                  <AppText
                    variant="caption"
                    style={styles.customError}
                  >
                    {customError}
                  </AppText>
                ) : null}

                <View style={styles.customActions}>
                  <Pressable
                    onPress={handleCustomCancel}
                    style={({ pressed }) => [
                      styles.customAction,
                      styles.cancelAction,
                      pressed && styles.pressed,
                    ]}
                  >
                    <AppText
                      variant="caption"
                      style={styles.cancelText}
                    >
                      Cancel
                    </AppText>
                  </Pressable>

                  <Pressable
                    onPress={handleCustomAdd}
                    disabled={
                      !customName.trim() ||
                      !customWatts.trim()
                    }
                    style={({ pressed }) => [
                      styles.customAction,
                      styles.addAction,
                      pressed && styles.pressed,
                    ]}
                  >
                    <AppText
                      variant="caption"
                      style={styles.addText}
                    >
                      Add
                    </AppText>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Success Panel */}
            {successMessage ? (
              <View style={styles.successPanel}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color={Colors.light.primary}
                />

                <AppText
                  variant="caption"
                  style={styles.successText}
                >
                  {successMessage}
                </AppText>
              </View>
            ) : null}

            {/* Custom Appliances */}
            {appliances.some((item) => item.area === "Custom Appliances") && (
              <View style={styles.section}>
                <AppText
                  variant="body"
                  style={styles.sectionTitle}
                >
                  Custom Appliances
                </AppText>

                <View style={styles.grid}>
                  {appliances
                    .filter((item) => item.area === "Custom Appliances")
                    .map((appliance) => {

                      const alreadyAdded = selectedAppliances.some(
                        ({ id }) => id === appliance.id,
                      );

                      return (
                        <ApplianceBox
                          key={appliance.id}
                          name={appliance.name}
                          wattage={appliance.watts}
                          color={Colors.light.primary}
                          selected={alreadyAdded || selected.includes(appliance.id)}
                          onPress={() => {
                            if (!alreadyAdded) {
                              toggleAppliance(appliance.id);
                            }
                          }}
                        />
                      );
                    })}
                </View>
              </View>
            )}

            {/* Appliance Categories */}
            {sections.map((section) => {
              const items = appliances.filter(
                (item) => item.area === section,
              );

              return (
                <View
                  key={section}
                  style={styles.section}
                >
                  <AppText
                    variant="body"
                    style={styles.sectionTitle}
                  >
                    {section}
                  </AppText>

                  <View style={styles.grid}>
                    {items.map((appliance) => {
                      const isSelected =
                        selected.includes(appliance.id);

                      return (
                        <ApplianceBox
                          key={appliance.id}
                          name={appliance.name}
                          wattage={appliance.watts}
                          color={getAreaColor(appliance.area)}
                          selected={isSelected}
                          onPress={() =>
                            toggleAppliance(appliance.id)
                          }
                        />
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.selectedInfo}>
              <Ionicons
                name="checkmark-circle-outline"
                size={17}
                color={Colors.light.primary}
              />

              <AppText
                variant="caption"
                style={styles.selectedText}
              >
                {selected.length} appliance
                {selected.length !== 1 ? "s" : ""} selected
              </AppText>
            </View>

            <View style={styles.footerButtons}>
              <Pressable
                onPress={handleReset}
                style={({ pressed }) => [
                  styles.resetButton,
                  pressed && styles.pressed,
                ]}
              >
                <AppText
                  variant="caption"
                  style={styles.resetText}
                >
                  Reset
                </AppText>
              </Pressable>

              <Pressable
                onPress={handleSave}
                style={({ pressed }) => [
                  styles.actionButton,
                  pressed && styles.pressed,
                ]}
              >
                <AppText
                  variant="caption"
                  style={styles.actionText}
                >
                  Add
                </AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      {/* Custom Appliance Editor */}
      <Modal
        visible={!!editingCustom}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingCustom(null)}
      >
        <View style={styles.overlay}>
          <View style={styles.successPanel}>
            <AppText
              variant="body"
              style={styles.sectionTitle}
            >
              Update Custom Appliance
            </AppText>

            <TextInput
              value={customName}
              onChangeText={(text) => {
                setCustomName(text);
                setCustomError("");
              }}
              placeholder="Enter valid appliance name"
              placeholderTextColor={Colors.light.textSecondary}
              style={styles.input}
            />

            <TextInput
              value={customWatts}
              onChangeText={(text) => {
                setCustomWatts(
                  text.replace(/[^\d-]/g, ""),
                );
                setCustomError("");
              }}
              placeholder="Enter wattage like 15-20"
              placeholderTextColor={Colors.light.textSecondary}
              style={styles.input}
              keyboardType="numeric"
            />

            {customError ? (
              <AppText
                variant="caption"
                style={styles.customError}
              >
                {customError}
              </AppText>
            ) : null}

            <View style={styles.customActions}>
              <Pressable
                onPress={() => {
                  setEditingCustom(null);
                  setCustomName("");
                  setCustomWatts("");
                  setCustomError("");
                }}
                style={styles.customAction}
              >
                <AppText
                  variant="caption"
                  style={styles.cancelText}
                >
                  Cancel
                </AppText>
              </Pressable>

              <Pressable
                onPress={handleCustomUpdate}
                style={styles.customAction}
              >
                <AppText
                  variant="caption"
                  style={styles.addText}
                >
                  Update
                </AppText>
              </Pressable>

              <Pressable
                onPress={() => {
                  if (editingCustom) {
                    onCustomDelete?.(
                      editingCustom.id,
                    );
                    setEditingCustom(null);
                    setCustomName("");
                    setCustomWatts("");
                    setCustomError("");
                  }
                }}
                style={styles.customAction}
              >
                <AppText
                  variant="caption"
                  style={styles.cancelText}
                >
                  Delete
                </AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },

  modal: {
    height: "92%",
    backgroundColor: Colors.light.surface,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    overflow: "hidden",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.light.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },

  title: {
    fontSize: Typography.heading,
    fontWeight: "700",
    color: "#000000",
  },

  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    flex: 1,
  },

  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },

  subtitle: {
    color: Colors.light.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },

  advisory: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 168, 107, 0.08)",
    borderWidth: 2,
    borderColor: Colors.light.primary,
    borderRadius: Radius.md,
    padding: 13,
    marginBottom: Spacing.lg,
  },

  advisoryText: {
    flex: 1,
    marginLeft: 10,
  },

  advisoryTitle: {
    color: "#000000",
    fontWeight: "700",
    fontSize: 20,
  },

  advisoryDescription: {
    color: Colors.light.textSecondary,
    lineHeight: 18,
    marginTop: 3,
    fontSize: 14,
  },

  customSection: {
    marginBottom: Spacing.lg,
  },

  section: {
    marginBottom: Spacing.lg,
  },

  sectionTitle: {
    color: "#1b1b1b",
    fontWeight: "700",
    fontSize: 20,
    marginBottom: Spacing.sm,
  },

  customButton: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: Colors.glass.white,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    borderRadius: Radius.md,
  },

  customButtonText: {
    color: Colors.light.primary,
    fontWeight: "700",
    fontSize: 14,
  },

  customForm: {
    gap: 8,
    marginTop: 9,
  },

  input: {
    height: 44,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    color: "#000000",
    fontSize: 14,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },

  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },

  selectedInfo: {
    minHeight: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 8,
  },

  selectedText: {
    color: Colors.light.textSecondary,
    fontSize: 14,
  },

  footerButtons: {
    flexDirection: "row",
    gap: 8,
  },

  resetButton: {
    flex: 1,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.glass.white,
  },

  resetText: {
    color: Colors.light.text,
    fontWeight: "700",
    fontSize: 14,
  },

  actionButton: {
    flex: 1,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
    backgroundColor: Colors.light.primary,
  },

  actionText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },

  pressed: {
    opacity: 0.7,
  },

  customActions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 15,
    marginTop: 10,
  },

  customAction: {
    flex: 1,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderRadius: Radius.md,
  },

  cancelAction: {
    borderColor: "#EF4444",
  },

  addAction: {
    borderColor: Colors.light.primary,
  },

  cancelText: {
    color: "#EF4444",
    fontWeight: "700",
  },

  addText: {
    color: Colors.light.primary,
    fontWeight: "700",
  },

  infoNote: {
    color: Colors.light.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 2,
  },

  customError: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "600",
  },

  successPanel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#F0EAD6",
    borderWidth: 2,
    borderColor: Colors.light.primary,
    borderRadius: Radius.md,
    padding: 10,
    marginBottom: Spacing.md,
  },

  successText: {
    flex: 1,
    color: "#000000",
    fontWeight: "600",
  },
});