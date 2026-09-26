import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { SettingsProvider } from "@/context/SettingsContext";
import {
  ThemeProvider,
  useTheme,
} from "@/context/ThemeContext";

// ============================================================
// DASHBOARD LAYOUT
//
// Single shared typography + theme instances for the whole
// dashboard. Save in Menu propagates typography to all
// dashboard screens; the Dark Mode toggle applies instantly.
// Auth screens are intentionally excluded (no providers
// there — they fall back to defaults and always render
// light). StatusBar follows the active theme.
// ============================================================

function ThemedDashboard() {
  const { theme } = useTheme();

  return (
    <SettingsProvider>
      <StatusBar
        style={theme === "dark" ? "light" : "dark"}
      />
      <Slot />
    </SettingsProvider>
  );
}

export default function DashboardLayout() {
  return (
    <ThemeProvider>
      <ThemedDashboard />
    </ThemeProvider>
  );
}
