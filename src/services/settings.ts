import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  FontFamilyOption,
  FontSizeOption,
  FontWeightOption,
} from "@/services/typography";

// ============================================================
// TYPOGRAPHY PREFERENCES (v1)
//
// Local-only system settings. No Supabase.
// Dark mode / color blind mode are intentionally excluded.
// Language / vibration / email alerts are reserved for later
// and can extend this interface without migration breaks.
// ============================================================

export interface TypographyPreferences {
  fontSize: FontSizeOption;
  fontWeight: FontWeightOption;
  fontFamily: FontFamilyOption;
}

export const DEFAULT_TYPOGRAPHY: TypographyPreferences =
  {
    fontSize: "Medium",
    fontWeight: "Regular",
    fontFamily: "System Default",
  };

export const TYPOGRAPHY_STORAGE_KEY =
  "adlawatt.typography.v1";

function sanitize(
  value: unknown,
): TypographyPreferences {
  const candidate =
    (value as Partial<TypographyPreferences>) ??
    {};

  const fontSize: FontSizeOption =
    candidate.fontSize === "Small" ||
    candidate.fontSize === "Big"
      ? candidate.fontSize
      : "Medium";

  const fontWeight: FontWeightOption =
    candidate.fontWeight === "Thin" ||
    candidate.fontWeight === "Bold"
      ? candidate.fontWeight
      : "Regular";

  const fontFamily: FontFamilyOption =
    candidate.fontFamily === "Times New Roman" ||
    candidate.fontFamily === "Roboto" ||
    candidate.fontFamily === "Inter" ||
    candidate.fontFamily === "Monospace"
      ? candidate.fontFamily
      : "System Default";

  return {
    fontSize,
    fontWeight,
    fontFamily,
  };
}

export async function loadTypographyPreferences(): Promise<TypographyPreferences> {
  try {
    const raw = await AsyncStorage.getItem(
      TYPOGRAPHY_STORAGE_KEY,
    );

    if (!raw) {
      return DEFAULT_TYPOGRAPHY;
    }

    return sanitize(JSON.parse(raw));
  } catch {
    return DEFAULT_TYPOGRAPHY;
  }
}

export async function saveTypographyPreferences(
  prefs: TypographyPreferences,
): Promise<void> {
  await AsyncStorage.setItem(
    TYPOGRAPHY_STORAGE_KEY,
    JSON.stringify(sanitize(prefs)),
  );
}
