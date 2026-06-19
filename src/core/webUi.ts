/**
 * Driver-agnostic UI abstraction: primitives and handle interfaces only, never
 * a concrete driver type, so page objects depend on this and never the driver.
 */

/** A captured file download. */
export interface DownloadInfo {
  /** Filename the browser suggested for the download. */
  readonly suggestedFilename: string;
  /** Persist the downloaded file to the given absolute path. */
  saveAs(path: string): Promise<void>;
}

/** A handle to a single element (or the first match of a selector). */
export interface UiElement {
  /** Click the element; optionally bound the actionability wait with timeoutMs. */
  click(timeoutMs?: number): Promise<void>;
  text(): Promise<string>;
  isVisible(): Promise<boolean>;
  attribute(name: string): Promise<string | null>;
  /** Resolve all descendants matching the selector. */
  all(selector: string): Promise<UiElement[]>;
}

/** The browser surface a page object is allowed to use. */
export interface WebUi {
  open(path: string): Promise<void>;
  currentUrl(): string;
  /** Fill the field; optionally bound the wait for it to be editable with timeoutMs. */
  fill(selector: string, value: string, timeoutMs?: number): Promise<void>;
  /** Submit the form that contains the first element matching the selector. */
  submitForm(selector: string): Promise<void>;
  el(selector: string): UiElement;
  all(selector: string): Promise<UiElement[]>;
  /** True if the URL matches the pattern within timeoutMs (bounded, never hangs). */
  urlBecomes(pattern: RegExp | string, timeoutMs: number): Promise<boolean>;
  /** Best-effort wait for the page to finish loading (proceeds on timeout). */
  waitForReady(timeoutMs: number): Promise<void>;
  /** Wait until at least one element matching the selector is visible. */
  waitForVisible(selector: string): Promise<void>;
  /** True if an element matching the selector becomes visible within timeoutMs. */
  appears(selector: string, timeoutMs: number): Promise<boolean>;
  /** Dismiss the (async) consent dialog once; no-op on later calls. */
  dismissConsent(selector: string, timeoutMs: number): Promise<void>;
  /** Wait up to timeoutMs for a download (call BEFORE triggering it). */
  waitForDownload(timeoutMs: number): Promise<DownloadInfo | null>;
}
