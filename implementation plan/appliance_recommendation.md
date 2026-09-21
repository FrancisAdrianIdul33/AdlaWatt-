# Appliance Recommendation Engine Design

## Overview

The appliance recommendation engine is a **pure calculation module** with no network calls and no React Native imports, so its logic can be verified anywhere and unit-tested in isolation. It lives in `src/services/recommendation.ts` and answers one question per appliance: *should the user run this appliance off the battery right now?*

It consumes two things:

- A **live battery reading** (SoC, terminal voltage, remaining energy, depth-of-discharge guard).
- A **wattage string** per appliance (e.g. `"35-75W"`, `"50W"`, `"15-20"`).

It produces a **verdict** (`recommended`, `care`, `notRecommended`), a projected **runtime range**, and a human-readable **reason**. The UI intentionally exposes only **two badges** so the user is never overloaded:

| Badge              | Verdicts behind it          |
|--------------------|-----------------------------|
| **OK to use**      | `recommended` and `care`    |
| **Not advisable**  | `notRecommended`            |

The engine performs the full analysis pipeline:

1. Battery tier classification (Safe / Caution / Unsafe).
2. Reserve-floor usable energy calculation.
3. Per-appliance wattage resolution and runtime estimate.
4. Recommendation verdict and reason.
5. Combined load-stack checks (reserved for a future catalog screen).

The battery the engine reasons about is the same **ZENOVA 12 V 30 Ah ×2 parallel** bank documented in `zenova_battery.md`.

---

## Battery Reference

| Item                                | Value                                   |
|-------------------------------------|-----------------------------------------|
| Battery model                       | ZENOVA 12 V 30 Ah lithium battery       |
| Battery quantity                    | 2                                       |
| Configuration                       | Parallel                                |
| Bank nominal energy                 | 720 Wh                                  |
| Energy reserve floor                | 144 Wh (20%)                            |
| Usable energy window                | 576 Wh (80%)                            |
| Minimum preferred SoC               | 20%                                     |
| Recommended normal-use cutoff       | 20% SoC / 144 Wh / 80% DoD              |
| Caution voltage boundary            | 10.65 V                                 |
| Unsafe (hard cut) voltage           | 10.60 V                                 |
| Maximum safe combined load          | 1000 W (inverter assumption)            |

### Energy calculations

```
12 V × 60 Ah = 720 Wh (nominal)
720 Wh × 0.20 = 144 Wh (reserve floor — do not spend)
720 Wh − 144 Wh = 576 Wh (usable window)
```

The reserve floor is what separates "can be spent" from "cannot be spent." Remaining energy **below 144 Wh is not spendable** without risking the battery, so the engine never budgets it into a runtime.

---

## Constants

| Constant                       | Value    | Meaning                                             |
|--------------------------------|----------|-----------------------------------------------------|
| `BATTERY_NOMINAL_WH`           | 720      | Full bank energy in watt-hours                      |
| `RESERVE_WH`                   | 144      | Protected 20% reserve floor                         |
| `CAUTION_SOC`                  | 20       | SoC at the recommended cutoff boundary              |
| `CAUTION_VOLTAGE`              | 10.65    | Voltage at/below which only light loads are allowed |
| `UNSAFE_VOLTAGE`               | 10.6     | Voltage at/below which everything is blocked        |
| `MAX_SAFE_LOAD_W`              | 1000     | Inverter-safe combined-load limit                   |
| `ALL_DAY_HOURS_LIMIT`          | 72       | Round-trip shown as "All day"                       |
| `RUNTIME_RECOMMENDED_MIN_HOURS`| 0.5      | ≥ 30 min average runtime → recommended              |
| `RUNTIME_CARE_MIN_HOURS`       | 0.1667   | ≥ 10 min average runtime → usable with care         |

---

## Battery Tier Classification

Given a live `BatteryStateInput`, the engine derives a tier that every verdict downstream depends on:

| Tier      | Meaning                                                              | Entry condition                                                                 |
|-----------|----------------------------------------------------------------------|----------------------------------------------------------------------------------|
| Safe      | Normal operation; all appliances can be evaluated                     | SoC ≥ 21% **and** remainingWh > 144 Wh **and** voltage > 10.65 V **and** no unsafe signal |
| Caution   | At the recommended cutoff boundary; light loads only                 | Any of: SoC == 20, remainingWh == 144, or voltage ≤ 10.65 V (and no unsafe signal) |
| Unsafe    | Critical signal present; block every appliance                       | DoD unsafe, or SoC < 20, or remainingWh < 144 Wh, or voltage ≤ 10.6 V             |

