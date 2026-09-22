import React, { lazy } from "react";
import { Platform } from "react-native";

import type EnergyBalanceChartComponent from "@/components/charts/EnergyBalanceChart";
import type BatteryLevelChartComponent from "@/components/charts/BatteryLevelChart";
import type SolarLoadChartComponent from "@/components/charts/SolarLoadChart";
import type TemperatureHealthChartComponent from "@/components/charts/TemperatureHealthChart";
import type VoltageDoDChartComponent from "@/components/charts/VoltageDoDChart";

/* ============================================================
   LAZY SKIA CHARTS
   The card shells in AnalyticsCharts render immediately; only the
   Skia chart interiors are lazy-loaded. On web, CanvasKit must be
   ready before any module importing @shopify/react-native-skia is
   evaluated, so every factory waits for it first.

   On the server (SSR/static export) no browser exists and the Skia
   module must never be evaluated in Node — the factory returns a
   pending promise so each card's Suspense fallback renders and the
   server HTML always matches hydration.
   ============================================================ */

type ChartComponent = React.ComponentType<any>;

let canvasKitReady: Promise<void> | undefined;

function ensureCanvasKitForWeb(): Promise<void> {
  if (Platform.OS !== "web") {
    return Promise.resolve();
  }

  if (!canvasKitReady) {
    canvasKitReady = import(
      "@shopify/react-native-skia/lib/module/web"
    )
      .then((module) =>
        module.LoadSkiaWeb({
          locateFile: (file: string) =>
            `/${file}`,
        }),
      )
      .catch((error: unknown) => {
        canvasKitReady = undefined;
        throw error;
      });
  }

  return canvasKitReady;
}

/* The browser downloads and compiles CanvasKit while the Supabase
   data is still in flight, so chart interiors can resolve as soon
   as the history arrives instead of waiting for the WASM after. */
export function warmUpCanvasKit(): Promise<void> {
  return ensureCanvasKitForWeb();
}

function resolveCharts<TComponent extends ChartComponent>(
  loader: () => Promise<{ default: TComponent }>,
): Promise<{ default: TComponent }> {
  if (Platform.OS === "web") {
    if (typeof window === "undefined") {
      return new Promise<{ default: TComponent }>(
        () => {},
      );
    }

    return ensureCanvasKitForWeb().then(loader);
  }

  return loader();
}

function lazyChartsModule<TComponent extends ChartComponent>(
  loader: () => Promise<{ default: TComponent }>,
) {
  return lazy(() => resolveCharts(loader));
}

/* ============================================================
   LAZY CHART COMPONENTS
   ============================================================ */

export const BatteryLevelChart =
  lazyChartsModule<typeof BatteryLevelChartComponent>(
    () =>
      import("@/components/charts/BatteryLevelChart"),
  );

export const SolarLoadChart =
  lazyChartsModule<typeof SolarLoadChartComponent>(
    () =>
      import("@/components/charts/SolarLoadChart"),
  );

export const EnergyBalanceChart =
  lazyChartsModule<typeof EnergyBalanceChartComponent>(
    () =>
      import("@/components/charts/EnergyBalanceChart"),
  );

export const TemperatureHealthChart =
  lazyChartsModule<
    typeof TemperatureHealthChartComponent
  >(() =>
    import(
      "@/components/charts/TemperatureHealthChart"
    ),
  );

export const VoltageDoDChart =
  lazyChartsModule<typeof VoltageDoDChartComponent>(
    () =>
      import("@/components/charts/VoltageDoDChart"),
  );