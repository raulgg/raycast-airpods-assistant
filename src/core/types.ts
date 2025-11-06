export type Mode = "anc" | "transparency" | "adaptive";

export interface Preferences {
  modeOne: Mode;
  modeTwo: Mode;
}

export type RawBluetoothDeviceData = Record<string, Record<string, string>>;
