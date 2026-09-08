import { supabase } from "@/lib/supabase";

export type NotificationType = "normal" | "alert";

interface MonitoringData {
  monitor_id: number;
  user_id: string;
  battery_level: number;
  battery_status: "Charging" | "Discharging" | "Idle";
  time_remaining: string;
  solar_input: number;
  solar_status: "Low" | "Moderate" | "High";
  current_load: number;
  device_status: "Online" | "Offline";
  last_seen: string | null;
  battery_temperature: number;
  battery_temperature_status:
    | "Nominal"
    | "Elevated"
    | "High"
    | "Critical";
  dod_status: "Safe" | "Unsafe";
  solar_temperature: number;
  solar_temperature_status:
    | "Nominal"
    | "Elevated"
    | "High"
    | "Critical";
}

interface NotificationData {
  title: string;
  description: string;
  type: NotificationType;
}

interface PreviousState {
  battery_level: number;
  solar_input: number;
  current_load: number;
  device_status: string;
  battery_status: string;
  battery_temperature_status: string;
  solar_temperature_status: string;
  dod_status: string;
}

/*
|--------------------------------------------------------------------------
| DUPLICATE PREVENTION
|--------------------------------------------------------------------------
|
| Checks if the same notification title was recently created.
| This prevents repeated notifications when monitoring data updates frequently.
|
*/

const NOTIFICATION_COOLDOWN_MINUTES = 10;

async function notificationExistsRecently(
  userId: string,
  title: string,
  cooldownMinutes: number = NOTIFICATION_COOLDOWN_MINUTES
): Promise<boolean> {
  const cooldownDate = new Date(
    Date.now() - cooldownMinutes * 60 * 1000
  ).toISOString();

  const { data, error } = await supabase
    .from("notifications")
    .select("notif_id")
    .eq("user_id", userId)
    .eq("title", title)
    .gte("created_at", cooldownDate)
    .limit(1);

  if (error) {
    console.error(
      "Error checking duplicate notification:",
      error.message
    );

    return false;
  }

  return !!data && data.length > 0;
}

/*
|--------------------------------------------------------------------------
| CREATE NOTIFICATION
|--------------------------------------------------------------------------
*/

async function createNotification(
  userId: string,
  notification: NotificationData,
  cooldownMinutes?: number
): Promise<void> {
  const exists = await notificationExistsRecently(
    userId,
    notification.title,
    cooldownMinutes
  );

  if (exists) {
    return;
  }

  const { error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      title: notification.title,
      description: notification.description,
      type: notification.type,
      read: false,
    });

  if (error) {
    console.error(
      "Error creating notification:",
      error.message
    );
  }
}

/*
|--------------------------------------------------------------------------
| MAIN NOTIFICATION CHECKER
|--------------------------------------------------------------------------
*/

