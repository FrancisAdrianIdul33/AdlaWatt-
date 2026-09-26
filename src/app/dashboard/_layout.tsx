import { Slot } from "expo-router";

import { SettingsProvider } from "@/context/SettingsContext";

// ============================================================
// DASHBOARD LAYOUT
//
// Single shared typography instance for the whole dashboard.
// Save in Menu propagates to all dashboard screens via this
// provider. Auth screens are intentionally excluded (no
// provider there — they fall back to DEFAULT_TYPOGRAPHY).
// Sizes/layouts are untouched: only fontFamily/weight flow
// through prefs; each screen keeps its intentional sizes.
// ============================================================

export default function DashboardLayout() {
  return (
    <SettingsProvider>
      <Slot />
    </SettingsProvider>
  );
}
