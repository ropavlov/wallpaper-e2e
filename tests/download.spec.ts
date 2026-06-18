import { existsSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { test, expect } from '../src/fixtures/testFixtures';
import {
  ACCEPTED_IMAGE_EXTENSIONS,
  DEFAULT_KEYWORD,
  DOWNLOAD_MODAL_WAIT_MS,
  DOWNLOAD_TRIGGER_ATTEMPTS,
  DOWNLOAD_WAIT_MS,
} from '../src/data/testData';

test.describe('Download a free wallpaper', () => {
  test('TC3: downloading a free wallpaper delivers an image file (or initiates the ad-gated download)', async ({
    searchResults,
    details,
    ui,
  }, testInfo) => {
    await searchResults.openFor(DEFAULT_KEYWORD);
    await searchResults.openFirstFree();

    // Listen before triggering; trigger retries through SSR hydration.
    const pendingDownload = ui.waitForDownload(DOWNLOAD_WAIT_MS);
    const initiated = await details.triggerDownload(DOWNLOAD_TRIGGER_ATTEMPTS, DOWNLOAD_MODAL_WAIT_MS);
    const download = await pendingDownload;

    if (download) {
      // Ad served: verify the real file on disk.
      const targetPath = join(testInfo.outputDir, download.suggestedFilename || 'wallpaper');
      await download.saveAs(targetPath);

      const extension = extname(download.suggestedFilename).toLowerCase();
      expect(existsSync(targetPath)).toBe(true);
      expect(statSync(targetPath).size).toBeGreaterThan(0);
      expect(ACCEPTED_IMAGE_EXTENSIONS, `unexpected file extension: "${extension}"`).toContain(
        extension,
      );
    } else {
      // No file (ad didn't serve): assert the download was at least initiated.
      expect(
        initiated,
        'Expected either a downloaded file or the ad-gated download modal to appear',
      ).toBe(true);
    }
  });
});
