import {
  CONSENT_WAIT_MS,
  NAV_WAIT_MS,
  SEARCH_INPUT_TIMEOUT_MS,
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
   * an early submit can be a no-op (or trigger a native reload that clears the
   * input); retry the fill + submit until the results page loads.
   */
  async search(keyword: string): Promise<void> {
    for (let attempt = 0; attempt < SEARCH_SUBMIT_ATTEMPTS; attempt++) {
      try {
        // Bounded so that after a reload, when the input is briefly gone, we fail
        // fast and retry instead of blocking on the default 30s fill timeout.
        await this.ui.fill(this.searchInput, keyword, SEARCH_INPUT_TIMEOUT_MS);
      } catch (error) {
        if (error instanceof Error && error.name === 'TimeoutError') {
          continue; // input not ready yet — retry
        }
        throw error;
      }
      await this.ui.submitForm(this.searchInput);
      if (await this.ui.urlBecomes(this.resultsUrl, NAV_WAIT_MS)) {
        return;
      }
    }
    throw new Error('Search did not navigate to the results page.');
  }
}
