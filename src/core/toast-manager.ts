import { showToast, Toast, closeMainWindow } from "@raycast/api";
import { MODE_LABELS } from "./consts";
import { Mode } from "./types";

/**
 * ToastManager provides a class-based approach to manage toast notifications.
 * It allows you to create a toast instance and update its state, title, and message dynamically.
 */
export class ToastManager {
  private toast: Toast | null = null;
  private mode: Mode;

  /**
   * Creates a new ToastManager instance.
   * @param mode The AirPods mode being switched to
   */
  public constructor(mode: Mode) {
    this.mode = mode;
  }

  /**
   * Shows a loading toast with animated style.
   * @param mode The AirPods mode being switched to
   * @returns The ToastManager instance for method chaining
   */
  async setToLoading(): Promise<ToastManager> {
    const style = Toast.Style.Animated;
    const title = `Setting AirPods to ${MODE_LABELS[this.mode]}...`;

    await closeMainWindow();
    if (this.toast) {
      this.toast.style = style;
      this.toast.title = title;
    } else {
      this.toast = await showToast({
        style,
        title,
      });
    }

    return this;
  }

  /**
   * Updates the toast to show success state.
   * @param title The success title
   * @param message Optional success message
   * @returns The ToastManager instance for method chaining
   */
  async setToSuccess(): Promise<ToastManager> {
    const style = Toast.Style.Success;
    const title = `AirPods set to ${MODE_LABELS[this.mode]}`;

    if (this.toast) {
      this.toast.style = style;
      this.toast.title = title;
    } else {
      this.toast = await showToast({
        style,
        title,
      });
    }

    return this;
  }

  /**
   * Updates the toast to show failure state.
   * @param title The failure title
   * @param message Optional failure message
   * @returns The ToastManager instance for method chaining
   */
  async setToFailure({ title: _title, error }: { title?: string; error?: Error }): Promise<ToastManager> {
    const style = Toast.Style.Failure;
    const title = _title ?? `Failed to set AirPods to ${MODE_LABELS[this.mode]}`;
    const message = error?.message;

    if (this.toast) {
      this.toast.style = style;
      this.toast.title = title;
      if (message) {
        this.toast.message = message;
      }
    } else {
      this.toast = await showToast({
        style,
        title,
        message,
      });
    }

    return this;
  }

  /**
   * Closes the toast.
   * @returns void
   */
  async hide(): Promise<void> {
    if (this.toast) {
      await this.toast.hide();
      this.toast = null;
    }
  }
}
