import React from "react";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  View,
} from "react-native";

import AppText from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";
import { Radius } from "@/constants/theme";

type ComponentStatus =
  | "Active"
  | "Inactive"
  | "Connected"
  | "Not Connected";

type ComponentStatusBoxProps = {
  name: string;
  status: ComponentStatus;
  color: string;
  imageSource?: ImageSourcePropType;
};

const defaultImage = require("@/assets/images/components/toph.jpg");

export default function ComponentStatusBox({
  name,
  status,
  color,
  imageSource = defaultImage,
}: ComponentStatusBoxProps) {
  const isActive =
    status === "Active" || status === "Connected";

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: color,
        },
      ]}
    >
      {/* Status Indicator */}
      <View
        style={[
          styles.statusCircle,
          {
            borderColor: color,
            backgroundColor: isActive
              ? color
              : Colors.light.surface,
          },
        ]}
      />

      {/* Component Image */}
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

      {/* Component Name */}
      <AppText
        variant="caption"
        style={styles.name}
        numberOfLines={2}
      >
        {name}
      </AppText>

      {/* Component Status */}
      <AppText
        variant="caption"
        style={[
          styles.status,
          {
            color: isActive
              ? Colors.light.primary
              : "#EF4444",
          },
        ]}
      >
        {status}
      </AppText>
    </View>
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
  },

  statusCircle: {
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

  status: {
    width: "100%",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 20,
    textAlign: "center",
    marginTop: 3,
    marginBottom: 2,
  },
});