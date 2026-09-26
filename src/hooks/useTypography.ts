import { useMemo } from "react";

import { useSettings } from "@/context/SettingsContext";
import {
  getFontFamilyName,
  getFontScale,
} from "@/services/typography";

// ============================================================
// SHARED TYPOGRAPHY HOOK
//
// Proportional scaling for non-AppText consumers
// (TextInput, charts, SVG labels). No layout changes:
// only fontSize / fontFamily are derived. Design weights
// stay with each caller. Weight preference removed.
// ============================================================

export function useTypography() {
  const { prefs } = useSettings();

  return useMemo(() => {
    const scale = getFontScale(prefs.fontSize);

    const family = getFontFamilyName(
      prefs.fontFamily,
    );

    const scaledSize = (size: number) =>
      Math.round(size * scale);

    return {
      scale,
      family,
      scaledSize,
    };
  }, [prefs]);
}
