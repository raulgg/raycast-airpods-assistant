import { LocalStorage } from "@raycast/api";
import type { ListeningModes } from "./types";

const NEXT_SWITCH_MODE_KEY = "nextSwitchMode";
const LAST_COMMAND_EXECUTED_AT_KEY = "lastCommandExecutedAt";

export const getNextSwitchMode = async (): Promise<ListeningModes | undefined> => {
  return await LocalStorage.getItem<ListeningModes>(NEXT_SWITCH_MODE_KEY);
};

export const setNextSwitchMode = async (mode: ListeningModes): Promise<void> => {
  await LocalStorage.setItem(NEXT_SWITCH_MODE_KEY, mode);
};

export const getLastCommandExecutedAtTimestamp = async (): Promise<number | undefined> => {
  return await LocalStorage.getItem<number>(LAST_COMMAND_EXECUTED_AT_KEY);
};

export const setLastCommandExecutedAtTimestamp = async (timestamp: number): Promise<void> => {
  await LocalStorage.setItem(LAST_COMMAND_EXECUTED_AT_KEY, timestamp);
};
