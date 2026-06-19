import { existsSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { test, expect } from '../src/fixtures/testFixtures';
import {
  ACCEPTED_IMAGE_EXTENSIONS,
  DEFAULT_KEYWORD,
  DOWNLOAD_CLICK_TIMEOUT_MS,
  DOWNLOAD_MODAL_WAIT_MS,
  DOWNLOAD_TRIGGER_ATTEMPTS,
  DOWNLOAD_WAIT_MS,
  EXPECT_REAL_DOWNLOAD,
} from '../src/data/testData';

test.describe('Download a free wallpaper', () => {
  test('TC3: downloading a free wallpaper delivers an image file (or initiates the ad-gated download)', async ({
    searchResults,
    details,
    ui,
  }, testInfo) => {
    // The download is ad-gated and its modal/file depend on slow ad+hydration
    // timing, which isn't reliable across all browsers on slow CI runners (see
    // README). Verified on chrome (real file locally, initiated in CI).
    test.skip(testInfo.project.name !== 'chrome', 'Download verified on the chrome project');

    await searchResults.openFor(DEFAULT_KEYWORD);
    await searchResults.openFirstFree();

    // Headed runs: attach the download listener before triggering, to capture
    // the ad-served file. CI/headless: no file comes, so skip the wait entirely.
    // triggerDownload retries the (bounded) click through SSR hydration.
    const pendingDownload = EXPECT_REAL_DOWNLOAD ? ui.waitForDownload(DOWNLOAD_WAIT_MS) : null;
    const initiated = await details.triggerDownload(
      DOWNLOAD_TRIGGER_ATTEMPTS,
      DOWNLOAD_MODAL_WAIT_MS,
      DOWNLOAD_CLICK_TIMEOUT_MS,
    );
    const download = pendingDownload ? await pendingDownload : null;

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
      // CI/headless (or a no-show ad): assert the download was initiated.
      expect(
        initiated,
        'Expected either a downloaded file or the ad-gated download modal to appear',
      ).toBe(true);
    }
  });
});
