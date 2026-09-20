import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  ImageSourcePropType,
  View,
} from "react-native";

import {
  applianceCardStyles,
} from "@/components/forms/applianceCard";
import AppText from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";

type ApplianceStatusBoxProps = {
  name: string;
  wattage: string;
  color: string;
  status: "OK to use" | "Not advised";
  imageSource?: ImageSourcePropType;
};

const defaultImage = require("@/assets/images/adlawatt-icon.png");

export default function ApplianceStatusBox({
  name,
  wattage,
  color,
  status,
  imageSource = defaultImage,
}: ApplianceStatusBoxProps) {
  const isOkay = status === "OK to use";

  return (
    <View
      style={[
        applianceCardStyles.box,
        { borderColor: color },
      ]}
    >
      {/* Appliance Image */}
      <View
        style={[
          applianceCardStyles.imageContainer,
          { borderColor: color },
        ]}
      >
        <Image
          source={imageSource}
          style={applianceCardStyles.image}
          resizeMode="cover"
        />
      </View>

      {/* Appliance Name */}
      <AppText
        variant="caption"
        style={applianceCardStyles.name}
        numberOfLines={2}
      >
        {name}
      </AppText>

      {/* Wattage */}
      <AppText
        variant="caption"
        style={applianceCardStyles.watts}
      >
        {wattage}
      </AppText>

      {/* Status */}
      <View
        style={[
          applianceCardStyles.status,
          {
            backgroundColor: isOkay
              ? Colors.light.primary
              : "#EF4444",
          },
        ]}
      >
        <Ionicons
          name={isOkay ? "checkmark" : "close"}
          size={13}
          color="#FFFFFF"
        />

        <AppText
          variant="caption"
          style={applianceCardStyles.statusText}
        >
          {status}
        </AppText>
      </View>
    </View>
  );
}