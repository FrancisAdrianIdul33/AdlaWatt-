import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

// ============================================================
// TYPES
// ============================================================

export type TemperatureStatus =
  | "Nominal"
  | "Elevated"
  | "High"
  | "Critical";

export type DeviceStatus =
  | "Online"
  | "Offline";

export type BatteryStatus =
  | "Charging"
  | "Discharging"
  | "Idle";

export type SolarStatus =
  | "Low"
  | "Moderate"
  | "High";

export type DoDStatus =
  | "Safe"
  | "Unsafe";

// ============================================================
// MONITORING DATA
// ============================================================

export interface MonitoringData {
  battery_level: number;
  battery_status: BatteryStatus;
  time_remaining: string;

  voltage: number;
  watt_hours: number;

  solar_input: number;
  solar_status: SolarStatus;
  current_load: number;

  device_status: DeviceStatus;

  battery_temperature: number;
  battery_temperature_status: TemperatureStatus;

  dod_status: DoDStatus;

  solar_temperature: number;
  solar_temperature_status: TemperatureStatus;
}

// ============================================================
// FETCH MONITORING DATA
// ============================================================

export const getMonitoringData =
  async (): Promise<MonitoringData | null> => {

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error(
        "Error getting user:",
        userError.message,
      );
      return null;
    }

    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from("monitoring")
      .select(`
        battery_level,
        battery_status,
        time_remaining,

        voltage,
        watt_hours,

        solar_input,
        solar_status,
        current_load,

        device_status,

        battery_temperature,
        battery_temperature_status,

        dod_status,

        solar_temperature,
        solar_temperature_status
      `)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error(
        "Error loading monitoring data:",
        error.message,
      );
      return null;
    }

    return data as MonitoringData | null;
  };

// ============================================================
// SUBSCRIBE TO MONITORING
// ============================================================

export const subscribeToMonitoring = async (
  onChange: (
    data: MonitoringData | null,
  ) => void,
) => {

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error(
      "Error getting user:",
      error.message,
    );
    return null;
  }

  if (!user) {
    return null;
  }

  const channel = supabase
    .channel(
      `monitoring-${user.id}-${Date.now()}`,
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "monitoring",
        filter: `user_id=eq.${user.id}`,
      },
      (payload) => {

        if (
          payload.eventType === "DELETE"
        ) {
          onChange(null);
          return;
        }

        onChange(
          payload.new as MonitoringData,
        );
      },
    )
    .subscribe((status) => {

      if (
        status === "CHANNEL_ERROR"
      ) {
        console.warn(
          "Monitoring Realtime channel error.",
        );
      }

      if (status === "TIMED_OUT") {
        console.warn(
          "Monitoring Realtime connection timed out.",
        );
      }

    });

  return channel;
};

// ============================================================
// UNSUBSCRIBE
// ============================================================

export const unsubscribeFromMonitoring = (
  channel: ReturnType<
    typeof supabase.channel
  > | null,
) => {

  if (channel) {
    supabase.removeChannel(channel);
  }

};

// ============================================================
// USE MONITORING HOOK
// ============================================================

export const useMonitoring = () => {

  const [
    monitoring,
    setMonitoring,
  ] = useState<
    MonitoringData | null
  >(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {

    let mounted = true;

    let channel:
      | ReturnType<
          typeof supabase.channel
        >
      | null = null;

    const initializeMonitoring =
      async () => {

        try {

          // ----------------------------------------------------
          // GET INITIAL MONITORING DATA
          // ----------------------------------------------------

          const data =
            await getMonitoringData();

          if (!mounted) {
            return;
          }

          setMonitoring(data);

          // ----------------------------------------------------
          // SUBSCRIBE TO REALTIME MONITORING
          // ----------------------------------------------------

          channel =
            await subscribeToMonitoring(
              (updatedData) => {

                if (!mounted) {
                  return;
                }

                setMonitoring(
                  updatedData,
                );

              },
            );

        } catch (error) {

          console.error(
            "Unexpected monitoring error:",
            error,
          );

          if (mounted) {
            setMonitoring(null);
          }

        } finally {

          if (mounted) {
            setLoading(false);
          }

        }

      };

    initializeMonitoring();

    // ==========================================================
    // CLEANUP
    // ==========================================================

    return () => {

      mounted = false;

      unsubscribeFromMonitoring(
        channel,
      );

    };

  }, []);

  return {
    monitoring,
    loading,
  };

};