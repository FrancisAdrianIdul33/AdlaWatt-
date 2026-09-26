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

export type FontFamilyOption =
  | "Times New Roman"
  | "Roboto"
  | "Inter"
  | "System Default"
  | "Monospace";

export const FONT_FAMILY_OPTIONS: FontFamilyOption[] =
  [
    "System Default",
    "Times New Roman",
    "Roboto",
    "Inter",
    "Monospace",
  ];

export const FONT_SIZE_OPTIONS: FontSizeOption[] =
  ["Small", "Medium", "Big"];

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
// Weight preference removed: Inter / Roboto always resolve
// to the Regular bundled file. Design weights in styles
// (e.g. 600/700 titles) still apply via fontWeight.
// Times New Roman cannot be bundled (proprietary license)
// so it resolves to the platform serif stack.
// System Default resolves to undefined (platform default).
// ============================================================

export function getFontFamilyName(
  family: FontFamilyOption,
): string | undefined {
  if (family === "System Default") {
    return undefined;
  }

  if (family === "Inter") {
    return "Inter_400Regular";
  }

  if (family === "Roboto") {
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
