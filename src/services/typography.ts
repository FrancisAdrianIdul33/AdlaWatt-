import { Platform } from "react-native";

// ============================================================
// TYPOGRAPHY OPTIONS
//
// The 5 font labels shown in Preferences. They resolve to
// real loaded fonts (Inter / Roboto via expo-font) or to
// platform system stacks for the rest.
// ============================================================

export type FontSizeOption =
  | "Small"
  | "Medium"
  | "Big";

export type FontWeightOption =
  | "Thin"
  | "Regular"
  | "Bold";

export type FontFamilyOption =
  | "Times New Roman"
  | "Roboto"
  | "Inter"
  | "System Default"
  | "Monospace";

export const FONT_FAMILY_OPTIONS: FontFamilyOption[] =
  [
    "Times New Roman",
    "Roboto",
    "Inter",
    "System Default",
    "Monospace",
  ];

export const FONT_SIZE_OPTIONS: FontSizeOption[] =
  ["Small", "Medium", "Big"];

export const FONT_WEIGHT_OPTIONS: FontWeightOption[] =
  ["Thin", "Regular", "Bold"];

// ============================================================
// SIZE SCALE
// ============================================================

const FONT_SCALES: Record<
  FontSizeOption,
  number
> = {
  Small: 0.875,
  Medium: 1,
  Big: 1.15,
};

export function getFontScale(
  size: FontSizeOption,
): number {
  return FONT_SCALES[size] ?? 1;
}

// ============================================================
// FAMILY RESOLUTION
//
// Inter / Roboto resolve to bundled expo-font files that
// already encode the weight (Light / Regular / Bold).
// Times New Roman cannot be bundled (proprietary license)
// so it resolves to the platform serif stack.
// System Default resolves to undefined (platform default).
// ============================================================

export function getFontFamilyName(
  family: FontFamilyOption,
  weight: FontWeightOption,
): string | undefined {
  if (family === "System Default") {
    return undefined;
  }

  if (family === "Inter") {
    if (weight === "Thin") {
      return "Inter_300Light";
    }

    if (weight === "Bold") {
      return "Inter_700Bold";
    }

    return "Inter_400Regular";
  }

  if (family === "Roboto") {
    if (weight === "Thin") {
      return "Roboto_300Light";
    }

    if (weight === "Bold") {
      return "Roboto_700Bold";
    }

    return "Roboto_400Regular";
  }

  if (family === "Times New Roman") {
    return Platform.select({
      ios: "Georgia",
      android: "serif",
      web: "Georgia",
      default: "serif",
    });
  }

  if (family === "Monospace") {
    return Platform.select({
      ios: "Menlo",
      android: "monospace",
      web: "monospace",
      default: "monospace",
    });
  }

  return undefined;
}

// ============================================================
// WEIGHT STYLE
//
// Bundled Inter / Roboto files already carry the weight,
// so keep the base weight to avoid faux-bold synthesis.
// System stacks need an explicit weight mapping.
// ============================================================

export function getFontWeightStyle(
  family: FontFamilyOption,
  weight: FontWeightOption,
  baseWeight:
    | "300"
    | "400"
    | "600"
    | "700"
    | "normal"
    | "bold" = "400",
): "300" | "400" | "600" | "700" | "normal" | "bold" {
  if (
    family === "Inter" ||
    family === "Roboto"
  ) {
    return baseWeight;
  }

  if (weight === "Thin") {
    return "300";
  }

  if (weight === "Bold") {
    return "700";
  }

  return baseWeight as
    | "300"
    | "400"
    | "600"
    | "normal"
    | "bold";
}
