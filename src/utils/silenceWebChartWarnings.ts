import { Platform } from "react-native";

/*
 * Dev-only, web-only silencing for specific, known-benign console
 * messages produced by third-party chart internals.
 *
 * react-native-svg's web `SvgTouchableMixin` (built on React Native's
 * legacy `Touchable`) is applied to data-point circles because
 * react-native-gifted-charts always attaches `onPress`/`onPressOut`
 * to them. That react-dom/RNW combo logs, in development only:
 *   - "Unknown event handler property `onStartShouldSetResponder`. …"
 *   - "Unknown event handler property `onResponder*`. …"
 *   - "Unknown event handler property `onPressOut`. …"
 *   - "TouchableMixin is deprecated. Please use Pressable."
 *
 * None of these can be disabled from the app's own props, and they do
 * not affect behavior. This module filters ONLY these exact messages,
 * on web, in dev, so the console stays readable without hiding real
 * application errors.
 */

const IGNORED_PREFIXES = [
  "Unknown event handler property `onStartShouldSetResponder`. It will be ignored.",
  "Unknown event handler property `onResponderTerminationRequest`. It will be ignored.",
  "Unknown event handler property `onResponderGrant`. It will be ignored.",
  "Unknown event handler property `onResponderMove`. It will be ignored.",
  "Unknown event handler property `onResponderRelease`. It will be ignored.",
  "Unknown event handler property `onResponderTerminate`. It will be ignored.",
  "Unknown event handler property `onPressOut`. It will be ignored.",
  "TouchableMixin is deprecated. Please use Pressable.",
] as const;

let installed = false;

function isIgnorable(firstArg: unknown): boolean {
  if (typeof firstArg !== "string") {
    return false;
  }

  const message = firstArg.startsWith("Warning: ")
    ? firstArg.slice("Warning: ".length)
    : firstArg;

  return IGNORED_PREFIXES.some(
    (prefix) =>
      message === prefix ||
      message.startsWith(prefix),
  );
}

export function silenceWebChartWarnings() {
  if (installed) {
    return;
  }

  installed = true;

  if (
    Platform.OS !== "web" ||
    typeof __DEV__ === "undefined" ||
    !__DEV__
  ) {
    return;
  }

  const originalWarn = console.warn;
  const originalError = console.error;

  console.warn = (
    ...args: Parameters<typeof console.warn>
  ): void => {
    if (isIgnorable(args[0])) {
      return;
    }

    originalWarn.apply(console, args as never);
  };

  console.error = (
    ...args: Parameters<typeof console.error>
  ): void => {
    if (isIgnorable(args[0])) {
      return;
    }

    originalError.apply(console, args as never);
  };
}