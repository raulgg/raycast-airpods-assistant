import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { environment } from "@raycast/api";
import { parse as dotenvParse } from "dotenv";

let envCache: Record<string, string> | null = null;

/**
 * Delays execution for the specified number of milliseconds.
 *
 * @param ms - The number of milliseconds to delay
 * @returns A promise that resolves after the specified delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parses a percentage value from a string.
 * Accepts strings in the format "XX%" or plain numeric strings.
 * Returns a number clamped between 0 and 100, or null if parsing fails.
 *
 * @param s - The string to parse (e.g., "50%", "75", or undefined)
 * @returns A number between 0 and 100, or null if the string cannot be parsed
 */
export function parsePercent(s: string | undefined): number | null {
  if (!s) return null;
  const match = s.match(/(\d{1,3})%/);
  if (match) {
    const value = Number(match[1]);
    if (!Number.isNaN(value)) return Math.max(0, Math.min(100, value));
  }
  const num = Number(s);
  if (!Number.isNaN(num)) return Math.max(0, Math.min(100, num));
  return null;
}

/**
 * Waits until all modifier keys are released by invoking a bundled Swift script
 * that handles polling at specified intervals until the timeout is reached.
 *
 * @param timeoutMs - Maximum time to wait in milliseconds (default: 2000ms)
 * @param pollingIntervalMs - Interval between checks in milliseconds (default: 50ms)
 * @returns true if all modifier keys are released, false if timeout is reached
 * @throws error when an unexpected error occurs while executing the Swift script
 */
export async function waitUntilAllModifierKeysReleased(
  timeoutMs: number = 2000,
  pollingIntervalMs: number = 50,
): Promise<boolean> {
  try {
    // Execute the Swift script with the polling logic to check if all modifier keys are released
    const swiftScriptPath = join(environment.assetsPath, "check-modifier-keys.swift");
    execSync(`swift "${swiftScriptPath}" ${timeoutMs} ${pollingIntervalMs}`, {
      encoding: "utf-8",
      stdio: "pipe",
    });

    return true;
  } catch (error) {
    const execError = error as { status?: number; code?: string | number };
    // Exit codes from Swift script:
    // 0 = success (keys released)
    // 1 = timeout reached
    // 2 = unexpected error in Swift script
    if (execError.status === 1) {
      return false;
    }
    throw error;
  }
}

/**
 * Determines if mock data should be used.
 * Mock data is only used in development mode when USE_MOCK_DATA is set to the string "true"
 * in the .env.local file located in the assets directory.
 *
 * To enable mock data, add to .env.local file:
 *   USE_MOCK_DATA=true
 *
 * @returns true if mock data should be used (development mode and USE_MOCK_DATA="true"), false otherwise
 */
export function shouldUseMockData(): boolean {
  if (!environment.isDevelopment) {
    return false;
  }

  // Load and cache .env.local file on first call
  if (envCache === null) {
    envCache = {};
    try {
      const envPath = join(environment.assetsPath, ".env.local");

      if (existsSync(envPath)) {
        const envContent = readFileSync(envPath, "utf-8");
        envCache = dotenvParse(envContent);
      }
    } catch (error) {
      console.error("Failed to load .env.local file:", error);
    }
  }

  const useMockData = envCache.USE_MOCK_DATA;
  return useMockData === "true";
}
