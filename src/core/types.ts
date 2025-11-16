export type ListeningModes = "anc" | "transparency" | "adaptive";

export interface ExtensionPreferences {
  modeOne: ListeningModes;
  modeTwo: ListeningModes;
}

export type RawBluetoothDeviceData = Record<string, Record<string, string>>;
