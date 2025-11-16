import { LocalStorage } from "@raycast/api";
import type { Mode } from "./types";

const NEXT_SWITCH_MODE_KEY = "nextSwitchMode";
const LAST_COMMAND_EXECUTED_AT_KEY = "lastCommandExecutedAt";

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
