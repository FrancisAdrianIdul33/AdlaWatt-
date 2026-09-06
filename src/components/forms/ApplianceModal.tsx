import { Ionicons } from "@expo/vector-icons";
import React, {
  useEffect,
  useRef,
  useState,
} from "react";

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
import SearchBox from "@/components/ui/SearchBox";

import { Colors } from "@/constants/colors";
import {
  Radius,
  Spacing,
  Typography,
} from "@/constants/theme";

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
  onCustomAdd?: (appliance: Appliance) => void;
  onCustomUpdate?: (
    appliance: Appliance,
  ) => void;
  onCustomDelete?: (id: string) => void;
  selectedAppliances?: Appliance[];
};

/*
 * Database area -> UI area
 */
const databaseToUiArea: Record<string, string> = {
  "Living Area": "Living Area",
  "Bedroom": "Bedroom",
  "Kitchen & Dining Area": "Kitchen Area",
  "Work & Study Area": "Work/Study Area",
  "Bathroom & Laundry Area": "Bathroom Area",
  "Porch & Yard": "Porch",
  "Custom Appliances": "Custom Appliances",
};

/*
 * UI area colors
 */
const areaColors: Record<string, string> = {
  "Living Area": Colors.light.primary,
  "Bedroom": "#9B59B6",
  "Kitchen Area": Colors.light.secondary,
  "Work/Study Area": "#4A90E2",
  "Bathroom Area": "#16A085",
  "Porch": "#E67E22",
  "Custom Appliances": Colors.light.primary,
};

const getAreaColor = (area: string) =>
  areaColors[area] ?? Colors.light.border;

