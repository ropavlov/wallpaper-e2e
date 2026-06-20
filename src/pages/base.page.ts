import { WebUi } from '../core/webUi';

/** Base page object: holds the WebUi, never the driver. */
export abstract class BasePage {
  // Consent dialog (Didomi) accept button. Accepting keeps download's partner scripts on.
  static readonly CONSENT_ACCEPT =
    '#didomi-notice-agree-button, button:has-text("Accept All Cookies")';

  constructor(protected readonly ui: WebUi) {}
}
