import { LocalStorage } from "@raycast/api";
import { Mode } from "./types";
import { ConnectedAirpodsData } from "./bluetooth";

const NEXT_SWITCH_MODE_KEY = "nextSwitchMode";
const LAST_COMMAND_EXECUTED_AT_KEY = "lastCommandExecutedAt";
const CACHED_BATTERY_DATA_KEY = "cachedBatteryData";

export const getNextSwitchMode = async (): Promise<Mode | undefined> => {
  return await LocalStorage.getItem<Mode>(NEXT_SWITCH_MODE_KEY);
};

export const setNextSwitchMode = async (mode: Mode): Promise<void> => {
  await LocalStorage.setItem(NEXT_SWITCH_MODE_KEY, mode);
};

export const getLastCommandExecutedAtTimestamp = async (): Promise<number | undefined> => {
  return await LocalStorage.getItem<number>(LAST_COMMAND_EXECUTED_AT_KEY);
};

export const setLastCommandExecutedAtTimestamp = async (timestamp: number): Promise<void> => {
  await LocalStorage.setItem(LAST_COMMAND_EXECUTED_AT_KEY, timestamp);
};

export const getCachedBatteryData = async (): Promise<ConnectedAirpodsData | undefined> => {
  const cached = await LocalStorage.getItem<string>(CACHED_BATTERY_DATA_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      return undefined;
    }
  }
  return undefined;
};

export const setCachedBatteryData = async (data: ConnectedAirpodsData): Promise<void> => {
  await LocalStorage.setItem(CACHED_BATTERY_DATA_KEY, JSON.stringify(data));
};
