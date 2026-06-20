/** Default search keyword. */
export const DEFAULT_KEYWORD = 'cars';

/** Accepted downloaded-image extensions. */
export const ACCEPTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

/** Wait for the real file after triggering download (ms, headed). */
export const DOWNLOAD_WAIT_MS = 45_000;

/** Verify the real file (headed). CI/headless can't, so it checks the modal instead. */
export const EXPECT_REAL_DOWNLOAD = !process.env.CI;

/** Per-attempt wait for the download modal (ms). */
export const DOWNLOAD_MODAL_WAIT_MS = 4_000;

/** Max Download re-clicks (no-op until onClick hydrates; budget ≈ 40s). */
export const DOWNLOAD_TRIGGER_ATTEMPTS = 10;

/** Wait for the consent dialog at entry nav (ms). */
export const CONSENT_WAIT_MS = 15_000;

/** Max search submits (covers a pre-hydration submit). */
export const SEARCH_SUBMIT_ATTEMPTS = 4;

/** Per-attempt wait for results navigation (ms). */
export const NAV_WAIT_MS = 3_000;

/** Bounded wait for the search input to be fillable (ms). */
export const SEARCH_INPUT_TIMEOUT_MS = 5_000;

/** Bounded Download-click timeout so an obscured button fails fast (ms). */
export const DOWNLOAD_CLICK_TIMEOUT_MS = 8_000;