Rules:

- **Voltage is the harder safety signal.** A voltage at or below `UNSAFE_VOLTAGE` overrides a healthy SoC and marks the battery Unsafe.
- **DoD is a hard guard.** `dod === "Unsafe"` forces the tier to Unsafe regardless of the other numbers.
- The **usable window** is always clamped:

```
usableWh = max(remainingWh − 144, 0)
```

- A classification is **blocked** when the tier is Unsafe **or** usableWh ≤ 0.

### Unsafe reasons collected

| Signal                     | Recorded reason                                                    |
|----------------------------|-------------------------------------------------------------------|
| `dod` unsafe               | "Depth of discharge is unsafe."                                   |
| SoC below cutoff           | "Battery level is X% (below the 20% cutoff)."                     |
| Energy below reserve floor | "Remaining energy is below the 144 Wh reserve floor."             |
| Voltage critically low     | "Voltage is critically low — the harder safety signal."           |

### Caution reason

"Battery is at the recommended cutoff boundary — light loads only."

---

## Wattage Resolution

Wattage arrives as a free-form string. The engine extracts **every number** in the string and describes the appliance with a min/mid/max range:

| Input string | min | mid | max | Note                              |
|--------------|-----|-----|-----|-----------------------------------|
| `"50W"`      | 50  | 50  | 50  | Single value: all three are equal |
| `"35-75W"`   | 35  | 55  | 75  | mid = rounded average of (35+75)/2 |
| `"15-20"`    | 15  | 18  | 20  | mid = rounded average of (15+20)/2 |
| `"unknown"`  | —   | —   | —   | No digits → returns `null`        |

```
min = smallest number found
max = largest number found
mid = min === max ? min : round((min + max) / 2)
```

- Any string without digits, or where min < 1, max < 1, or max < min, resolves to `null`.
- `null` watt range is treated as **invalid wattage** and blocks the appliance.

---

## Runtime Calculation

Runtime is simple energy divided by power, using only the **usable** energy above the reserve floor:

```
usable_Wh = remaining_Wh − 144  (the 20% reserve floor)

runtime_min = usable_Wh / max_wattage   (worst case  — safety floor)
runtime_mid = usable_Wh / mid_wattage   (primary estimate)
runtime_max = usable_Wh / min_wattage   (best case  — eco)
```

Higher wattage consumes energy faster, which is why `runtime_min` uses the **maximum** wattage.

- If `usableWh` or `watts` is not finite, or either is ≤ 0, runtime is `0`.
- When the battery classification is blocked, the UI shows `"—"` instead of a runtime.

### Display formatting

| Condition                              | Label           |
|----------------------------------------|-----------------|
| high runtime ≥ 72 h                    | `All day`       |
| high runtime < 10 min                  | `<10 min`       |
| high − low ≤ 0.05 h                    | `~X hrs` (1 dp under 10 h, else 0 dp) |
| otherwise                              | `~low – high hrs` |

---

## Verdict Mapping

Each appliance gets one verdict driven by the battery tier and its mid runtime:

| Verdict         | Meaning                                                    |
|-----------------|------------------------------------------------------------|
| `recommended`   | Average draw leaves ≥ 30 minutes of runtime; battery Safe  |
| `care`          | 10–30 minutes runtime, or the battery is in the Caution zone |
| `notRecommended`| Blocked, under 10 minutes, or invalid wattage              |

### Decision ladder (checked in order)

1. Battery **blocked** (Unsafe or no usable energy) → `notRecommended`
   - Unsafe → "Battery is unsafe — recharge before using appliances."
   - Reserve-only → "Reserve only — no load recommended."
2. **Invalid wattage range** → `notRecommended` → "Invalid wattage range."
3. **midHours < 10 min** → `notRecommended` → "Under 10 minutes of runtime at the average draw."
4. Tier is **Caution** → `care` → "Battery is in the caution zone — light loads only."
5. **10–30 min** midHours → `care` → "Runtime is between 10 and 30 minutes."
6. Otherwise → `recommended` → "Safe to use."

> The order matters: the caution rule runs *before* the 10–30 minute rule, so a Caution battery with a long runtime still reports "light loads only," not a clean recommendation.

---

