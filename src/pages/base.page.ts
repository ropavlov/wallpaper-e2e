import { WebUi } from '../core/webUi';

/** Base for all page objects: holds the driver-agnostic WebUi, no driver type. */
export abstract class BasePage {
  // Accept control of the async consent dialog (Didomi CMP), dismissed at each
  // entry navigation. Accepting keeps the download flow's partner scripts on.
  static readonly CONSENT_ACCEPT =
    '#didomi-notice-agree-button, button:has-text("Accept All Cookies")';

  constructor(protected readonly ui: WebUi) {}
}
