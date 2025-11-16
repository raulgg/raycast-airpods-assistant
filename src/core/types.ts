export type ListeningModes = "anc" | "transparency" | "adaptive";

export interface ExtensionPreferences {
  modeOne: ListeningModes;
  modeTwo: ListeningModes;
}

export interface BluetoothDeviceData {
  [deviceName: string]: {
    [key: string]: string | undefined;
  };
}

export interface ValidBluetoothDeviceData {
  [deviceName: string]: {
    device_address: string;
    device_minorType: string;
    device_vendorID: string;
    device_batteryLevelCase?: string;
    device_batteryLevelLeft?: string;
    device_batteryLevelRight?: string;
    device_batteryLevelMain?: string;
    [key: string]: string | undefined;
  };
}

export interface SPBluetoothData {
  controller_properties?: Record<string, unknown>;
  device_connected: BluetoothDeviceData[];
  device_not_connected: BluetoothDeviceData[];
}

type HeadphoneType = "over-ear" | "in-ear";

export interface AirpodsData {
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
}
