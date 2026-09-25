import React, { ReactNode } from "react";
import { StyleSheet, Text, TextProps } from "react-native";

import { Colors } from "@/constants/colors";
import { useSettings } from "@/context/SettingsContext";
import {
  getFontFamilyName,
  getFontScale,
  getFontWeightStyle,
} from "@/services/typography";

type Variant =
  | "title"
  | "heading"
  | "body"
  | "caption"
  | "button";

interface AppTextProps extends TextProps {
  children: ReactNode;
  variant?: Variant;
}

export default function AppText({
  children,
  variant = "body",
  style,
  ...props
}: AppTextProps) {
  const { prefs } = useSettings();

  const scale = getFontScale(prefs.fontSize);

  const family = getFontFamilyName(
    prefs.fontFamily,
    prefs.fontWeight,
  );

  const baseSize = styles[variant].fontSize ?? 16;
  const baseWeight = styles[variant].fontWeight ?? "400";

  return (
    <Text
      {...props}
      style={[
        styles.base,
        styles[variant],
        {
          fontSize: Math.round(baseSize * scale),
          fontFamily: family,
          fontWeight: getFontWeightStyle(
            prefs.fontFamily,
            prefs.fontWeight,
            baseWeight as "400" | "600" | "700",
          ),
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    color: Colors.light.text,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
  },

  heading: {
    fontSize: 22,
    fontWeight: "600",
  },

  body: {
    fontSize: 16,
    fontWeight: "400",
  },

  caption: {
    fontSize: 14,
    fontWeight: "400",
    color: Colors.light.textSecondary,
  },

  button: {
    fontSize: 16,
    fontWeight: "600",
   color: Colors.light.onPrimary,
  },
});