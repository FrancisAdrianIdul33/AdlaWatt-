import React from "react";

import {
    Modal,
    Pressable,
    StyleSheet,
    View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import AppText from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";

interface ModalBoxProps<T extends string> {
  visible: boolean;
  title: string;
  options: readonly T[];
  selectedValue: T;
  onSelect: (option: T) => void;
  onClose: () => void;
}

export default function ModalBox<T extends string>({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}: ModalBoxProps<T>) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={
          styles.modalOverlay
        }
        onPress={onClose}
      >
        <Pressable
          style={
            styles.modalCard
          }
          onPress={() => {}}
        >
          <View
            style={
              styles.modalHeader
            }
          >
            <AppText
              variant="body"
              style={
                styles.modalTitle
              }
            >
              {title}
            </AppText>

            <Pressable
              onPress={onClose}
            >
              <Ionicons
                name="close-outline"
                size={22}
                color={Colors.light.text}
              />
            </Pressable>
          </View>

          {options.map(
            (option) => (
              <Pressable
                key={option}
                style={[
                  styles.modalOption,
                  selectedValue ===
                    option &&
                    styles.selectedModalOption,
                ]}
                onPress={() =>
                  onSelect(option)
                }
              >
                <Ionicons
                  name={
                    selectedValue ===
                      option
                      ? "radio-button-on-outline"
                      : "radio-button-off-outline"
                  }
                  size={18}
                  color={
                    Colors.light.primary
                  }
                />

                <AppText
                  variant="caption"
                  style={[
                    styles.modalOptionText,
                    selectedValue ===
                      option &&
                      styles.selectedModalOptionText,
                  ]}
                >
                  {option}
                </AppText>
              </Pressable>
            ),
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ============================================================
   STYLES
   ============================================================ */

const styles = StyleSheet.create({
  /* ========================================================
     MODALS
  ======================================================== */

  modalOverlay: {
    flex: 1,
    backgroundColor:
      "rgba(0, 0, 0, 0.40)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor:
      Colors.light.surface,
    borderRadius: 18,
    padding: 17,
  },

  modalHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    marginBottom: 8,
  },

  modalTitle: {
    color: Colors.light.text,
    fontWeight: "700",
    fontSize: 17,
  },

  modalOption: {
    width: "100%",
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
  },

  selectedModalOption: {
    backgroundColor:
      "rgba(0, 168, 107, 0.08)",
  },

  modalOptionText: {
    color: Colors.light.text,
  },

  selectedModalOptionText: {
    fontWeight: "700",
    color:
      Colors.light.primary,
  },
});