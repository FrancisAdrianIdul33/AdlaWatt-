import { useMemo } from "react";

import { useSettings } from "@/context/SettingsContext";
import {
  getFontFamilyName,
  getFontScale,
  getFontWeightStyle,
} from "@/services/typography";

// ============================================================
// SHARED TYPOGRAPHY HOOK
//
// Proportional scaling for non-AppText consumers
// (TextInput, charts, SVG labels). No layout changes:
// only fontSize / fontFamily / fontWeight are derived.
// ============================================================

export function useTypography() {
  const { prefs } = useSettings();

  return useMemo(() => {
    const scale = getFontScale(prefs.fontSize);

    const familyFor = (
      weight = prefs.fontWeight,
    ) =>
      getFontFamilyName(
        prefs.fontFamily,
        weight,
      );

    const weightFor = (
      base:
        | "300"
        | "400"
        | "600"
        | "700"
        | "normal"
        | "bold" = "400",
    ) =>
      getFontWeightStyle(
        prefs.fontFamily,
        prefs.fontWeight,
        base,
      );

    const scaledSize = (size: number) =>
      Math.round(size * scale);

    return {
      scale,
      family: familyFor(),
      familyFor,
      weightFor,
      scaledSize,
    };
  }, [prefs]);
}
