import { test, expect } from '../src/fixtures/test-fixtures';
import { DEFAULT_KEYWORD } from '../src/data/test-data';

test.describe('Wallpaper search', () => {
  test('TC1: searching by keyword returns wallpaper results', async ({ home, searchResults, ui }) => {
    await home.open();
    await home.search(DEFAULT_KEYWORD);

    expect(ui.currentUrl()).toContain(DEFAULT_KEYWORD);

    const results = await searchResults.wallpaperResults();
    expect(results.length).toBeGreaterThanOrEqual(1);
  });
});
