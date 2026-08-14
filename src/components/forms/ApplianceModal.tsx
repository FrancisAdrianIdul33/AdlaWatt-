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

import AppText from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";
import { Radius, Spacing, Typography } from "@/constants/theme";

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
};

const appliances: Appliance[] = [
  // Living Area
  { id: "1", name: "Stand Fan / Desk Fan", watts: "35–75W", area: "Living Area" },
  { id: "2", name: '32" to 43" LED Smart TV', watts: "30–80W", area: "Living Area" },
  { id: "3", name: "Wi-Fi Router / Fiber Modem", watts: "10–20W", area: "Living Area" },
  { id: "4", name: "Digital TV Box", watts: "5–15W", area: "Living Area" },
  { id: "5", name: "Portable Bluetooth Speaker / Mini Soundbar", watts: "10–50W", area: "Living Area" },
  { id: "6", name: "LED Bulb / Ceiling Light", watts: "7–15W", area: "Living Area" },

  // Bedroom
  { id: "7", name: "Wall Fan / Clip Fan", watts: "25–50W", area: "Bedroom" },
  { id: "8", name: "Smartphone Fast Charger", watts: "10–33W", area: "Bedroom" },
  { id: "9", name: "Tablet Charger", watts: "10–20W", area: "Bedroom" },
  { id: "10", name: "Rechargeable Emergency Light / Flashlight", watts: "5–15W", area: "Bedroom" },
  { id: "11", name: "Electric Mosquito Swatter / Insect Trap", watts: "2–5W", area: "Bedroom" },
  { id: "12", name: "LED Night Light", watts: "3–9W", area: "Bedroom" },

  // Kitchen & Dining
  { id: "13", name: "Small Inverter Refrigerator", watts: "60–120W", area: "Kitchen & Dining Area" },
  { id: "14", name: "Small Rice Cooker", watts: "300–500W", area: "Kitchen & Dining Area" },
  { id: "15", name: "Tabletop Water Dispenser", watts: "50–80W", area: "Kitchen & Dining Area" },
  { id: "16", name: "Basic Kitchen Blender", watts: "200–350W", area: "Kitchen & Dining Area" },
  { id: "17", name: "Mini Electric Multi-Cooker / Pot", watts: "300–500W", area: "Kitchen & Dining Area" },
  { id: "18", name: "Exhaust Fan", watts: "20–45W", area: "Kitchen & Dining Area" },
  { id: "19", name: "LED Light Bulb", watts: "9–18W", area: "Kitchen & Dining Area" },

  // Work & Study
  { id: "20", name: "Laptop Power Adapter", watts: "45–65W", area: "Work & Study Area" },
  { id: "21", name: "Mini USB / Desk Fan", watts: "5–20W", area: "Work & Study Area" },
  { id: "22", name: "LED Study Desk Lamp", watts: "5–12W", area: "Work & Study Area" },
  { id: "23", name: "Basic Inkjet Printer", watts: "10–30W", area: "Work & Study Area" },

  // Bathroom & Laundry
  { id: "24", name: "Twin-Tub / Single-Tub Washing Machine", watts: "150–350W", area: "Bathroom & Laundry Area" },
  { id: "25", name: "Rechargeable Hair Clipper / Trimmer", watts: "5–10W", area: "Bathroom & Laundry Area" },
  { id: "26", name: "Bathroom LED Bulb", watts: "5–12W", area: "Bathroom & Laundry Area" },
  { id: "27", name: "Small Exhaust Fan", watts: "15–30W", area: "Bathroom & Laundry Area" },

  // Porch & Yard
  { id: "28", name: "Outdoor Porch LED Bulb", watts: "10–20W", area: "Porch & Yard" },
  { id: "29", name: "Home CCTV Camera System", watts: "5–12W", area: "Porch & Yard" },
];

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
}: ApplianceModalProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [customVisible, setCustomVisible] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customWatts, setCustomWatts] = useState("");

  useEffect(() => {
    if (!visible) {
      setSelected([]);
      setCustomVisible(false);
      setCustomName("");
      setCustomWatts("");
    }
  }, [visible]);

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
    setCustomVisible(false);
  };

  const handleSave = () => {
    const selectedAppliances = appliances.filter((item) =>
      selected.includes(item.id),
    );

    if (customName.trim() && customWatts.trim()) {
      selectedAppliances.push({
        id: `custom-${Date.now()}`,
        name: customName.trim(),
        watts: customWatts.trim(),
        area: "Other",
      });
    }

    onSave?.(selectedAppliances);
    onClose();
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
                onPress={() => setCustomVisible((value) => !value)}
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

              {customVisible && (
                <View style={styles.customForm}>
                  <TextInput
                    value={customName}
                    onChangeText={setCustomName}
                    placeholder="Appliance name"
                    placeholderTextColor={Colors.light.textSecondary}
                    style={styles.input}
                  />

                  <TextInput
                    value={customWatts}
                    onChangeText={setCustomWatts}
                    placeholder="Wattage, e.g. 20–50W"
                    placeholderTextColor={Colors.light.textSecondary}
                    style={styles.input}
                  />
                </View>
              )}
            </View>

            {/* Appliance Categories */}
            {sections.map((section) => {
              const items = appliances.filter(
                (item) => item.area === section,
              );

              return (
                <View key={section} style={styles.section}>
                  <AppText variant="body" style={styles.sectionTitle}>
                    {section}
                  </AppText>

                  <View style={styles.grid}>
                    {items.map((appliance) => {
                      const isSelected = selected.includes(appliance.id);
                      const color = getAreaColor(appliance.area);

                      return (
                        <Pressable
                          key={appliance.id}
                          onPress={() =>
                            toggleAppliance(appliance.id)
                          }
                          style={({ pressed }) => [
                            styles.item,
                            {
                              borderColor: color,
                              backgroundColor: isSelected
                                ? "rgba(0, 168, 107, 0.08)"
                                : Colors.glass.white,
                            },
                            pressed && styles.pressed,
                          ]}
                        >
                          <View
                            style={[
                              styles.iconContainer,
                              { borderColor: color },
                            ]}
                          >
                            <Ionicons
                              name="flash-outline"
                              size={21}
                              color={color}
                            />
                          </View>

                          <AppText
                            variant="caption"
                            style={styles.name}
                          >
                            {appliance.name}
                          </AppText>

                          <AppText
                            variant="caption"
                            style={styles.watts}
                          >
                            {appliance.watts}
                          </AppText>

                          <View
                            style={[
                              styles.check,
                              {
                                backgroundColor: isSelected
                                  ? Colors.light.primary
                                  : Colors.light.border,
                              },
                            ]}
                          >
                            <Ionicons
                              name={
                                isSelected
                                  ? "checkmark"
                                  : "ellipse-outline"
                              }
                              size={12}
                              color={
                                isSelected
                                  ? "#FFFFFF"
                                  : Colors.light.textSecondary
                              }
                            />
                          </View>
                        </Pressable>
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

              <AppText variant="caption" style={styles.selectedText}>
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
                <AppText variant="caption" style={styles.resetText}>
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
                <AppText variant="caption" style={styles.actionText}>
                  Add
                </AppText>
              </Pressable>

              <Pressable
                onPress={handleSave}
                style={({ pressed }) => [
                  styles.actionButton,
                  pressed && styles.pressed,
                ]}
              >
                <AppText variant="caption" style={styles.actionText}>
                  Update
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
    fontSize: 14,
  },

  advisoryDescription: {
    color: Colors.light.textSecondary,
    lineHeight: 18,
    marginTop: 3,
    fontSize: 11,
  },

  customSection: {
    marginBottom: Spacing.lg,
  },

  section: {
    marginBottom: Spacing.lg,
  },

  sectionTitle: {
    color: "#000000",
    fontWeight: "700",
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
    fontSize: 12,
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
    fontSize: 13,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },

  item: {
    width: "48%",
    minHeight: 145,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderRadius: 14,
    padding: 10,
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderWidth: 2,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },

  name: {
    color: "#000000",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 11,
    lineHeight: 15,
  },

  watts: {
    color: Colors.light.textSecondary,
    fontSize: 10,
    marginTop: 3,
  },

  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 7,
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
    fontSize: 11,
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
    fontSize: 12,
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
    fontSize: 12,
  },

  pressed: {
    opacity: 0.7,
  },
});