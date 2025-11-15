import { runAppleScript } from "@raycast/utils";
import { RawBluetoothDeviceData } from "./types";
import { delay, parsePercent, shouldUseMockData } from "./utils";
import mockDevicesData from "../../mocks/bluetooth-devices.json";

type HeadphoneType = "over-ear" | "in-ear";

export type AirpodsData = {
  name: string;
  address: string;
  type: HeadphoneType;
  batteryLevel:
    | {
        left: number | null;
        right: number | null;
        case: number | null;
      }
    | number
    | null;
  isConnected: boolean;
};

const APPLE_VENDOR_ID = "0x004C";
const HEADPHONES_MINOR_TYPE = "Headphones";

/**
 * Fetches all Bluetooth device data from the system using system_profiler.
 *
 * @returns A promise that resolves to an array of Bluetooth device records
 * @internal
 */
async function getdBluetoothDevicesData(): Promise<Array<Record<string, RawBluetoothDeviceData[]>>> {
  if (shouldUseMockData()) {
    console.log("🧪 Development mode: Using mocked Bluetooth data (USE_MOCK_DATA is set)");
    await delay(1000);
    return mockDevicesData.SPBluetoothDataType as unknown as Array<Record<string, RawBluetoothDeviceData[]>>;
  }

  // Use system_profiler to fetch Bluetooth info; AppleScript runs shell to avoid extra deps
  const rawBluetoothDeviceData = await runAppleScript(`
    return do shell script "/usr/sbin/system_profiler SPBluetoothDataType -json"
  `);

  return JSON.parse(rawBluetoothDeviceData).SPBluetoothDataType ?? [];
}

/**
 * Checks if a Bluetooth device is an AirPods device by examining its vendor ID, minor type, and name.
 *
 * @param device - The raw Bluetooth device data to check
 * @returns true if the device matches AirPods identification criteria
 * @internal
 */
function isAirpodsDevice(device: RawBluetoothDeviceData): boolean {
  const deviceName = Object.keys(device)[0];
  const deviceMinorType = device[deviceName].device_minorType;
  const deviceVendorId = device[deviceName].device_vendorID;

  if (deviceVendorId !== APPLE_VENDOR_ID) {
    return false;
  }

  if (deviceMinorType !== HEADPHONES_MINOR_TYPE) {
    return false;
  }

  // Weak check on the device name to filter out Beats headphones and other Apple headphones.
  // Is not bulletproof since the devices names could be updated to include "airpods" in their name.
  if (!deviceName.toLowerCase().includes("airpods")) {
    return false;
  }

  return true;
}

/**
 * Parses raw Bluetooth device data and filters for AirPods, extracting battery information.
 *
 * @param devices - Array of raw Bluetooth device data
 * @param isConnected - Whether these devices are currently connected
 * @returns Array of parsed AirPods data with battery levels
 * @internal
 */
function parseAirpodsDevices(devices: RawBluetoothDeviceData[], isConnected: boolean): AirpodsData[] {
  return devices
    .filter((device: RawBluetoothDeviceData) => isAirpodsDevice(device))
    .map((device: RawBluetoothDeviceData) => {
      const name = Object.keys(device)[0];
      const deviceData = device[name];

      const singleBatteryLevel = deviceData.device_batteryLevel ? parsePercent(deviceData.device_batteryLevel) : null;

      let leftBatteryLevel = null;
      let rightBatteryLevel = null;
      let caseBatteryLevel = null;
      if (!singleBatteryLevel) {
        leftBatteryLevel = parsePercent(deviceData.device_batteryLevelLeft);
        rightBatteryLevel = parsePercent(deviceData.device_batteryLevelRight);
        caseBatteryLevel = parsePercent(deviceData.device_batteryLevelCase);
      }

      return {
        name,
        address: deviceData.device_address,
        isConnected,
        type: !deviceData.device_caseVersion ? "over-ear" : "in-ear",
        batteryLevel: singleBatteryLevel || {
          left: leftBatteryLevel,
          right: rightBatteryLevel,
          case: caseBatteryLevel,
        },
      };
    });
}

/**
 * Gets data for AirPods that are currently connected to the Mac.
 *
 * @returns A promise that resolves to an array of connected AirPods data
 */
export async function getConnectedAirpodsData(): Promise<AirpodsData[]> {
  const devicesData = await getdBluetoothDevicesData();
  const connectedDevices = devicesData[0].device_connected ?? [];
  return parseAirpodsDevices(connectedDevices, true);
}

/**
 * Gets data for paired AirPods that are within Bluetooth range, whether currently connected or not.
 *
 * @returns A promise that resolves to an array of available AirPods data
 */
export async function getAvailableAirpodsData(): Promise<AirpodsData[]> {
  const devicesData = await getdBluetoothDevicesData();
  const connectedDevices = devicesData[0].device_connected ?? [];
  const notConnectedDevices = devicesData[0].device_not_connected ?? [];

  const connectedAirpods = parseAirpodsDevices(connectedDevices, true);
  const notConnectedAirpods = parseAirpodsDevices(notConnectedDevices, false);

  return [...connectedAirpods, ...notConnectedAirpods];
}

/**
 * Checks if any AirPods are currently connected to the Mac.
 *
 * @returns A promise that resolves to true if at least one AirPods device is connected
 */
export async function isAnyAirpodsConnected(): Promise<boolean> {
  const connectedAirpods = await getConnectedAirpodsData();
  return connectedAirpods.length > 0;
}
