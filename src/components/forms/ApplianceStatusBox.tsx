import { Ionicons } from "@expo/vector-icons";
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

type ApplianceStatusBoxProps = {
  name: string;
  wattage: string;
  color: string;
  status: "OK to use" | "Not advised";
  imageSource?: ImageSourcePropType;
};

const defaultImage = require("@/assets/images/developers/avatar.jpg");

export default function ApplianceStatusBox({
  name,
  wattage,
  color,
  status,
  imageSource = defaultImage,
}: ApplianceStatusBoxProps) {
  const isOkay = status === "OK to use";

  return (
    <View style={[styles.container, { borderColor: color }]}>
      {/* Appliance Image */}
      <View style={[styles.imageContainer, { borderColor: color }]}>
        <Image
          source={imageSource}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      {/* Appliance Name */}
      <AppText
        variant="caption"
        style={styles.name}
        numberOfLines={2}
      >
        {name}
      </AppText>

      {/* Wattage */}
      <AppText variant="caption" style={styles.wattage}>
        {wattage}
      </AppText>

      {/* Status */}
      <View
        style={[
          styles.status,
          {
            backgroundColor: isOkay ? Colors.light.primary : "#EF4444",
          },
        ]}
      >
        <Ionicons
          name={isOkay ? "checkmark" : "close"}
          size={13}
          color="#FFFFFF"
        />

        <AppText variant="caption" style={styles.statusText}>
          {status}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "48%",
    backgroundColor: "#e6e3e3",
    borderWidth: 2,
    borderRadius: Radius.md,
    padding: 14,
    alignItems: "center",
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
  },

  status: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginTop: 8,
  },

  statusText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
});