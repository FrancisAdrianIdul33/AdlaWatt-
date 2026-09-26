import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  DEFAULT_TYPOGRAPHY,
  loadTypographyPreferences,
  saveTypographyPreferences,
  type TypographyPreferences,
} from "@/services/settings";

// ============================================================
// SETTINGS CONTEXT (typography v1)
//
// Local-only. Single shared instance for the dashboard via
// app/dashboard/_layout. Auth screens are intentionally
// excluded and fall back to defaults (no provider mounted).
// Save-to-apply, no preview: Menu commits drafts via
// setPreferences; other dashboard screens update via the
// shared instance. PDF export stays on helvetica.
// ============================================================

interface SettingsContextValue {
  prefs: TypographyPreferences;
  isLoaded: boolean;
  setPreferences: (
    prefs: TypographyPreferences,
  ) => Promise<void>;
  updatePreferences: (
    patch: Partial<TypographyPreferences>,
  ) => Promise<void>;
}

const SettingsContext =
  createContext<SettingsContextValue | null>(
    null,
  );

export function SettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [prefs, setPrefs] = useState<TypographyPreferences>(
    DEFAULT_TYPOGRAPHY,
  );

  const [isLoaded, setIsLoaded] =
    useState(false);

  useEffect(() => {
    let active = true;

    loadTypographyPreferences().then(
      (loaded) => {
        if (active) {
          setPrefs(loaded);
          setIsLoaded(true);
        }
      },
    );

    return () => {
      active = false;
    };
  }, []);

  const setPreferences = useCallback(
    async (
      next: TypographyPreferences,
    ) => {
      setPrefs(next);
      await saveTypographyPreferences(next);
    },
    [],
  );

  const updatePreferences = useCallback(
    async (
      patch: Partial<TypographyPreferences>,
    ) => {
      let next: TypographyPreferences =
        DEFAULT_TYPOGRAPHY;

      setPrefs((current) => {
        next = { ...current, ...patch };
        return next;
      });

      await saveTypographyPreferences(next);
    },
    [],
  );

  const value = useMemo(
    () => ({
      prefs,
      isLoaded,
      setPreferences,
      updatePreferences,
    }),
    [
      prefs,
      isLoaded,
      setPreferences,
      updatePreferences,
    ],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);

  if (ctx) {
    return ctx;
  }

  // Fallback outside provider (auth screens, tests).
  return {
    prefs: DEFAULT_TYPOGRAPHY,
    isLoaded: false,
    setPreferences: async () => {},
    updatePreferences: async () => {},
  };
}
