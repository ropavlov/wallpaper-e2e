/** Default search keyword used across the suite. */
export const DEFAULT_KEYWORD = 'cars';

/** File extensions accepted as a valid downloaded wallpaper image. */
export const ACCEPTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

/** How long to wait for the actual file after triggering the download (ms). */
export const DOWNLOAD_WAIT_MS = 45_000;

/** Per-attempt wait for the "Preparing your download" modal to appear (ms). */
export const DOWNLOAD_MODAL_WAIT_MS = 3_000;

/** Max Download (re-)clicks; covers a no-op click before SSR hydration. */
export const DOWNLOAD_TRIGGER_ATTEMPTS = 5;

/** How long to wait for the consent dialog at an entry navigation (ms). */
export const CONSENT_WAIT_MS = 15_000;
