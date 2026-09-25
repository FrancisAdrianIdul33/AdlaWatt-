import React, { ReactNode, useMemo } from "react";
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
  allowCustomFamily?: boolean;
}

export default function AppText({
  children,
  variant = "body",
  style,
  allowCustomFamily = false,
  allowFontScaling = false,
  ...props
}: AppTextProps) {
  const { prefs } = useSettings();

  const override = useMemo(() => {
    const scale = getFontScale(prefs.fontSize);

    const family = getFontFamilyName(
      prefs.fontFamily,
      prefs.fontWeight,
    );

    const baseSize =
      styles[variant].fontSize ?? 16;
    const baseWeight =
      styles[variant].fontWeight ?? "400";

    const flat =
      StyleSheet.flatten(style) ?? {};

    const callerSize =
      typeof flat.fontSize === "number"
        ? flat.fontSize
        : baseSize;

    const callerWeight =
      typeof flat.fontWeight === "string"
        ? flat.fontWeight
        : baseWeight;

    const callerFamily =
      typeof flat.fontFamily === "string"
        ? flat.fontFamily
        : undefined;

    return {
      fontSize: Math.round(
        callerSize * scale,
      ),
      fontFamily:
        allowCustomFamily && callerFamily
          ? callerFamily
          : family,
      fontWeight: getFontWeightStyle(
        prefs.fontFamily,
        prefs.fontWeight,
        callerWeight as
          | "300"
          | "400"
          | "600"
          | "700"
          | "normal"
          | "bold",
      ),
    };
  }, [
    prefs,
    variant,
    style,
    allowCustomFamily,
  ]);

  return (
    <Text
      allowFontScaling={allowFontScaling}
      {...props}
      style={[
        styles.base,
        styles[variant],
        style,
        override,
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