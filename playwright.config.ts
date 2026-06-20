import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load BASE_URL from a git-ignored .env.
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
  // Serial locally (headed ad needs a focused window); parallel in CI. See README.
  fullyParallel: !!process.env.CI,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  // Cap CI concurrency so the live portal isn't overloaded; serial locally.
  workers: process.env.CI ? 3 : 1,
  reporter: [['html', { open: 'never' }], ['list']],
  // Default; the download spec overrides to 90s.
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    acceptDownloads: true,
    headless: !!process.env.CI, // headed locally, headless in CI
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  // Pick one with `--project=<name>`; no flag runs all.
  projects: [
    {
      // Real Chrome locally (ad serves the file), Chromium in CI.
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
