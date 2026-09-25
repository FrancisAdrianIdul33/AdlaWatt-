// ============================================================
// ADLAWATT APPLIANCE RECOMMENDATION ENGINE
//
// Pure calculation module — no network calls and no React
// Native imports, so it can be verified anywhere.
//
// Battery capacity reference (ZENOVA 12V 30Ah x2 parallel):
//   - Nominal energy             : 720 Wh
//   - 20% SoC reserve floor      : 144 Wh
//   - 80% depth of discharge     : 576 Wh usable window
//
// The engine performs the full analysis:
//   - Battery tier classification
//   - Reserve-floor usable energy
//   - Charge-scaled wattage cap
//   - Voltage headroom projection
//   - Budget (per-hour share of usable energy)
//   - Per-appliance runtime estimate
//   - Recommendation verdict
//   - Combined load-stack checks
//
// Verdicts:
//   - recommended      : draws <= 10%/hr of the usable energy
//   - care             : draws 10-25%/hr, or battery in caution
//   - notRecommended   : blocked, unsafe voltage, over the charge
//                        wattage cap, or draws > 25%/hr
// ============================================================

// ============================================================
// TYPES
// ============================================================

export type BatteryTier =
  | "Safe"
  | "Caution"
  | "Unsafe";

export type Verdict =
  | "recommended"
  | "care"
  | "notRecommended";

export type BadgeLabel =
  | "OK to use"
  | "Not advisable";

export interface BatteryStateInput {
  soc: number; // percentage 0-100
  voltage: number; // volts
  remainingWh: number; // energy currently in the battery
  dod?: "Safe" | "Unsafe"; // depth-of-discharge guard
}

export interface ApplianceInput {
  id: string;
  name: string;
  wattage: string; // e.g. "35-75W", "50W", "15-20"
  area?: string;
}

export interface WattRange {
  min: number;
  mid: number;
  max: number;
}

export interface RuntimeEstimate {
  minHours: number; // worst case (uses max wattage)
  midHours: number; // average estimate
  maxHours: number; // best case (uses min wattage)
}

export interface BatteryClassification {
  tier: BatteryTier;
  usableWh: number;
  blocked: boolean;
  reasons: string[];
}

export interface ApplianceRecommendation {
  id: string;
  name: string;
  area?: string;
  wattRange: WattRange | null;
  verdict: Verdict;
  badgeLabel: BadgeLabel;
  tier: BatteryTier;
  usableWh: number;
  runtime: RuntimeEstimate;
  displayRuntime: string;
  reason: string;
  drainRatio: number; // mid watts / usable Wh (per-hour budget share)
  projectedVoltage: number; // current voltage minus estimated draw drop
  wattCap: number; // charge-scaled peak wattage limit
}

export interface LoadStackResult {
  tier: BatteryTier;
  usableWh: number;
  blocked: boolean;
  totalMinWatts: number;
  totalMidWatts: number;
  totalMaxWatts: number;
  runtimeMidHours: number;
  overLimit: boolean;
  limitWatts: number;
  topDrain: ApplianceInput | null;
}

export interface RecommendBatchResult {
  tier: BatteryTier;
  usableWh: number;
  blocked: boolean;
  recommendations: ApplianceRecommendation[];
}

// ============================================================
// CONSTANTS
// ============================================================

export const BATTERY_NOMINAL_WH = 720;

export const RESERVE_WH = 144;

export const CAUTION_SOC = 20;

export const CAUTION_VOLTAGE = 10.65;

export const UNSAFE_VOLTAGE = 10.6;

export const MAX_SAFE_LOAD_W = 1000;

export const ALL_DAY_HOURS_LIMIT = 72;

// Budget thresholds: the share of the usable energy an appliance
// spends per hour (mid watts / usable Wh).
export const BUDGET_RECOMMENDED_MAX_RATIO =
  0.10; // <= 10%/hr -> recommended

export const BUDGET_CARE_MAX_RATIO =
  0.25; // 10-25%/hr -> care, > 25%/hr -> not recommended

// Estimated voltage drop model: 0.1 V per 50 W of load.
export const VOLTAGE_DROP_STEP_WATTS =
  50;

export const VOLTAGE_DROP_STEP_VOLTS =
  0.1;

// Display threshold for the runtime label.
export const RUNTIME_CARE_MIN_HOURS =
  10 / 60; // "<10 min" below this

// Used when no live battery reading is available yet.
export const DEFAULT_BATTERY_STATE: BatteryStateInput = {
  soc: 100,
  voltage: 12.6,
  remainingWh: BATTERY_NOMINAL_WH,
  dod: "Safe",
};

