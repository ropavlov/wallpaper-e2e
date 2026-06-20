import { test, expect } from '../src/fixtures/testFixtures';
import { DEFAULT_KEYWORD } from '../src/data/testData';

test.describe('Wallpaper search', () => {
  test('TC1: searching by keyword returns wallpaper results', async ({
    home,
    searchResults,
    ui,
  }, testInfo) => {
    // Mobile search-box submit is hydration-flaky headless on slow CI (see README);
    // verified on desktop, mobile covered by TC2.
    test.skip(
      testInfo.project.name.startsWith('mobile'),
      'Search box verified on desktop projects',
    );

    await home.open();
    await home.search(DEFAULT_KEYWORD);

    expect(ui.currentUrl()).toContain(DEFAULT_KEYWORD);

    const results = await searchResults.wallpaperResults();
    expect(results.length).toBeGreaterThanOrEqual(1);
  });
});
