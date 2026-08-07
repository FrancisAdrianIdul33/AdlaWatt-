import React from "react";
import {
    Image,
    ImageStyle,
    StyleSheet,
    View,
} from "react-native";

interface AppLogoProps {
  width?: number;
  height?: number;
  style?: ImageStyle;
}

export default function AppLogo({
  width = 220,
  height = 220,
  style,
}: AppLogoProps) {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../../assets/images/adlawatt-logo.png")}
        resizeMode="contain"
        style={[
          {
            width,
            height,
          },
          style,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
});