import { showToast, Toast, closeMainWindow } from "@raycast/api";
import { MODE_LABELS } from "./consts";
import { Mode } from "./types";

/**
 * ToastManager provides a class-based approach to manage toast notifications.
 * It allows you to create a toast instance and update its state, title, and message dynamically.
 */
export class ToastManager {
  private toast: Toast | null = null;

  /**
   * Shows a loading toast with animated style.
   * @param mode The AirPods mode being switched to
   * @returns The ToastManager instance for method chaining
   */
  async setToLoading(mode: Mode): Promise<ToastManager> {
    await closeMainWindow();
    this.toast = await showToast({
      style: Toast.Style.Animated,
      title: `Setting AirPods to ${MODE_LABELS[mode]}...`,
    });
    return this;
  }

  /**
   * Updates the toast to show success state.
   * @param title The success title
   * @param message Optional success message
   * @returns The ToastManager instance for method chaining
   */
  async setToSuccess(mode: Mode): Promise<ToastManager> {
    if (this.toast) {
      this.toast.style = Toast.Style.Success;
      this.toast.title = `AirPods set to ${MODE_LABELS[mode]}`;
    }
    return this;
  }

  /**
   * Updates the toast to show failure state.
   * @param title The failure title
   * @param message Optional failure message
   * @returns The ToastManager instance for method chaining
   */
  async setToFailure(mode: Mode, error?: Error): Promise<ToastManager> {
    if (this.toast) {
      this.toast.style = Toast.Style.Failure;
      this.toast.title = `Failed to set AirPods to ${MODE_LABELS[mode]}`;
      if (error) {
        this.toast.message = error.message;
      }
    }
    return this;
  }
}
