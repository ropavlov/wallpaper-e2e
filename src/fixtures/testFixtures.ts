import { test as base, expect } from '@playwright/test';
import { PlaywrightWebUi } from '../core/playwrightWebUi';
import { WebUi } from '../core/webUi';
import { HomePage } from '../pages/home.page';
import { SearchResultsPage } from '../pages/searchResults.page';
import { WallpaperDetailsPage } from '../pages/wallpaperDetails.page';

/** Composition root: builds PlaywrightWebUi and injects page objects into specs. */
type Fixtures = {
  ui: WebUi;
  home: HomePage;
  searchResults: SearchResultsPage;
  details: WallpaperDetailsPage;
};

export const test = base.extend<Fixtures>({
  ui: async ({ page }, use) => {
    await use(new PlaywrightWebUi(page));
  },
  home: async ({ ui }, use) => {
    await use(new HomePage(ui));
  },
  searchResults: async ({ ui }, use) => {
    await use(new SearchResultsPage(ui));
  },
  details: async ({ ui }, use) => {
    await use(new WallpaperDetailsPage(ui));
  },
});

export { expect };
