import { test, expect } from '../src/fixtures/test-fixtures';
import { DEFAULT_KEYWORD } from '../src/data/test-data';

test.describe('Free vs premium classification', () => {
  test('TC2: results contain free items and grid classification matches the detail page', async ({
    searchResults,
    details,
  }) => {
    await searchResults.openFor(DEFAULT_KEYWORD);

    const free = await searchResults.freeResults();
    expect(free.length).toBeGreaterThanOrEqual(1);

    // A card classified free in the grid must not be premium on its detail page.
    await searchResults.openFirstFree();
    expect(await details.isPremium()).toBe(false);

    await searchResults.openFor(DEFAULT_KEYWORD);
    const premium = await searchResults.premiumResults();
    expect(premium.length).toBeGreaterThanOrEqual(1);

    // A card classified premium in the grid must be premium on its detail page.
    await searchResults.openFirstPremium();
    expect(await details.isPremium()).toBe(true);
  });
});
