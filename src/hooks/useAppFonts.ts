import { useFonts } from "expo-font";

import {
  Inter_300Light,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

import {
  Roboto_300Light,
  Roboto_400Regular,
  Roboto_700Bold,
} from "@expo-google-fonts/roboto";

// ============================================================
// APP FONTS
//
// Bundled display fonts for Typography preferences.
// System Default / Monospace / Serif need no bundle.
// ============================================================

export function useAppFonts(): boolean {
  const [loaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_700Bold,
    Roboto_300Light,
    Roboto_400Regular,
    Roboto_700Bold,
  });

  return loaded;
}