export async function checkMonitoringNotifications(
  current: MonitoringData,
  previous?: PreviousState
): Promise<void> {
  const userId = current.user_id;

  /*
  |--------------------------------------------------------------------------
  | DEVICE STATUS
  |--------------------------------------------------------------------------
  */

  if (
    current.device_status === "Online" &&
    previous?.device_status !== "Online"
  ) {
    await createNotification(userId, {
      title: "System Online",
      description:
        "Your AdlaWatt system is connected and monitoring is active.",
      type: "normal",
    });
  }

  if (
    current.device_status === "Offline" &&
    previous?.device_status === "Online"
  ) {
    await createNotification(userId, {
      title: "System Offline",
      description:
        "Your AdlaWatt system is currently not sending monitoring data.",
      type: "alert",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | BATTERY FULLY CHARGED
  |--------------------------------------------------------------------------
  */

  if (
    current.battery_level === 100 &&
    previous?.battery_level !== 100
  ) {
    await createNotification(userId, {
      title: "Battery Fully Charged",
      description:
        "The battery has reached 100% charge.",
      type: "normal",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | BATTERY CHARGING STATUS
  |--------------------------------------------------------------------------
  */

  if (
    current.battery_status === "Charging" &&
    previous?.battery_status !== "Charging"
  ) {
    await createNotification(userId, {
      title: "Battery Charging",
      description:
        "The battery is currently receiving power.",
      type: "normal",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | BATTERY DISCHARGING STATUS
  |--------------------------------------------------------------------------
  */

  if (
    current.battery_status === "Discharging" &&
    previous?.battery_status !== "Discharging"
  ) {
    await createNotification(userId, {
      title: "Battery Discharging",
      description:
        "The battery is currently supplying power to connected appliances.",
      type: "normal",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | 80% DOD / 20% SOC
  |--------------------------------------------------------------------------
  */

  if (
    current.battery_level <= 20 &&
    previous &&
    previous.battery_level > 20
  ) {
    await createNotification(userId, {
      title: "Battery Reached Normal-Use Cutoff",
      description:
        "Battery level reached 20%. Consider reducing power usage.",
      type: "alert",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | BATTERY EMPTY
  |--------------------------------------------------------------------------
  */

  if (
    current.battery_level === 0 &&
    previous?.battery_level !== 0
  ) {
    await createNotification(userId, {
      title: "Battery Empty",
      description:
        "The battery is empty. The BMS may disconnect the battery.",
      type: "alert",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | DOD STATUS
  |--------------------------------------------------------------------------
  */

  if (
    current.dod_status === "Unsafe" &&
    previous?.dod_status !== "Unsafe"
  ) {
    await createNotification(userId, {
      title: "Unsafe Battery Discharge",
      description:
        "The battery has reached an unsafe depth of discharge.",
      type: "alert",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | BATTERY TEMPERATURE
  |--------------------------------------------------------------------------
  |
  | High is NORMAL based on your clarification.
  | Only Critical creates an ALERT.
  |
  */

  if (
    current.battery_temperature_status === "High" &&
    previous?.battery_temperature_status !== "High"
  ) {
    await createNotification(userId, {
      title: "Battery Temperature High",
      description:
        "Battery temperature is high but remains within the monitored range.",
      type: "normal",
    });
  }

  if (
    current.battery_temperature_status === "Critical" &&
    previous?.battery_temperature_status !== "Critical"
  ) {
    await createNotification(userId, {
      title: "Critical Battery Temperature",
      description:
        "Battery temperature reached a critical level. Check the system.",
      type: "alert",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | SOLAR PANEL TEMPERATURE
  |--------------------------------------------------------------------------
  */

  if (
    current.solar_temperature_status === "High" &&
    previous?.solar_temperature_status !== "High"
  ) {
    await createNotification(userId, {
      title: "Solar Panel Temperature High",
      description:
        "Solar panel temperature is high but remains within the monitored range.",
      type: "normal",
    });
  }

  if (
    current.solar_temperature_status === "Critical" &&
    previous?.solar_temperature_status !== "Critical"
  ) {
    await createNotification(userId, {
      title: "Critical Solar Panel Temperature",
      description:
        "Solar panel temperature reached a critical level.",
      type: "alert",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | SOLAR INPUT - EVERY 50W CHARGED
  |--------------------------------------------------------------------------
  |
  | Example:
  | 50W -> notification
  | 100W -> notification
  | 150W -> notification
  |
  */

  const previousSolar = previous?.solar_input ?? 0;

  const currentSolarMilestone =
    Math.floor(current.solar_input / 50);

  const previousSolarMilestone =
    Math.floor(previousSolar / 50);

  if (
    currentSolarMilestone > previousSolarMilestone &&
    current.solar_input >= 50
  ) {
    await createNotification(
      userId,
      {
        title: "Solar Energy Charging",
        description: `Solar input reached ${current.solar_input.toFixed(
          0
        )}W.`,
        type: "normal",
      },
      5
    );
  }

  /*
  |--------------------------------------------------------------------------
  | LOAD ACTIVITY - EVERY 50W DISCHARGED
  |--------------------------------------------------------------------------
  */

  const previousLoad = previous?.current_load ?? 0;

  const currentLoadMilestone =
    Math.floor(current.current_load / 50);

  const previousLoadMilestone =
    Math.floor(previousLoad / 50);

  if (
    currentLoadMilestone > previousLoadMilestone &&
    current.current_load >= 50
  ) {
    await createNotification(
      userId,
      {
        title: "Power Load Detected",
        description: `Current power usage reached ${current.current_load.toFixed(
          0
        )}W.`,
        type: "normal",
      },
      5
    );
  }
}