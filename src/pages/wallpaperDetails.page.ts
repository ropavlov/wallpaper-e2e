import { BasePage } from './base.page';

/** A single wallpaper's detail page (`/wallpapers/{uuid}`). */
export class WallpaperDetailsPage extends BasePage {
  private readonly heading = 'main h1';
  // "Premium" badge beneath the title (text-based, wording-sensitive).
  private readonly premiumBadge = 'main :text-is("Premium")';
  // Two Download buttons (mobile/desktop); only one is visible per viewport.
  private readonly downloadButton = 'main button:has-text("Download"):visible';
  // Ad-gated modal after clicking Download; its presence proves initiation.
  private readonly preparingModal = '[role="dialog"]:has-text("Preparing your download")';

  async title(): Promise<string> {
    return this.ui.el(this.heading).text();
  }

  /** True when the detail page marks this wallpaper as premium. */
  async isPremium(): Promise<boolean> {
    // Gate on the heading (SSR paint), then check the badge's PRESENCE, not
    // visibility — mobile CSS-hides the label.
    await this.ui.el(this.heading).text();
    return (await this.ui.all(this.premiumBadge)).length > 0;
  }

  /**
   * Click Download until the ad modal appears (an early click is a no-op before
   * hydration). The click is bounded so an obscured button fails fast and retries.
   * Returns whether the modal appeared.
   */
  async triggerDownload(
    attempts: number,
    modalWaitMs: number,
    clickTimeoutMs: number,
  ): Promise<boolean> {
    for (let attempt = 0; attempt < attempts; attempt++) {
      // Already open? Don't re-click (the button is now obscured).
      if (await this.ui.el(this.preparingModal).isVisible()) {
        return true;
      }
      try {
        await this.ui.el(this.downloadButton).click(clickTimeoutMs);
      } catch {
        continue; // not actionable yet — retry
      }
      if (await this.ui.appears(this.preparingModal, modalWaitMs)) {
        return true;
      }
    }
    return false;
  }
}