export default function ApplianceModal({
  visible,
  onClose,
  selectedAppliances = [],
  onCustomAdd,
  onCustomUpdate,
  onCustomDelete,
  onSave,
}: ApplianceModalProps) {
  const [selected, setSelected] = useState<
    string[]
  >([]);

  const [appliances, setAppliances] = useState<
    Appliance[]
  >([]);

  const [searchText, setSearchText] =
    useState("");

  const [customVisible, setCustomVisible] =
    useState(false);

  const [customName, setCustomName] =
    useState("");

  const [customWatts, setCustomWatts] =
    useState("");

  const [customError, setCustomError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [editingCustom, setEditingCustom] =
    useState<Appliance | null>(null);

  const [isReset, setIsReset] =
    useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const customFormY = useRef(0);

  // ============================================================
  // LOAD APPLIANCES
  // ============================================================

  const loadAppliances = async () => {
    const { data, error } = await supabase
      .from("appliances")
      .select(
        "app_id, appliance_name, wattage, area, type, status",
      )
      .order("area")
      .order("appliance_name");

    if (error) {
      console.error(
        "Failed to load appliances:",
        error.message,
      );
      return;
    }

    setAppliances(
      (data ?? []).map((item) => ({
        id: String(item.app_id),
        name: String(item.appliance_name),
        watts: String(item.wattage),
        area: databaseToUiArea[item.area] ?? item.area,
      })),
    );
  };

  // ============================================================
  // MODAL STATE
  // ============================================================

  useEffect(() => {
    if (visible) {
      loadAppliances();

      setSelected(
        selectedAppliances.map(({ id }) => id),
      );

      setSearchText("");
      return;
    }

    setSelected([]);
    setSearchText("");
    setCustomVisible(false);
    setCustomName("");
    setCustomWatts("");
    setCustomError("");
    setSuccessMessage("");
    setEditingCustom(null);
    setIsReset(false);
  }, [visible, selectedAppliances]);

  // ============================================================
  // TOGGLE APPLIANCE
  // ============================================================

  const toggleAppliance = (id: string) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter(
          (item) => item !== id,
        )
        : [...current, id],
    );
  };

  // ============================================================
  // RESET SELECTION
  // ============================================================

  const handleReset = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setCustomError("You must be signed in.");
      return;
    }

    const { error } = await supabase
      .from("appliances")
      .update({ selection: false })
      .eq("user_id", user.id);

    if (error) {
      console.error(
        "Reset appliance selection error:",
        error.message,
      );

      setCustomError(
        "Unable to reset appliance selection.",
      );

      return;
    }

    setSelected([]);
    setCustomName("");
    setCustomWatts("");
    setCustomError("");
    setCustomVisible(false);
    setEditingCustom(null);
    setIsReset(true);
  };

  // ============================================================
  // SAVE APPLIANCE SELECTION
  // ============================================================

  const handleSave = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("No authenticated user.");
      return;
    }

    const { error: resetError } = await supabase
      .from("appliances")
      .update({ selection: false })
      .eq("user_id", user.id);

    if (resetError) {
      console.error(
        "Reset appliance selection error:",
        resetError.message,
      );

      return;
    }

    if (selected.length > 0) {
      const { error: selectionError } =
        await supabase
          .from("appliances")
          .update({ selection: true })
          .eq("user_id", user.id)
          .in("app_id", selected);

      if (selectionError) {
        console.error(
          "Update appliance selection error:",
          selectionError.message,
        );

        return;
      }
    }

    const selectedItems = appliances.filter(
      (item) => selected.includes(item.id),
    );

    onSave?.(selectedItems);
    onClose();
  };

  // ============================================================
  // CANCEL CUSTOM FORM
  // ============================================================

  const handleCustomCancel = () => {
    setCustomName("");
    setCustomWatts("");
    setCustomError("");
    setEditingCustom(null);
    setCustomVisible(false);
  };

  // ============================================================
  // ADD CUSTOM APPLIANCE
  // ============================================================

  const handleCustomAdd = async () => {
    const name = customName.trim();
    const watts = customWatts.trim();

    if (
      !/^[A-Za-z][A-Za-z0-9 /&.'-]{2,49}$/.test(
        name,
      )
    ) {
      setCustomError(
        "Appliance name must be valid and readable.",
      );
      return;
    }

    if (!/^\d+-\d+$/.test(watts)) {
      setCustomError(
        "Enter valid wattage intervals, for example 15-25.",
      );
      return;
    }

    const [minWatts, maxWatts] = watts
      .split("-")
      .map(Number);

    if (
      minWatts < 1 ||
      maxWatts < 1 ||
      minWatts > 720 ||
      maxWatts > 720
    ) {
      setCustomError(
        "Appliance wattage must not exceed 720W.",
      );
      return;
    }

    if (minWatts > maxWatts) {
      setCustomError(
        "Enter a valid wattage interval.",
      );
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setCustomError(
        "You must be signed in to add an appliance.",
      );
      return;
    }

    const {
      data: duplicate,
      error: duplicateError,
    } = await supabase
      .from("appliances")
      .select("app_id")
      .eq("user_id", user.id)
      .eq("type", "custom")
      .ilike("appliance_name", name)
      .maybeSingle();

    if (duplicateError) {
      console.error(
        "Duplicate appliance check error:",
        duplicateError.message,
      );

      setCustomError(
        "Unable to check appliance name.",
      );

      return;
    }

    if (duplicate) {
      setCustomError(
        "This appliance already exists.",
      );
      return;
    }

    const { data, error } = await supabase
      .from("appliances")
      .insert({
        user_id: user.id,
        appliance_name: name,
        wattage: `${watts}W`,
        area: "Custom Appliances",
        type: "custom",
        selection: false,
        status: true,
      })
      .select(
        "app_id, appliance_name, wattage, area",
      )
      .single();

    if (error) {
      console.error(
        "Custom appliance error:",
        error.message,
      );

      setCustomError(
        "Unable to add appliance. Please try again.",
      );

      return;
    }

    const appliance: Appliance = {
      id: data.app_id,
      name: data.appliance_name,
      watts: data.wattage,
      area: "Custom Appliances",
    };

    onCustomAdd?.(appliance);

    setAppliances((current) => [
      ...current,
      appliance,
    ]);

    setCustomName("");
    setCustomWatts("");
    setCustomError("");
    setCustomVisible(false);

    setSuccessMessage(
      `${name} successfully added!`,
    );

    setTimeout(() => {
      setSuccessMessage("");
    }, 5000);
  };

  // ============================================================
  // UPDATE CUSTOM APPLIANCE
  // ============================================================

  const handleCustomUpdate = async () => {
    if (!editingCustom) return;

    const name = customName.trim();
    const watts = customWatts.trim();

    if (
      !/^[A-Za-z][A-Za-z0-9 /&.'-]{2,49}$/.test(
        name,
      )
    ) {
      setCustomError(
        "Enter a valid appliance name.",
      );
      return;
    }

    if (!/^\d+-\d+$/.test(watts)) {
      setCustomError(
        "Enter wattage like 15-25.",
      );
      return;
    }

    const [minWatts, maxWatts] = watts
      .split("-")
      .map(Number);

    if (
      minWatts < 1 ||
      maxWatts < 1 ||
      minWatts > 720 ||
      maxWatts > 720 ||
      minWatts > maxWatts
    ) {
      setCustomError(
        "Enter a valid wattage interval up to 720W.",
      );
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setCustomError(
        "You must be signed in to update an appliance.",
      );
      return;
    }

    const {
      data: duplicate,
      error: duplicateError,
    } = await supabase
      .from("appliances")
      .select("app_id")
      .eq("user_id", user.id)
      .eq("type", "custom")
      .ilike("appliance_name", name)
      .neq("app_id", editingCustom.id)
      .maybeSingle();

    if (duplicateError) {
      console.error(
        "Duplicate appliance check error:",
        duplicateError.message,
      );

      setCustomError(
        "Unable to check appliance name.",
      );

      return;
    }

    if (duplicate) {
      setCustomError(
        "This appliance already exists.",
      );
      return;
    }

    const { data, error } = await supabase
      .from("appliances")
      .update({
        appliance_name: name,
        wattage: `${watts}W`,
      })
      .eq("app_id", editingCustom.id)
      .eq("user_id", user.id)
      .eq("type", "custom")
      .select(
        "app_id, appliance_name, wattage, area",
      )
      .single();

    if (error) {
      console.error(
        "Custom appliance update error:",
        error.message,
      );

      setCustomError(
        "Unable to update appliance. Please try again.",
      );

      return;
    }

    const updated: Appliance = {
      id: data.app_id,
      name: data.appliance_name,
      watts: data.wattage,
      area: "Custom Appliances",
    };

    setAppliances((current) =>
      current.map((item) =>
        item.id === updated.id
          ? updated
          : item,
      ),
    );

    onCustomUpdate?.(updated);

    setEditingCustom(null);
    setCustomName("");
    setCustomWatts("");
    setCustomError("");
    setCustomVisible(false);

    setSuccessMessage(
      `${name} successfully updated!`,
    );

    setTimeout(() => {
      setSuccessMessage("");
    }, 5000);
  };

  // ============================================================
  // DELETE CUSTOM APPLIANCE
  // ============================================================

  const handleCustomDelete = async (
    id: string,
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setCustomError(
        "You must be signed in to delete an appliance.",
      );
      return;
    }

    const { error } = await supabase
      .from("appliances")
      .delete()
      .eq("app_id", id)
      .eq("user_id", user.id)
      .eq("type", "custom");

    if (error) {
      console.error(
        "Custom appliance delete error:",
        error.message,
      );

      setCustomError(
        "Unable to delete appliance. Please try again.",
      );

      return;
    }

    setAppliances((current) =>
      current.filter((item) => item.id !== id),
    );

    setSelected((current) =>
      current.filter((item) => item !== id),
    );

    onCustomDelete?.(id);
  };

  // ============================================================
  // OPEN CUSTOM EDITOR
  // ============================================================

  const openCustomEditor = (
    appliance: Appliance,
  ) => {
    setEditingCustom(appliance);
    setCustomName(appliance.name);

    setCustomWatts(
      appliance.watts.replace(/W$/, ""),
    );

    setCustomError("");
    setCustomVisible(true);

    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(
          customFormY.current - 20,
          0,
        ),
        animated: true,
      });
    });
  };

  // ============================================================
  // AREA SECTIONS
  // ============================================================

  const sections = [
    "Living Area",
    "Bedroom",
    "Kitchen Area",
    "Work/Study Area",
    "Bathroom Area",
    "Porch",
  ];

  // ============================================================
  // SEARCH FILTER
  // ============================================================

  const normalizedSearch = searchText
    .trim()
    .toLowerCase();

  const filteredAppliances =
    appliances.filter(
      (appliance) =>
        !normalizedSearch ||
        appliance.name
          .toLowerCase()
          .includes(normalizedSearch),
    );

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
            <AppText
              variant="heading"
              style={styles.title}
            >
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
            ref={scrollRef}
            style={styles.content}
            contentContainerStyle={
              styles.contentContainer
            }
            showsVerticalScrollIndicator
          >
            <AppText
              variant="caption"
              style={styles.subtitle}
            >
              Select the appliances you want to use with
              your AdlaWatt system.
            </AppText>

            {/* Battery Advisory */}
            <View style={styles.advisory}>
              <Ionicons
                name="battery-half-outline"
                size={22}
                color={Colors.light.primary}
              />

              <View style={styles.advisoryText}>
                <AppText
                  variant="body"
                  style={styles.advisoryTitle}
                >
                  Battery Capacity: 720 Wh
                </AppText>

                <AppText
                  variant="caption"
                  style={
                    styles.advisoryDescription
                  }
                >
                  Keep your selected appliances within the
                  available energy capacity.
                </AppText>
              </View>
            </View>

            {/* Search */}
            <SearchBox
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search appliances..."
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Search appliances"
            />

            {/* Custom Appliance */}
            <View style={styles.customSection}>
              <AppText
                variant="body"
                style={styles.sectionTitle}
              >
                Custom Appliance
              </AppText>

              <Pressable
                onPress={() => {
                  if (customVisible) {
                    handleCustomCancel();
                    return;
                  }

                  setEditingCustom(null);
                  setCustomName("");
                  setCustomWatts("");
                  setCustomError("");
                  setCustomVisible(true);
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

            {/* Custom Form */}
            {customVisible && (
              <View
                style={styles.customForm}
                onLayout={(event) => {
                  customFormY.current =
                    event.nativeEvent.layout.y;
                }}
              >
                <AppText
                  variant="caption"
                  style={styles.infoNote}
                >
                  Check the appliance wattage first, for
                  example, soldering wire may use 15-25W.
                </AppText>

                <TextInput
                  value={customName}
                  onChangeText={(text) => {
                    setCustomName(text);
                    setCustomError("");
                  }}
                  placeholder="Enter valid appliance name"
                  placeholderTextColor={
                    Colors.light.textSecondary
                  }
                  style={styles.input}
                />

                <TextInput
                  value={customWatts}
                  onChangeText={(text) => {
                    const value = text.replace(
                      /[^\d-]/g,
                      "",
                    );

                    setCustomWatts(value);
                    setCustomError("");
                  }}
                  placeholder="Enter wattage like 15-20"
                  placeholderTextColor={
                    Colors.light.textSecondary
                  }
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
                    onPress={
                      editingCustom
                        ? handleCustomUpdate
                        : handleCustomAdd
                    }
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
                      {editingCustom ? "Save" : "Add"}
                    </AppText>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Success Message */}
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
            {filteredAppliances.some(
              (item) =>
                item.area ===
                "Custom Appliances",
            ) && (
                <View style={styles.section}>
                  <AppText
                    variant="body"
                    style={styles.sectionTitle}
                  >
                    Custom Appliances
                  </AppText>

                  <View style={styles.grid}>
                    {filteredAppliances
                      .filter(
                        (item) =>
                          item.area ===
                          "Custom Appliances",
                      )
                      .map((appliance) => {
                        const isSelected =
                          selected.includes(
                            appliance.id,
                          );

                        return (
                          <ApplianceBox
                            key={appliance.id}
                            name={appliance.name}
                            wattage={appliance.watts}
                            color={
                              Colors.light.primary
                            }
                            selected={isSelected}
                            isCustom
                            onPress={() =>
                              toggleAppliance(
                                appliance.id,
                              )
                            }
                            onEdit={() =>
                              openCustomEditor(
                                appliance,
                              )
                            }
                            onDelete={() =>
                              handleCustomDelete(
                                appliance.id,
                              )
                            }
                          />
                        );
                      })}
                  </View>
                </View>
              )}

            {/* Appliance Categories */}
            {sections.map((section) => {
              const items =
                filteredAppliances.filter(
                  (item) =>
                    item.area === section,
                );

              if (items.length === 0) {
                return null;
              }

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
                        selected.includes(
                          appliance.id,
                        );

                      return (
                        <ApplianceBox
                          key={appliance.id}
                          name={appliance.name}
                          wattage={appliance.watts}
                          color={getAreaColor(
                            appliance.area,
                          )}
                          selected={isSelected}
                          onPress={() =>
                            toggleAppliance(
                              appliance.id,
                            )
                          }
                        />
                      );
                    })}
                  </View>
                </View>
              );
            })}

            {/* No Search Results */}
            {normalizedSearch &&
              filteredAppliances.length === 0 && (
                <View style={styles.noResults}>
                  <Ionicons
                    name="search-outline"
                    size={28}
                    color={
                      Colors.light.textSecondary
                    }
                  />

                  <AppText
                    variant="caption"
                    style={styles.noResultsText}
                  >
                    {`No appliances found for "${searchText.trim()}"`}
                  </AppText>
                </View>
              )}
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
                {selected.length !== 1
                  ? "s"
                  : ""}{" "}
                selected
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
                  {isReset ? "Save" : "Add"}
                </AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
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

  noResults: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 35,
    gap: 8,
  },

  noResultsText: {
    color: Colors.light.textSecondary,
    textAlign: "center",
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
    marginBottom: Spacing.md,
  },

  successText: {
    flex: 1,
    color: Colors.light.primary,
    fontWeight: "600",
  },
});