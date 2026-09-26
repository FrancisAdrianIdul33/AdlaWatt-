import React, { ReactNode, useMemo } from "react";
import { StyleSheet, Text, TextProps } from "react-native";

import { Colors } from "@/constants/colors";
import { useSettings } from "@/context/SettingsContext";
import {
  getFontFamilyName,
  getFontScale,
  shouldApplyFontWeight,
  type DesignWeight,
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

    // Design weight selects the bundled file for Inter /
    // Roboto; no fontWeight style may accompany those files
    // (Android falls back to system when paired).
    const family = getFontFamilyName(
      prefs.fontFamily,
      callerWeight as DesignWeight,
    );

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
      fontWeight: shouldApplyFontWeight(
        prefs.fontFamily,
      )
        ? callerWeight
        : undefined,
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