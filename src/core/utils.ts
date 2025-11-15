import { environment } from "@raycast/api";
import { parse as dotenvParse } from "dotenv";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

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

let envCache: Record<string, string> | null = null;

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
        console.log("envCache 2", envCache);
    } catch (error) {
      console.error("Failed to load .env.local file:", error);
    }
  }

  const useMockData = envCache.USE_MOCK_DATA;
  return useMockData === "true";
}
