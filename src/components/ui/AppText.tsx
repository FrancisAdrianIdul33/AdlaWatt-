import React, { ReactNode } from "react";
import { StyleSheet, Text, TextProps } from "react-native";

import { Colors } from "@/constants/colors";

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
  return (
    <Text
      {...props}
      style={[styles.base, styles[variant], style]}
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