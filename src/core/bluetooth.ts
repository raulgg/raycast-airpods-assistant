import { runAppleScript } from "@raycast/utils";
import { RawBluetoothDeviceData } from "./types";
import { parsePercent } from "./utils";

/**
 * Represents AirPods device data with battery information.
 */
export type ConnectedAirpodsData = {
  name: string;
  address: string;
  batteryLevelCase: number | null;
  batteryLevelLeft: number;
  batteryLevelRight: number;
};

/**
 * Fetches all Bluetooth device data from the system using system_profiler.
 * @returns A promise that resolves to an array of Bluetooth device records
 * @internal
 */
async function getConnectedBluetoothDevicesData(): Promise<Array<Record<string, RawBluetoothDeviceData[]>>> {
  // Use system_profiler to fetch Bluetooth info; AppleScript runs shell to avoid extra deps
  const rawBluetoothDeviceData = await runAppleScript(`
    return do shell script "/usr/sbin/system_profiler SPBluetoothDataType -json"
  `);
  return JSON.parse(rawBluetoothDeviceData)["SPBluetoothDataType"] ?? {};
}

/**
 * Checks if a Bluetooth device is an AirPods device by examining its name.
 * @param device - The raw Bluetooth device data to check
 * @returns True if the device name contains "airpods" (case-insensitive)
 * @internal
 */
function isAirPodsName(device: RawBluetoothDeviceData): boolean {
  return Object.keys(device).some((key) => key.toLowerCase().includes("airpods"));
}

/**
 * Parses raw Bluetooth device data and filters for AirPods, extracting battery information.
 * @param devices - Array of raw Bluetooth device data
 * @returns Array of parsed AirPods data with battery levels
 * @internal
 */
function parseAirpodsDevices(devices: RawBluetoothDeviceData[]): ConnectedAirpodsData[] {
  return devices
    .filter((device: RawBluetoothDeviceData) => isAirPodsName(device))
    .map((device: RawBluetoothDeviceData) => {
      const name = Object.keys(device)[0];
      const deviceData = device[name];
      return {
        name,
        address: deviceData.device_address,
        batteryLevelCase: deviceData.device_batteryLevelCase ? parsePercent(deviceData.device_batteryLevelCase) : null,
        batteryLevelLeft: parsePercent(deviceData.device_batteryLevelLeft),
        batteryLevelRight: parsePercent(deviceData.device_batteryLevelRight),
      };
    });
}

/**
 * Gets data for AirPods that are currently connected to the Mac.
 * @returns A promise that resolves to an array of connected AirPods data
 * @example
 * ```typescript
 * const airpods = await getConnectedAirpodsData();
 * if (airpods.length > 0) {
 *   console.log(`Battery: ${airpods[0].batteryLevelLeft}%`);
 * }
 * ```
 */
export async function getConnectedAirpodsData(): Promise<ConnectedAirpodsData[]> {
  const devicesData = await getConnectedBluetoothDevicesData();
  const connectedDevices = devicesData[0].device_connected ?? [];
  return parseAirpodsDevices(connectedDevices);
}

/**
 * Gets data for AirPods that are within Bluetooth range, whether connected or not.
 * This includes both connected devices and devices that are nearby but not actively connected.
 * @returns A promise that resolves to an array of available AirPods data
 * @example
 * ```typescript
 * const airpods = await getAvailableAirpodsData();
 * if (airpods.length > 0) {
 *   console.log(`Found ${airpods[0].name} with ${airpods[0].batteryLevelCase}% case battery`);
 * }
 * ```
 */
export async function getAvailableAirpodsData(): Promise<ConnectedAirpodsData[]> {
  const devicesData = await getConnectedBluetoothDevicesData();
  const connectedDevices = devicesData[0].device_connected ?? [];
  const notConnectedDevices = devicesData[0].device_not_connected ?? [];
  const allDevices = [...connectedDevices, ...notConnectedDevices];
  return parseAirpodsDevices(allDevices);
}

/**
 * Checks if any AirPods are currently connected to the Mac.
 * @returns A promise that resolves to true if at least one AirPods device is connected
 * @example
 * ```typescript
 * if (await isAnyAirpodsConnected()) {
 *   console.log("AirPods are connected!");
 * }
 * ```
 */
export async function isAnyAirpodsConnected(): Promise<boolean> {
  const connectedAirpods = await getConnectedAirpodsData();
  return connectedAirpods.length > 0;
}
