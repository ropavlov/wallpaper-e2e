import { UiElement } from '../core/webUi';
import { CONSENT_WAIT_MS } from '../data/testData';
import { BasePage } from './base.page';

/** Wallpaper results grid; classifies cards as free or premium by the crown badge. */
export class SearchResultsPage extends BasePage {
  private readonly wallpaperGridPath = '/wallpapers';
  // A result card is an anchor pointing at a wallpaper detail page.
  private readonly cardLink = 'a[href^="/wallpapers/"]';
  // Premium crown badge: `premium*.png` background-image (only reliable signal).
  private readonly premiumBadge = '[style*="premium" i]';

  /** Open the wallpaper-scoped results grid for a keyword. */
  async openFor(keyword: string): Promise<void> {
    await this.ui.open(`${this.wallpaperGridPath}?keyword=${encodeURIComponent(keyword)}`);
    await this.ui.dismissConsent(BasePage.CONSENT_ACCEPT, CONSENT_WAIT_MS);
  }

  /** All wallpaper result cards currently shown. */
  async wallpaperResults(): Promise<UiElement[]> {
    await this.ui.waitForVisible(this.cardLink);
    return this.ui.all(this.cardLink);
  }

  async freeResults(): Promise<UiElement[]> {
    return this.partition(false);
  }

  async premiumResults(): Promise<UiElement[]> {
    return this.partition(true);
  }

  /** Open the detail page of the first free result. */
  async openFirstFree(): Promise<void> {
    const [first] = await this.freeResults();
    if (!first) {
      throw new Error('No free wallpaper result was found to open.');
    }
    await this.openCard(first);
  }

  /** Open the detail page of the first premium result. */
  async openFirstPremium(): Promise<void> {
    const [first] = await this.premiumResults();
    if (!first) {
      throw new Error('No premium wallpaper result was found to open.');
    }
    await this.openCard(first);
  }

  // Navigate by href, not click: some cards' ad interstitial hijacks the click.
  private async openCard(card: UiElement): Promise<void> {
    const href = await card.attribute('href');
    if (!href) {
      throw new Error('Result card has no href to open.');
    }
    await this.ui.open(href);
  }

  private async isPremiumCard(card: UiElement): Promise<boolean> {
    return (await card.all(this.premiumBadge)).length > 0;
  }

  private async partition(premium: boolean): Promise<UiElement[]> {
    const cards = await this.wallpaperResults();
    const flags = await Promise.all(cards.map((card) => this.isPremiumCard(card)));
    return cards.filter((_, index) => flags[index] === premium);
  }
}
