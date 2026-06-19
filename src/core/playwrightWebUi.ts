import { Download, Locator, Page } from '@playwright/test';
import { DownloadInfo, UiElement, WebUi } from './webUi';

/** The ONLY module that references the browser driver. */

class PlaywrightUiElement implements UiElement {
  constructor(private readonly locator: Locator) {}

  async click(timeoutMs?: number): Promise<void> {
    await this.locator.first().click({ timeout: timeoutMs });
  }

  async text(): Promise<string> {
    return (await this.locator.first().innerText()).trim();
  }

  async isVisible(): Promise<boolean> {
    return this.locator.first().isVisible();
  }

  async attribute(name: string): Promise<string | null> {
    return this.locator.first().getAttribute(name);
  }

  async all(selector: string): Promise<UiElement[]> {
    const locators = await this.locator.locator(selector).all();
    return locators.map((locator) => new PlaywrightUiElement(locator));
  }
}

class PlaywrightDownloadInfo implements DownloadInfo {
  constructor(private readonly download: Download) {}

  get suggestedFilename(): string {
    return this.download.suggestedFilename();
  }

  async saveAs(path: string): Promise<void> {
    await this.download.saveAs(path);
  }
}

export class PlaywrightWebUi implements WebUi {
  private consentDismissed = false;

  constructor(private readonly page: Page) {}

  async open(path: string): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  currentUrl(): string {
    return this.page.url();
  }

  async fill(selector: string, value: string, timeoutMs?: number): Promise<void> {
    await this.page.locator(selector).first().fill(value, { timeout: timeoutMs });
  }

  async submitForm(selector: string): Promise<void> {
    // Submit the enclosing form directly: pressing Enter doesn't submit on WebKit,
    // and the submit button is hidden on mobile — requestSubmit works across engines.
    await this.page
      .locator(selector)
      .first()
      .evaluate((el) => {
        const form = el.closest('form');
        if (form) {
          form.requestSubmit ? form.requestSubmit() : form.submit();
        }
      });
  }

  el(selector: string): UiElement {
    return new PlaywrightUiElement(this.page.locator(selector));
  }

  async all(selector: string): Promise<UiElement[]> {
    const locators = await this.page.locator(selector).all();
    return locators.map((locator) => new PlaywrightUiElement(locator));
  }

  async urlBecomes(pattern: RegExp | string, timeoutMs: number): Promise<boolean> {
    try {
      // 'commit': the ad-heavy portal may never reach the 'load' event.
      await this.page.waitForURL(pattern, { waitUntil: 'commit', timeout: timeoutMs });
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        return false;
      }
      throw error;
    }
  }

  async waitForReady(timeoutMs: number): Promise<void> {
    try {
      await this.page.waitForLoadState('load', { timeout: timeoutMs });
    } catch {
      // Ad traffic can delay 'load' — proceed best-effort.
    }
  }

  async waitForVisible(selector: string): Promise<void> {
    await this.firstVisible(selector);
  }

  async appears(selector: string, timeoutMs: number): Promise<boolean> {
    try {
      await this.firstVisible(selector, timeoutMs);
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        return false;
      }
      throw error;
    }
  }

  async dismissConsent(selector: string, timeoutMs: number): Promise<void> {
    if (this.consentDismissed) {
      return;
    }
    if (await this.appears(selector, timeoutMs)) {
      await this.page.locator(selector).first().click();
      this.consentDismissed = true;
    }
  }

  /** Wait for the first match of a selector to be visible (optional timeout). */
  private firstVisible(selector: string, timeoutMs?: number): Promise<void> {
    return this.page.locator(selector).first().waitFor({ state: 'visible', timeout: timeoutMs });
  }

  async waitForDownload(timeoutMs: number): Promise<DownloadInfo | null> {
    // Context-level so popups/new tabs count; listener attaches before the trigger.
    try {
      const download = await this.page.context().waitForEvent('download', { timeout: timeoutMs });
      return new PlaywrightDownloadInfo(download);
    } catch {
      return null;
    }
  }
}
