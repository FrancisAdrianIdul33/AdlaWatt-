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
  imageSource?: ImageSourcePropType;
};

const defaultImage = require("@/assets/images/components/toph.jpg");

export default function ComponentStatusBox({
  name,
  status,
  imageSource = defaultImage,
}: ComponentStatusBoxProps) {
  const isActive =
    status === "Active" || status === "Connected";

  const statusColor = isActive
    ? Colors.light.primary
    : "#EF4444";

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: statusColor,
        },
      ]}
    >
      {/* Component Image */}
      <View
        style={[
          styles.imageContainer,
          {
            borderColor: statusColor,
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
            color: statusColor,
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
    backgroundColor: Colors.glass.white,
    borderWidth: 2,
    borderRadius: Radius.md,
    padding: 14,
    paddingTop: 14,
    alignItems: "center",
    position: "relative",
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