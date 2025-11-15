import { getPreferenceValues } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import { Mode, Preferences } from "./types";
import { setAirPodsModeWithSiri } from "./siri-helper";
import {
  getLastCommandExecutedAtTimestamp,
  getNextSwitchMode,
  setLastCommandExecutedAtTimestamp,
  setNextSwitchMode,
} from "./local-storage";
import { ToastManager } from "./toast-manager";
import { delay, shouldUseMockData } from "./utils";
import { isAnyAirpodsConnected } from "./bluetooth-devices";

const COMMAND_EXECUTION_DELAY_MS = 2500;

/**
 * Get the next switch mode based on the current mode and preferences
 *
 * @param currentMode The current mode
 * @param preferences User preferences
 * @returns The next mode to switch to, or null if current mode is not in preferences
 */
function getNextSwitchModeFromCurrent(currentMode: Mode, preferences: Preferences): Mode | null {
  if (currentMode === preferences.modeOne) {
    return preferences.modeTwo;
  } else if (currentMode === preferences.modeTwo) {
    return preferences.modeOne;
  }
  return null;
}

/**
 * Update nextSwitchMode in storage based on the current mode and preferences
 *
 * @param currentMode The mode that was just set
 */
async function updateNextSwitchModeFromCurrent(currentMode: Mode): Promise<void> {
  try {
    const preferences = getPreferenceValues<Preferences>();
    const nextMode = getNextSwitchModeFromCurrent(currentMode, preferences);
    if (nextMode !== null) {
      await setNextSwitchMode(nextMode);
    }
  } catch (error) {
    // Continue without updating nextSwitchMode
    console.error("Failed to update nextSwitchMode:", error);
  }
}

/**
 * Set the AirPods mode using Siri
 *
 * @param modeToActivate The mode to activate
 * @returns void
 */
export async function setAirPodsMode(modeToActivate: Mode): Promise<void> {
  const toast = new ToastManager(modeToActivate);

  try {
    // Early exit if no AirPods are connected
    const connected = await isAnyAirpodsConnected();
    if (!connected) {
      await toast.setToFailure({
        title: "AirPods not connected",
        error: new Error("Connect your AirPods to your Mac and try again."),
      });
      return;
    }

    const lastCommandExecutedAtTimestamp = await getLastCommandExecutedAtTimestamp();

    await toast.setToLoading();

    if (lastCommandExecutedAtTimestamp) {
      const timeSinceLastCommandExecuted = Date.now() - lastCommandExecutedAtTimestamp;

      if (timeSinceLastCommandExecuted < COMMAND_EXECUTION_DELAY_MS) {
        await delay(timeSinceLastCommandExecuted);
      }
    }

    // Delay to ensure keys are not pressed anymore when triggered from keyboard shortcut preventing undesired outputs
    // TODO: add checks to delay execution of command until no modifier keys are hold
    await delay(300);
    await setAirPodsModeWithSiri(modeToActivate);
    await setLastCommandExecutedAtTimestamp(Date.now());

    await updateNextSwitchModeFromCurrent(modeToActivate);

    if (shouldUseMockData()) {
      await toast.setToSuccess({ title: `Mocked: AirPods mode set to '${modeToActivate}'` });
      return;
    }
    await toast.setToSuccess();
  } catch (error) {
    await toast.setToFailure({ error: error instanceof Error ? error : undefined });
  }
}

/**
 * Switch between two noise control modes using Siri
 *
 * @returns Result string indicating the mode switched to, or null on error
 */
export async function switchAirPodsMode(): Promise<void> {
  try {
    const preferences = getPreferenceValues<Preferences>();

    // Get the current switch mode from the saved next mode
    const currentSwitchMode: Mode = (await getNextSwitchMode()) ?? preferences.modeOne;
    const nextSwitchMode = getNextSwitchModeFromCurrent(currentSwitchMode, preferences) ?? preferences.modeOne;

    await setNextSwitchMode(nextSwitchMode);

    await setAirPodsMode(currentSwitchMode);
  } catch (error) {
    console.error(error);
    await showFailureToast(error, {
      title: "Failed to set AirPods mode",
    });
  }
}
