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
    onPrimaryMuted: "rgba(255, 255, 255, 0.6)",
    onPrimarySoft: "rgba(255, 255, 255, 0.9)",
    primarySoft: "#99DCC4",
    primaryPressed: "#33B98A",

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
    washFaint: "rgba(0, 168, 107, 0.06)",
    scrimFaint: "rgba(0, 0, 0, 0.04)",
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

    // ——— chart data colors (intentional, not theme) ———
    chart: {
      orange: "#F97316",
      grid: "rgba(46, 46, 46, 0.10)",
      axisLabel: "#8E8E93",
    },

    // ——— temperature severity badges (intentional scale) ———
    severity: {
      nominal: {
        bg: "#E4EAD9",
        border: "#14532D",
        text: "#14532D",
      },
      elevated: {
        bg: "#EBE8CD",
        border: "#713F12",
        text: "#713F12",
      },
      high: {
        bg: "#EFE2CC",
        border: "#7C2D12",
        text: "#7C2D12",
      },
      critical: {
        bg: "#EFE0DC",
        border: "#7F1D1D",
        text: "#7F1D1D",
      },
    },

    // ——— weather badges (intentional PAGASA-style scale) ———
    weather: {
      clear: {
        bg: "#DCFCE7",
        border: "#86EFAC",
        text: "#166534",
      },
      partlyCloudy: {
        bg: "#FEF3C7",
        border: "#FCD34D",
        text: "#92400E",
      },
      overcast: {
        bg: "#F1F5F9",
        border: "#CBD5E1",
        text: "#475569",
      },
      fog: {
        bg: "#E2E8F0",
        border: "#94A3B8",
        text: "#475569",
      },
      yellow: {
        bg: "#FEF3C7",
        border: "#FACC15",
        text: "#854D0E",
      },
      orange: {
        bg: "#FFEDD5",
        border: "#F97316",
        text: "#9A3412",
      },
      red: {
        bg: "#FEE2E2",
        border: "#EF4444",
        text: "#991B1B",
      },
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
