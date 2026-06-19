import { BasePage } from './base.page';

/** A single wallpaper's detail page (`/wallpapers/{uuid}`). */
export class WallpaperDetailsPage extends BasePage {
  private readonly heading = 'main h1';
  // "Premium" badge beneath the title; text-based, so wording-sensitive.
  private readonly premiumBadge = 'main :text-is("Premium")';
  // Mobile + desktop Download buttons exist; only one is visible per viewport.
  private readonly downloadButton = 'main button:has-text("Download"):visible';
  // Ad-gated modal shown after clicking Download; its presence proves initiation.
  private readonly preparingModal = '[role="dialog"]:has-text("Preparing your download")';

  async title(): Promise<string> {
    return this.ui.el(this.heading).text();
  }

  /** True when the detail page marks this wallpaper as premium. */
  async isPremium(): Promise<boolean> {
    // Gate on the heading (SSR paint), then check the badge's PRESENCE not
    // visibility — mobile CSS-hides the label, so isVisible() is viewport-dependent.
    await this.ui.el(this.heading).text();
    return (await this.ui.all(this.premiumBadge)).length > 0;
  }

  /**
   * Click Download until it takes effect (an early click can be a no-op before
   * SSR hydration, and the button can be transiently obscured by ad/overlay),
   * retrying until the ad modal appears. The click is bounded by clickTimeoutMs
   * so an obscured button fails fast and the loop can retry. Returns whether the
   * modal appeared.
   */
  async triggerDownload(
    attempts: number,
    modalWaitMs: number,
    clickTimeoutMs: number,
  ): Promise<boolean> {
    for (let attempt = 0; attempt < attempts; attempt++) {
      // If the modal is already open, don't re-click (the button is now obscured).
      if (await this.ui.el(this.preparingModal).isVisible()) {
        return true;
      }
      try {
        await this.ui.el(this.downloadButton).click(clickTimeoutMs);
      } catch {
        continue; // button not actionable yet (un-hydrated/obscured) — retry
      }
      if (await this.ui.appears(this.preparingModal, modalWaitMs)) {
        return true;
      }
    }
    return false;
  }
}
