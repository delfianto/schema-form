import * as Log from "../utils/logger";

/**
 * Utility for catching errors in UI rendering components.
 */
export function wrapWithErrorBoundary<T>(fn: () => T, fallback: (error: Error) => T): T {
  try {
    return fn();
  } catch (error) {
    Log.error("Caught in ErrorBoundary:", error);
    return fallback(error instanceof Error ? error : new Error(String(error)));
  }
}