## Badge Mapping (UI-facing)

The engine deliberately collapses three verdicts into two badges so the UI is uncluttered:

```
verdict === "notRecommended"  →  "Not advisable"
otherwise                    →  "OK to use"
```

| Badge             | Verdicts     | User-facing meaning                                  |
|-------------------|--------------|------------------------------------------------------|
| **OK to use**     | recommended, care | The appliance can run on the existing charge      |
| **Not advisable** | notRecommended    | Do not run it right now                            |

"Use with care" appliances remain usable, so they stay grouped with "OK to use" in the simplified two-badge display.

---

## Batch Recommendation

`recommendAppliances` evaluates every appliance against the same live battery reading and sorts the results so the most usable appliances come first:

```
sort key 1: verdict rank   recommended (0) → care (1) → notRecommended (2)
sort key 2: mid runtime    highest average runtime first (within the same verdict)
```

Returned payload:

| Field           | Meaning                              |
|-----------------|--------------------------------------|
| `tier`          | Battery tier for the whole batch     |
| `usableWh`      | Spendable energy above the reserve   |
| `blocked`       | Whether the whole batch is blocked   |
| `recommendations` | Sorted per-appliance results       |

---

## Load-Stack (Multi-Appliance) Mode

`computeLoadStack` sums combined draws for a future catalog / "running together" screen. The simplified dashboard does not surface these numbers today.

| Field           | Calculation                                    |
|-----------------|------------------------------------------------|
| `totalMinWatts` | Sum of every appliance's min wattage           |
| `totalMidWatts` | Sum of every appliance's mid wattage           |
| `totalMaxWatts` | Sum of every appliance's max wattage           |
| `runtimeMidHours` | `usableWh / totalMidWatts` (0 if no valid draw) |
| `overLimit`     | `totalMidWatts > 1000 W` (inverter-safe limit)  |
| `topDrain`      | Appliance with the highest mid wattage          |

- Appliance rows that fail wattage resolution are skipped from the totals.
- This mode is the only place the 1000 W inverter assumption is applied.

---

## Display Rules

The recommendation engine feeds two screens:

1. **AppRecCard** — the dashboard recommendation carousel.
2. **Appliances screen** — the full filtered appliance grid.

Shared rules:

- Wire the engine `verdict` straight into the badge. `notRecommended` → red "Not advisable"; otherwise → primary-color "OK to use".
- **No live monitoring row yet** → fall back to the legacy wattage-only heuristic: `maxWatts < 300` means advisable. Once a monitoring row exists, the engine verdict takes over.
- Pass the live battery into the engine as:
  - `soc` ← `monitoring.battery_level`
  - `voltage` ← `monitoring.voltage`
  - `remainingWh` ← `monitoring.watt_hours`
  - `dod` ← `monitoring.dod_status`
- Keep the reason string for future detailed views, even though the current UI only renders the badge.
- Do not show runtime when the battery is blocked — display `"—"` instead.

---

## Errors to Avoid

- Do not treat `care` as `notRecommended` — those appliances remain usable ("OK to use").
- Do not spend the 144 Wh reserve floor in a runtime estimate. Runtime must come from `usable_Wh = remaining − 144`.
- Do not let a healthy SoC override a critically low voltage; voltage is the harder safety signal and forces Unsafe.
- Do not resolve wattage by taking only the first number in the string; compile min/max/mid from every digit found.
- Do not display the mid runtime as an exact number; present it as a min–max range or prose label.
- Do not reorder the decision ladder; the caution check must precede the 10–30 minute check.
- Do not expose three verdicts in the UI; the intended UX is exactly two badges.
- Do not run heavy per-appliance Supabase queries in the engine — it must stay a pure, synchronous, network-free module.

---

## References

1. `src/services/recommendation.ts` — engine source (types, constants, classification, runtime, verdict, batch, load stack).
2. `src/components/AppRecCard.tsx` — dashboard recommendation carousel consuming `recommendAppliance`.
3. `src/app/dashboard/appliances.tsx` — appliances screen consuming `recommendAppliance` with power/area/status filters.
4. `src/services/monitoringService.ts` — live battery fields (`battery_level`, `voltage`, `watt_hours`, `dod_status`) feeding the engine.
5. `src/components/forms/applianceCard.ts` — shared compact card sizing for the recommendation and appliance grids.
6. `implementation plan/zenova_battery.md` — the battery bank reference the recommendation constants mirror.