// ============================================================
// SAFE NUMERIC VALUE
// ============================================================

const normalizeNumber = (
  value: unknown,
): number => {

  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {

    return value;
  }

  if (
    typeof value === "string"
  ) {

    const parsed =
      Number(value);

    if (
      Number.isFinite(parsed)
    ) {

      return parsed;
    }
  }

  return 0;
};

// ============================================================
// 1. BATTERY STATE CLASSIFICATION
//
//  Safe    : SoC 21-100%, >144 Wh, >10.65 V
//  Caution : at the cutoff boundary (light loads only)
//  Unsafe  : any critical signal (block everything)
//
// Voltage is treated as the harder safety signal: a voltage
// at or below UNSAFE_VOLTAGE overrides a healthy SoC.
// ============================================================

export const classifyBatteryState = (
  input: BatteryStateInput,
): BatteryClassification => {

  const soc =
    normalizeNumber(input.soc);

  const voltage =
    normalizeNumber(input.voltage);

  const remainingWh =
    normalizeNumber(input.remainingWh);

  const reasons: string[] = [];

  let tier: BatteryTier = "Safe";

  // ------------------------------------------------
  // UNSAFE SIGNALS
  // ------------------------------------------------

  if (
    input.dod === "Unsafe"
  ) {

    tier = "Unsafe";

    reasons.push(
      "Depth of discharge is unsafe.",
    );
  }

  if (
    soc < CAUTION_SOC
  ) {

    tier = "Unsafe";

    reasons.push(
      `Battery level is ${soc}% (below the ${CAUTION_SOC}% cutoff).`,
    );
  }

  if (
    remainingWh < RESERVE_WH
  ) {

    tier = "Unsafe";

    reasons.push(
      "Remaining energy is below the 144 Wh reserve floor.",
    );
  }

  if (
    voltage <= UNSAFE_VOLTAGE
  ) {

    tier = "Unsafe";

    reasons.push(
      "Voltage is critically low — the harder safety signal.",
    );
  }

  // ------------------------------------------------
  // CAUTION BOUNDARY
  // ------------------------------------------------

  if (
    tier === "Safe" &&
    (soc === CAUTION_SOC ||
      remainingWh === RESERVE_WH ||
      voltage <= CAUTION_VOLTAGE)
  ) {

    tier = "Caution";

    reasons.push(
      "Battery is at the recommended cutoff boundary — light loads only.",
    );
  }

  // Energy above the reserve floor is what can
  // actually be spent without damaging the battery.
  const usableWh = Math.max(
    remainingWh - RESERVE_WH,
    0,
  );

  const blocked =
    tier === "Unsafe" ||
    usableWh <= 0;

  return {
    tier,
    usableWh,
    blocked,
    reasons,
  };
};

// ============================================================
// 2. APPLIANCE WATTAGE RESOLUTION
//
// "35-75W"  -> min 35, mid 55, max 75
// "50W"     -> min 50, mid 50, max 50
//
// Anything non-numeric or invalid returns null.
// ============================================================

export const parseWattageRange = (
  wattage: string,
): WattRange | null => {

  const raw =
    String(wattage ?? "").trim();

  const digits =
    raw.match(/\d+/g) ?? [];

  if (
    digits.length === 0
  ) {

    return null;
  }

  const values = digits
    .map((value) =>
      parseInt(value, 10),
    )
    .filter((value) =>
      Number.isFinite(value),
    );

  if (
    values.length === 0
  ) {

    return null;
  }

  const min =
    Math.min(...values);

  const max =
    Math.max(...values);

  if (
    min < 1 ||
    max < 1 ||
    max < min
  ) {

    return null;
  }

  // The middle value is the rounded average of the
  // published range and is used for the primary estimate.
  const mid =
    min === max
      ? min
      : Math.round(
          (min + max) / 2,
        );

  return {
    min,
    mid,
    max,
  };
};

// ============================================================
// 3. RUNTIME CALCULATION
//
// usable_Wh = remaining_Wh - 144  (the 20% reserve floor).
//
// Higher wattage consumes energy faster, so:
//   runtime_min = usable_Wh / max_wattage  (safety floor)
//   runtime_mid = usable_Wh / mid_wattage  (primary estimate)
//   runtime_max = usable_Wh / min_wattage  (eco / best case)
// ============================================================

export const estimateRuntime = (
  usableWh: number,
  watts: number,
): number => {

  if (
    !Number.isFinite(usableWh) ||
    !Number.isFinite(watts) ||
    usableWh <= 0 ||
    watts <= 0
  ) {

    return 0;
  }

  return usableWh / watts;
};

