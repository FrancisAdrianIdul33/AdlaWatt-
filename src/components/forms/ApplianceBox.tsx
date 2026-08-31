import React, { useState } from "react";

import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import AppText from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";
import { Radius } from "@/constants/theme";

type ApplianceBoxProps = {
  name: string;
  wattage: string;
  color: string;
  imageSource?: ImageSourcePropType;
  selected?: boolean;

  // Main appliance selection
  onPress?: () => void;

  // Custom appliance controls
  isCustom?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

const defaultImage = require("@/assets/images/developers/avatar.jpg");

export default function ApplianceBox({
  name,
  wattage,
  color,
  imageSource = defaultImage,
  selected = false,
  onPress,
  isCustom = false,
  onEdit,
  onDelete,
}: ApplianceBoxProps) {
  const [deleteMode, setDeleteMode] = useState(false);

  const handleDeleteConfirm = () => {
    setDeleteMode(false);
    onDelete?.();
  };

  const handleDeleteCancel = () => {
    setDeleteMode(false);
  };

  return (
    <Pressable
      onPress={deleteMode ? undefined : onPress}
      disabled={deleteMode || !onPress}
      style={({ pressed }) => [
        styles.container,
        {
          borderColor: color,
        },
        pressed && !deleteMode && styles.pressed,
      ]}
    >
      {/* ===================================================== */}
      {/* DELETE CONFIRMATION */}
      {/* Only shown for custom appliances */}
      {/* ===================================================== */}

      {deleteMode && isCustom ? (
        <View style={styles.deleteConfirmation}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={38}
            color="#EF4444"
          />

          <AppText
            variant="caption"
            style={styles.deleteQuestion}
          >
            You want to delete this?
          </AppText>

          <View style={styles.confirmActions}>
            {/* NO */}

            <Pressable
              onPress={handleDeleteCancel}
              style={({ pressed }) => [
                styles.confirmButton,
                styles.noButton,
                pressed && styles.actionPressed,
              ]}
            >
              <AppText
                variant="caption"
                style={styles.noButtonText}
              >
                No
              </AppText>
            </Pressable>

            {/* YES */}

            <Pressable
              onPress={handleDeleteConfirm}
              style={({ pressed }) => [
                styles.confirmButton,
                styles.yesButton,
                pressed && styles.actionPressed,
              ]}
            >
              <AppText
                variant="caption"
                style={styles.yesButtonText}
              >
                Yes
              </AppText>
            </Pressable>
          </View>
        </View>
      ) : (
        <>
          {/* ================================================= */}
          {/* SELECTION CIRCLE */}
          {/* ================================================= */}

          <View
            style={[
              styles.selectionCircle,
              {
                borderColor: color,
                backgroundColor: selected
                  ? color
                  : Colors.light.surface,
              },
            ]}
          >
            {selected && (
              <MaterialCommunityIcons
                name="check"
                size={18}
                color="#FFFFFF"
              />
            )}
          </View>

          {/* ================================================= */}
          {/* APPLIANCE IMAGE */}
          {/* ================================================= */}

          <View
            style={[
              styles.imageContainer,
              {
                borderColor: color,
              },
            ]}
          >
            <Image
              source={imageSource}
              style={styles.image}
              resizeMode="cover"
            />
          </View>

          {/* ================================================= */}
          {/* APPLIANCE NAME */}
          {/* ================================================= */}

          <AppText
            variant="caption"
            style={styles.name}
            numberOfLines={2}
          >
            {name}
          </AppText>

          {/* ================================================= */}
          {/* WATTAGE */}
          {/* ================================================= */}

          <AppText
            variant="caption"
            style={styles.wattage}
          >
            {wattage}
          </AppText>

          {/* ================================================= */}
          {/* CUSTOM APPLIANCE ACTIONS */}
          {/* Only visible if isCustom = true */}
          {/* ================================================= */}

          {isCustom && (
            <View style={styles.customActions}>
              {/* DELETE */}

              <Pressable
                onPress={() => setDeleteMode(true)}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.iconButton,
                  styles.deleteButton,
                  pressed && styles.actionPressed,
                ]}
              >
                <MaterialCommunityIcons
                  name="delete"
                  size={22}
                  color="#EF4444"
                />
              </Pressable>

              {/* EDIT */}

              <Pressable
                onPress={onEdit}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.iconButton,
                  styles.editButton,
                  pressed && styles.actionPressed,
                ]}
              >
                <MaterialCommunityIcons
                  name="pencil"
                  size={22}
                  color={Colors.light.primary}
                />
              </Pressable>
            </View>
          )}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "48%",
    backgroundColor: "#F0EAD6",
    borderWidth: 2,
    borderRadius: Radius.md,
    padding: 14,
    paddingTop: 14,
    alignItems: "center",
    position: "relative",
    minHeight: 280,
  },

  selectionCircle: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,

    width: 28,
    height: 28,

    borderWidth: 2,
    borderRadius: 14,

    alignItems: "center",
    justifyContent: "center",
  },

  imageContainer: {
    width: "100%",
    aspectRatio: 1,

    backgroundColor: "#dfdfdf",

    borderWidth: 2,
    borderRadius: Radius.md,

    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  name: {
    width: "100%",
    color: "#000000",
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 22,
    textAlign: "center",
    marginTop: 12,
  },

  wattage: {
    width: "100%",
    color: Colors.light.textSecondary,
    fontSize: 16,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 3,

    // Space between wattage and icons
    marginBottom: 14,
  },

  /* ======================================================= */
  /* CUSTOM ACTION BUTTONS */
  /* ======================================================= */

  customActions: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto",
    paddingHorizontal: 4,
  },

  iconButton: {
    width: 40,
    height: 40,

    borderRadius: 20,

    alignItems: "center",
    justifyContent: "center",
  },

  deleteButton: {
    backgroundColor: "transparent",
  },

  editButton: {
    backgroundColor: "transparent",
  },

  /* ======================================================= */
  /* DELETE CONFIRMATION */
  /* ======================================================= */

  deleteConfirmation: {
    flex: 1,
    width: "100%",
    minHeight: 240,

    alignItems: "center",
    justifyContent: "center",
  },

  deleteQuestion: {
    color: "#000000",
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 14,
  },

  confirmActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },

  confirmButton: {
    minWidth: 75,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: Radius.md,

    alignItems: "center",
    justifyContent: "center",
  },

  noButton: {
    backgroundColor: "#E5E7EB",
  },

  yesButton: {
    backgroundColor: "#EF4444",
  },

  noButtonText: {
    color: "#000000",
    fontWeight: "600",
  },

  yesButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  /* ======================================================= */
  /* PRESS STATES */
  /* ======================================================= */

  pressed: {
    opacity: 0.7,
  },

  actionPressed: {
    opacity: 0.65,
  },
});