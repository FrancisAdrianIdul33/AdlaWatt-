import { useMemo } from "react";

import { useSettings } from "@/context/SettingsContext";
import {
  getFontFamilyName,
  getFontScale,
  shouldApplyFontWeight,
  type DesignWeight,
} from "@/services/typography";

// ============================================================
// SHARED TYPOGRAPHY HOOK
//
// Proportional scaling for non-AppText consumers
// (TextInput, charts, SVG labels). No layout changes:
// only fontSize / fontFamily are derived. Inputs render at
// 400, so bundled families resolve the Regular file and
// carry no fontWeight style (see typography.ts).
// ============================================================

export function useTypography() {
  const { prefs } = useSettings();

  return useMemo(() => {
    const scale = getFontScale(prefs.fontSize);

    const family = getFontFamilyName(
      prefs.fontFamily,
      "400",
    );

    const weight: DesignWeight | undefined =
      shouldApplyFontWeight(
        prefs.fontFamily,
      )
        ? "400"
        : undefined;

    const scaledSize = (size: number) =>
      Math.round(size * scale);

    return {
      scale,
      family,
      scaledSize,
      weight,
    };
  }, [prefs]);
}