export const formatRuntimeLabel = (
  minHours: number,
  maxHours: number,
): string => {

  const low =
    Math.max(minHours, 0);

  const high =
    Math.max(maxHours, low);

  if (
    high >= ALL_DAY_HOURS_LIMIT
  ) {

    return "All day";
  }

  if (
    high < RUNTIME_CARE_MIN_HOURS
  ) {

    return "<10 min";
  }

  if (
    high - low <= 0.05
  ) {

    return `~${high.toFixed(
      high < 10 ? 1 : 0,
    )} hrs`;
  }

  const decimals =
    high < 10 ? 1 : 0;

  return `~${low.toFixed(decimals)} – ${high.toFixed(decimals)} hrs`;
};

// ============================================================
// 3B. BUDGET, WATT CAP, AND VOLTAGE HEADROOM
//
// budget   = mid_watts / usable_Wh  (fraction of usable
//            energy spent per hour — inverse of runtime).
// wattCap  = (soc / 100) * MAX_SAFE_LOAD_W  (peak draw the
//            current charge can reasonably sustain).
// voltage  = current_voltage - estimated_draw_drop. A punt
//            past UNSAFE_VOLTAGE blocks the appliance.
// ============================================================

export const computeDrainRatio = (
  watts: number,
  usableWh: number,
): number => {

  if (
    !Number.isFinite(watts) ||
    !Number.isFinite(usableWh) ||
    usableWh <= 0 ||
    watts <= 0
  ) {

    return 0;
  }

  return watts / usableWh;
};

export const computeWattCap = (
  soc: number,
): number => {

  const normalized = Math.max(
    Math.min(
      normalizeNumber(soc),
      100,
    ),
    0,
  );

  return (
    normalized / 100
  ) * MAX_SAFE_LOAD_W;
};

export const estimateVoltageDrop = (
  watts: number,
): number => {

  if (
    !Number.isFinite(watts) ||
    watts <= 0
  ) {

    return 0;
  }

  return (
    (watts / VOLTAGE_DROP_STEP_WATTS) *
    VOLTAGE_DROP_STEP_VOLTS
  );
};

// ============================================================
// 4. BADGE MAPPING
//
// The UI exposes only two badges:
//   - "OK to use"       (recommended + care)
//   - "Not advisable"   (not recommended)
//
// "Use with care" appliances are still usable, so they stay
// in the "OK to use" group in the simplified display.
// ============================================================

export const verdictToBadge = (
  verdict: Verdict,
): BadgeLabel => {

  if (
    verdict === "notRecommended"
  ) {

    return "Not advisable";
  }

  return "OK to use";
};

// ============================================================
// 5. PER-APPLIANCE RECOMMENDATION
//
//  recommended     : budget draw <= 10%/hr of usable energy
//  care            : 10-25%/hr draw, or battery in caution zone
//  notRecommended  : blocked, unsafe projected voltage, peak
//                    draw over the charge wattage cap, invalid
//                    watts, or budget draw > 25%/hr
// ============================================================

