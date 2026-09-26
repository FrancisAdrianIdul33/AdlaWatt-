// src/constants/colors.ts

// ============================================================
// ADLAWATT PALETTE — single default (light) theme.
//
// 60-30-10 rule:
//   60 — cream background + white surfaces (dominant)
//   30 — green primary (brand, actions, active states)
//   10 — yellow secondary + icon accent (sparingly)
//
// Every literal below is referenced by at least one
// component. Register new colors here instead of hardcoding
// them in components. `dark` mode was removed: the app ships
// one theme.
// ============================================================

export const Colors = {
  light: {
    // ——— 60 · dominant surfaces ———
    background: "#F0EAD6",
    surface: "#FFFFFF",

    // ——— 30 · primary brand ———
    primary: "#00A86B",
    onPrimary: "#FFFFFF",
    primarySoft: "#99DCC4",

    // ——— 10 · accents (use sparingly) ———
    secondary: "#FFBF00",
    iconAccent: "#FACC15",

    // ——— type + hairlines ———
    text: "#2e2e2e",
    textSecondary: "#454545",
    border: "#D8D2C2",

    // ——— status (all in active use) ———
    error: "#EF4444",
    errorDark: "#D32F2F",
    errorDeep: "#991B1B",
    warning: "#F59E0B",

    // ——— washes + overlays ———
    primaryWash: "rgba(0, 168, 107, 0.08)",
    overlay: "rgba(0, 0, 0, 0.40)",
    overlayStrong: "rgba(0, 0, 0, 0.50)",

    // ——— neutrals ———
    placeholder: "#dfdfdf",
    color1: "#edeb44",

    // ——— area data colors (intentional, not theme) ———
    areas: {
      living: "#00A86B",
      bedroom: "#9B59B6",
      kitchen: "#FFBF00",
      study: "#4A90E2",
      bathroom: "#16A085",
      porch: "#E67E22",
    },
  },

  glass: {
    white: "rgba(255, 255, 255, 0.50)",
    whiteStrong: "rgba(255, 255, 255, 0.78)",
    disabled: "rgba(255, 255, 255, 0.35)",
    disabledText: "rgba(255, 255, 255, 0.75)",
    unread: "rgba(245, 245, 245, 0.85)",
  },
} as const;
