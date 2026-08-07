import React, { ReactNode } from "react";
import {
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

import { Colors } from "@/constants/colors";

interface ScreenContainer2Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function ScreenContainer2({
  children,
  style,
}: ScreenContainer2Props) {
  return (
    <View style={styles.container}>
      <View style={[styles.content, style]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },

  content: {
    flex: 1,
    width: "100%",
  },
});