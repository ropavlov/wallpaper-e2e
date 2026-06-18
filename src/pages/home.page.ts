import { CONSENT_WAIT_MS } from '../data/testData';
import { BasePage } from './base.page';

/** The browse/search entry point of the portal. */
export class HomePage extends BasePage {
  private readonly browsePath = '/ringtones-and-wallpapers';
  // Two search inputs (mobile + desktop); use whichever is visible.
  private readonly searchInput = '#search:visible';

  async open(): Promise<void> {
    await this.ui.open(this.browsePath);
    await this.ui.dismissConsent(BasePage.CONSENT_ACCEPT, CONSENT_WAIT_MS);
  }

  /** Type a keyword into the search box and submit it. */
  async search(keyword: string): Promise<void> {
    await this.ui.fill(this.searchInput, keyword);
    await this.ui.press(this.searchInput, 'Enter');
    await this.ui.waitForUrl(/\/find\//);
  }
}
