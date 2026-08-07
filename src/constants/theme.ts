import "@/global.css";

import { Platform } from "react-native";

/*
|--------------------------------------------------------------------------
| Colors
|--------------------------------------------------------------------------
*/

export const Colors = {
  light: {
    // Brand
    primary: "#00A86B",
    secondary: "#FFA500",

    // Backgrounds
    background: "#F0EAD6",
    surface: "#FFFFFF",

    // Text
    text: "#1a1a1a",
    textSecondary: "#1c1c1c",
    onPrimary: "#FFFFFF",

    // Status
    success: "#22C55E",
    warning: "#F59E0B",
    error: "#EF4444",

    // UI
    border: "#D8D2C2",
    divider: "#E5E5E5",
    disabled: "#BDBDBD",
  },

  dark: {
    // Brand
    primary: "#00A86B",
    secondary: "#FFA500",

    // Backgrounds
    background: "#121212",
    surface: "#1E1E1E",

    // Text
    text: "#FFFFFF",
    textSecondary: "#D1D5DB",
    onPrimary: "#FFFFFF",

    // Status
    success: "#22C55E",
    warning: "#F59E0B",
    error: "#EF4444",

    // UI
    border: "#2E2E2E",
    divider: "#3A3A3A",
    disabled: "#5C5C5C",
  },
} as const;

export type ThemeColor =
  keyof typeof Colors.light &
  keyof typeof Colors.dark;

/*
|--------------------------------------------------------------------------
| Fonts
|--------------------------------------------------------------------------
*/

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },

  android: {
    sans: "sans-serif",
    serif: "serif",
    rounded: "sans-serif",
    mono: "monospace",
  },

  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },

  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

/*
|--------------------------------------------------------------------------
| Spacing
|--------------------------------------------------------------------------
*/

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/*
|--------------------------------------------------------------------------
| Border Radius
|--------------------------------------------------------------------------
*/

export const Radius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  round: 999,
} as const;

/*
|--------------------------------------------------------------------------
| Typography
|--------------------------------------------------------------------------
*/

export const Typography = {
  display: 36,
  title: 30,
  heading: 24,
  subheading: 20,
  body: 16,
  caption: 14,
  small: 12,
} as const;

/*
|--------------------------------------------------------------------------
| Shadows
|--------------------------------------------------------------------------
*/

export const Shadows = {
  sm: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },

  md: {
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 4,
  },

  lg: {
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 8,
  },
} as const;