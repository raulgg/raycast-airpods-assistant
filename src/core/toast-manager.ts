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
   *
   * @param options - Options to customize the toast.
   * @param options.titleOverride - An optional title to override the default loading message.
   * @param options.titleSuffix - An optional suffix to append to the title.
   * @returns The {@link ToastManager} instance for method chaining.
   */
  async setToLoading({
    titleOverride,
    titleSuffix,
  }: { titleOverride?: string; titleSuffix?: string } = {}): Promise<ToastManager> {
    const style = Toast.Style.Animated;
    const title = titleOverride ?? `Setting AirPods to ${MODE_LABELS[this.mode]}...`;

    await closeMainWindow();
    if (this.toast) {
      this.toast.style = style;
      this.toast.title = titleSuffix ? `${title} - ${titleSuffix}` : title;
    } else {
      this.toast = await showToast({
        style,
        title,
      });
    }

    return this;
  }

  /**
   * Updates the toast to show a success state.
   *
   * @param options - Options for customizing the success toast.
   * @param options.message - An optional custom success message to display as the title.
   * @param options.messageSuffix - An optional suffix to append to the title.
   * @returns The {@link ToastManager} instance for method chaining.
   */
  async setToSuccess({
    titleOverride,
    titleSuffix,
  }: { titleOverride?: string; titleSuffix?: string } = {}): Promise<ToastManager> {
    const style = Toast.Style.Success;
    const title = titleOverride ?? `AirPods set to ${MODE_LABELS[this.mode]}`;

    if (this.toast) {
      this.toast.style = style;
      this.toast.title = titleSuffix ? `${title} - ${titleSuffix}` : title;
    } else {
      this.toast = await showToast({
        style,
        title,
      });
    }

    return this;
  }

  /**
   * Updates the toast to show a failure state.
   *
   * @param options - Options for customizing the failure toast.
   * @param options.titleOverride - An optional custom title for the failure toast.
   * @param options.titleSuffix - An optional suffix to append to the title.
   * @param options.error - An optional error object. If provided, its message will be displayed.
   * @returns The {@link ToastManager} instance for method chaining.
   */
  async setToFailure({
    titleOverride,
    titleSuffix,
    error,
  }: { titleOverride?: string; titleSuffix?: string; error?: Error } = {}): Promise<ToastManager> {
    const style = Toast.Style.Failure;
    const title = titleOverride ?? `Failed to set AirPods to ${MODE_LABELS[this.mode]}`;
    const message = error?.message;

    if (this.toast) {
      this.toast.style = style;
      this.toast.title = titleSuffix ? `${title} - ${titleSuffix}` : title;
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