export const recommendAppliance = (
  battery: BatteryStateInput,
  appliance: ApplianceInput,
): ApplianceRecommendation => {

  const classification =
    classifyBatteryState(battery);

  const usableWh =
    classification.usableWh;

  const wattRange =
    parseWattageRange(
      appliance.wattage,
    );

  const soc =
    normalizeNumber(battery.soc);

  const minHours = wattRange
    ? estimateRuntime(
        usableWh,
        wattRange.max,
      )
    : 0;

  const midHours = wattRange
    ? estimateRuntime(
        usableWh,
        wattRange.mid,
      )
    : 0;

  const maxHours = wattRange
    ? estimateRuntime(
        usableWh,
        wattRange.min,
      )
    : 0;

  const runtime: RuntimeEstimate = {
    minHours,
    midHours,
    maxHours,
  };

  const wattCap =
    computeWattCap(soc);

  const projectedVoltage = wattRange
    ? normalizeNumber(battery.voltage) -
      estimateVoltageDrop(
        wattRange.max,
      )
    : normalizeNumber(battery.voltage);

  const drainRatio = wattRange
    ? computeDrainRatio(
        wattRange.mid,
        usableWh,
      )
    : 0;

  let verdict: Verdict;
  let reason: string;

  if (
    classification.blocked
  ) {

    verdict = "notRecommended";

    reason =
      classification.tier === "Unsafe"
        ? "Battery is unsafe — recharge before using appliances."
        : "Reserve only — no load recommended.";
  } else if (
    !wattRange
  ) {

    verdict = "notRecommended";

    reason =
      "Invalid wattage range.";
  } else if (
    projectedVoltage <=
    UNSAFE_VOLTAGE
  ) {

    verdict = "notRecommended";

    reason =
      `Peak draw ${wattRange.max}W would drop voltage to unsafe levels (${projectedVoltage.toFixed(1)}V).`;
  } else if (
    wattRange.max >
    wattCap
  ) {

    verdict = "notRecommended";

    reason =
      `Peak draw ${wattRange.max}W exceeds the ${wattCap}W cap at ${soc}% battery.`;
  } else if (
    drainRatio >
    BUDGET_CARE_MAX_RATIO
  ) {

    verdict = "notRecommended";

    reason =
      `Uses ${(drainRatio * 100).toFixed(0)}% of the usable energy per hour.`;
  } else if (
    classification.tier === "Caution"
  ) {

    verdict = "care";

    reason =
      "Battery is in the caution zone — light loads only.";
  } else if (
    drainRatio >
    BUDGET_RECOMMENDED_MAX_RATIO
  ) {

    verdict = "care";

    reason =
      `Uses a moderate ${(drainRatio * 100).toFixed(0)}% of the usable energy per hour.`;
  } else {

    verdict = "recommended";

    reason = "Safe to use.";
  }

  const displayRuntime =
    classification.blocked
      ? "—"
      : formatRuntimeLabel(
          minHours,
          maxHours,
        );

  return {
    id: appliance.id,
    name: appliance.name,
    area: appliance.area,
    wattRange,
    verdict,
    badgeLabel:
      verdictToBadge(verdict),
    tier: classification.tier,
    usableWh,
    runtime,
    displayRuntime,
    reason,
    drainRatio,
    projectedVoltage,
    wattCap,
  };
};

// ============================================================
// 6. BATCH RECOMMENDATION
//
// Sorted so the most usable appliances come first:
// recommended, then care, then not recommended.
// ============================================================

const VERDICT_RANK: Record<
  Verdict,
  number
> = {
  recommended: 0,
  care: 1,
  notRecommended: 2,
};

export const recommendAppliances = (
  battery: BatteryStateInput,
  appliances: ApplianceInput[],
): RecommendBatchResult => {

  const classification =
    classifyBatteryState(battery);

  const recommendations =
    appliances.map((appliance) =>
      recommendAppliance(
        battery,
        appliance,
      ),
    );

  recommendations.sort((left, right) => {
    const rankDiff =
      VERDICT_RANK[left.verdict] -
      VERDICT_RANK[right.verdict];

    if (
      rankDiff !== 0
    ) {

      return rankDiff;
    }

    return (
      right.runtime.midHours -
      left.runtime.midHours
    );
  });

  return {
    tier: classification.tier,
    usableWh:
      classification.usableWh,
    blocked:
      classification.blocked,
    recommendations,
  };
};

// ============================================================
// 7. MULTI-APPLIANCE (LOAD STACK) MODE
//
// Sums the mid wattages, gives one combined runtime estimate,
// flags stacks that exceed the inverter limit, and reports the
// appliance that drains the battery fastest.
//
// Reserved for a future catalog / "running together" screen;
// the simplified dashboard does not surface these numbers.
// ============================================================

export const computeLoadStack = (
  battery: BatteryStateInput,
  appliances: ApplianceInput[],
): LoadStackResult => {

  const classification =
    classifyBatteryState(battery);

  let totalMinWatts = 0;
  let totalMidWatts = 0;
  let totalMaxWatts = 0;
  let topDrain: ApplianceInput | null = null;
  let topMidWatts = -1;

  for (
    const appliance of appliances
  ) {

    const range =
      parseWattageRange(
        appliance.wattage,
      );

    if (
      !range
    ) {

      continue;
    }

    totalMinWatts += range.min;
    totalMidWatts += range.mid;
    totalMaxWatts += range.max;

    if (
      range.mid > topMidWatts
    ) {

      topMidWatts =
        range.mid;

      topDrain = appliance;
    }
  }

  const runtimeMidHours =
    classification.usableWh > 0 &&
    totalMidWatts > 0
      ? classification.usableWh /
        totalMidWatts
      : 0;

  return {
    tier: classification.tier,
    usableWh:
      classification.usableWh,
    blocked:
      classification.blocked,
    totalMinWatts,
    totalMidWatts,
    totalMaxWatts,
    runtimeMidHours,
    overLimit:
      totalMidWatts >
      MAX_SAFE_LOAD_W,
    limitWatts:
      MAX_SAFE_LOAD_W,
    topDrain,
  };
};