import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load BASE_URL from a local, git-ignored .env file.
dotenv.config();

const baseURL = process.env.BASE_URL;
if (!baseURL) {
  throw new Error(
    'BASE_URL is not set. Copy .env.example to .env and set BASE_URL to the portal URL, ' +
      'or export BASE_URL in the environment.',
  );
}

export default defineConfig({
  testDir: './tests',
  // Local: serial — the ad-gated download needs its headed window focused for the
  // ad to register. CI: headless (no real ad → "initiated" branch), so run in
  // parallel for speed. See README.
  fullyParallel: !!process.env.CI,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  // CI: a few parallel workers (cap concurrency so the live portal isn't
  // overloaded); local: serial for the headed ad-gated download.
  workers: process.env.CI ? 3 : 1,
  reporter: [['html', { open: 'never' }], ['list']],
  // Generous timeout: the free download is gated behind a ~13s ad countdown.
  timeout: 90_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    acceptDownloads: true,
    headless: !!process.env.CI, // headed locally, headless in CI
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  // Pick a browser with `npx playwright test --project=<name>`; no flag runs all.
  projects: [
    {
      // Real Chrome locally (ad serves the file), Chromium in CI. See README.
      name: 'chrome',
      use: { ...devices['Desktop Chrome'], channel: process.env.CI ? undefined : 'chrome' },
    },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    // Mobile emulation: Android (Chromium) and iOS (WebKit).
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'], channel: process.env.CI ? undefined : 'chrome' },
    },
    { name: 'mobile-safari', use: { ...devices['iPhone 13'] } },
  ],
});
