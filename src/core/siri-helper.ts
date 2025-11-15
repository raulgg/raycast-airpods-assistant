import { open, getFrontmostApplication } from "@raycast/api";
import { runAppleScript } from "@raycast/utils";
import { SIRI_PROMPTS } from "./consts";
import { Mode } from "./types";
import { delay } from "./utils";

const pressEscapeKey = async () => {
  return await runAppleScript(`
    tell application "System Events"
      key code 53
    end tell
  `);
};

const openSiri = async () => {
  return await open("/System/Applications/Siri.app");
};

/**
 * Invokes Siri and types a prompt to execute a command
 * @param prompt The text prompt to send to Siri
 */
export async function setAirPodsModeWithSiri(mode: Mode): Promise<void> {
  const siriPrompt = SIRI_PROMPTS[mode];

  const previousApp = await getFrontmostApplication();
  if (previousApp?.name === "Siri") {
    // Currently using Siri, can't use command to prevent injection of prompt in between user's input
    throw new Error("Siri already open. Please close Siri and try again.");
  }

  try {
    await openSiri();
    // Stabilization delay after Siri opened
    await delay(100);
    // Type the prompt if Siri is still open
    if ((await getFrontmostApplication())?.name === "Siri") {
      await runAppleScript(`
        tell application "System Events"
          set textToType to "${siriPrompt}"
          -- Select all text (Cmd+A)
          keystroke "a" using {command down}
          delay 0.1
          -- Delete selection
          key code 51
          delay 0.1
          -- Type new prompt
          keystroke textToType
          -- Press Return
          key code 36
        end tell
      `);
    } else {
      throw new Error("Siri not open. Please try again.");
    }
  } finally {
    await delay(1000);
    // Close Siri if it's still focused
    await pressEscapeKey();

    // Restore the previous frontmost application
    if (previousApp) {
      await open(previousApp.path);
    }
  }
}
