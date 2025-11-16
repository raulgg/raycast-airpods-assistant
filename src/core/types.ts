export type Mode = "anc" | "transparency" | "adaptive";

export interface ExtensionPreferences {
  modeOne: Mode;
  modeTwo: Mode;
}

export type RawBluetoothDeviceData = Record<string, Record<string, string>>;
