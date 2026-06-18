import {
  CONSENT_WAIT_MS,
  NAV_WAIT_MS,
  PAGE_READY_WAIT_MS,
  SEARCH_SUBMIT_ATTEMPTS,
} from '../data/testData';
import { BasePage } from './base.page';

/** The browse/search entry point of the portal. */
export class HomePage extends BasePage {
  private readonly browsePath = '/ringtones-and-wallpapers';
  // Two search inputs (mobile + desktop); use whichever is visible.
  private readonly searchInput = '#search:visible';
  private readonly resultsUrl = /\/find\//;

  async open(): Promise<void> {
    await this.ui.open(this.browsePath);
    await this.ui.dismissConsent(BasePage.CONSENT_ACCEPT, CONSENT_WAIT_MS);
  }

  /**
   * Type a keyword and submit the search form. The page hydrates after SSR, so
   * an early submit can be a no-op (no navigation); retry until results load.
   */
  async search(keyword: string): Promise<void> {
    for (let attempt = 0; attempt < SEARCH_SUBMIT_ATTEMPTS; attempt++) {
      // Wait for 'load' so we submit a hydrated form (a pre-hydration submit
      // triggers a native reload that clears the input), then re-fill + submit.
      await this.ui.waitForReady(PAGE_READY_WAIT_MS);
      await this.ui.fill(this.searchInput, keyword);
      await this.ui.submitForm(this.searchInput);
      if (await this.ui.urlBecomes(this.resultsUrl, NAV_WAIT_MS)) {
        return;
      }
    }
    throw new Error('Search did not navigate to the results page.');
  }
}
