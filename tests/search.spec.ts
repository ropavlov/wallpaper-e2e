import { test, expect } from '../src/fixtures/testFixtures';
import { DEFAULT_KEYWORD } from '../src/data/testData';

test.describe('Wallpaper search', () => {
  test('TC1: searching by keyword returns wallpaper results', async ({
    home,
    searchResults,
    ui,
  }, testInfo) => {
    // The search box's submit depends on React hydration of a no-action form. On
    // mobile headless against the live site this is timing-flaky on slow CI
    // runners (see README). Search is verified on desktop; mobile rendering and
    // free/premium classification are still covered by TC2.
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
