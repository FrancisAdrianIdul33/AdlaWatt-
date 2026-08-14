import React from "react";
import {
    Image,
    ImageSourcePropType,
    Pressable,
    StyleSheet,
    View,
} from "react-native";

import AppText from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";
import { Radius } from "@/constants/theme";

type ApplianceBoxProps = {
  name: string;
  wattage: string;
  color: string;
  imageSource?: ImageSourcePropType;
  selected?: boolean;
  onPress?: () => void;
};

const defaultImage = require("@/assets/images/developers/avatar.jpg");

export default function ApplianceBox({
  name,
  wattage,
  color,
  imageSource = defaultImage,
  selected = false,
  onPress,
}: ApplianceBoxProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.container,
        {
          borderColor: color,
        },
        pressed && styles.pressed,
      ]}
    >
      {/* Selection Circle */}
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
      />

      {/* Appliance Image */}
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

      {/* Appliance Name */}
      <AppText
        variant="caption"
        style={styles.name}
        numberOfLines={2}
      >
        {name}
      </AppText>

      {/* Wattage */}
      <AppText
        variant="caption"
        style={styles.wattage}
      >
        {wattage}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "48%",
    backgroundColor: "#e6e3e3",
    borderWidth: 2,
    borderRadius: Radius.md,
    padding: 14,
    paddingTop: 14,
    alignItems: "center",
    position: "relative",
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
    marginBottom: 2,
  },

  pressed: {
    opacity: 0.7,
  },
});