import React, { ReactNode } from "react";
import {
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

import NavBarBottom from "@/components/layout/navbarBottom";
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

      {/* Bottom nav sits in normal flow so it never overlaps
          the scrollable content above it. */}
      <NavBarBottom />
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