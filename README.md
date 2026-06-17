# Wallpaper Portal — Search & Download E2E Suite

End-to-end tests for the search-and-download feature of a wallpaper portal, built with
**Playwright + TypeScript**. The suite verifies three user journeys:

1. **Search** for wallpapers by keyword.
2. **Classify** results as free vs premium.
3. **Download** a free wallpaper and verify it reached disk — the download is ad-gated, so
   see [Why headed locally](#why-headed-locally-the-ad-gated-download) for how this is handled.

The site under test is referred to generically as **"the portal"**; its URL is supplied at
runtime via the `BASE_URL` environment variable and is never committed.

## Architecture

The driver is isolated to a single file. Layers depend strictly downward:

```
tests/ (specs — no selectors, no driver)
  → src/pages/ (page objects — hold selectors, no driver)
    → src/core/web-ui.ts (WebUi / UiElement — driver-agnostic interfaces)
      → src/core/playwright-web-ui.ts (the ONLY file that imports Playwright)
```

- Specs use injected page objects and `expect` only.
- Page objects keep their selectors private and depend only on the `WebUi` abstraction.
- `src/fixtures/test-fixtures.ts` is the composition root: it builds `PlaywrightWebUi`
  from Playwright's `page` and injects the page objects.

```
.
├── tests/                      search.spec.ts, free-vs-premium.spec.ts, download.spec.ts
├── src/
│   ├── core/                   web-ui.ts, playwright-web-ui.ts
│   ├── pages/                  base/home/search-results/wallpaper-details page objects
│   ├── fixtures/               test-fixtures.ts
│   └── data/                   test-data.ts
├── playwright.config.ts
├── .github/workflows/e2e.yml
├── .env.example
└── README.md
```

## Prerequisites

- Node.js 18+ (developed on Node 20/22)
- npm
- **Google Chrome installed** (for local runs). The download test runs headed in
  real Chrome — see [Why headed locally](#why-headed-locally-the-ad-gated-download).

## Install

```bash
npm ci                       # or: npm install
npx playwright install       # download browser binaries
```

## Configure the portal URL

The URL is read from `BASE_URL`. Copy the example file and fill it in (`.env` is git-ignored):

```bash
cp .env.example .env
# then edit .env and set BASE_URL=<portal url>
```

Alternatively, export it inline for a single run:

```bash
BASE_URL=<portal url> npx playwright test
```

## Run the tests

```bash
npx playwright test          # every project (headed locally, headless in CI)
```

### Choose a browser / device

The suite is configured for five projects — three desktop browsers and two mobile
emulations. With no flag, all of them run; pick one with `--project`:

```bash
npx playwright test --project=chrome          # desktop Chrome
npx playwright test --project=firefox         # desktop Firefox
npx playwright test --project=webkit          # desktop Safari
npx playwright test --project=mobile-chrome   # Pixel 5 (Android, Chromium)
npx playwright test --project=mobile-safari   # iPhone 13 (iOS, WebKit)
```

The page objects are viewport-aware (they target the *visible* search input and Download
button, and detect the premium badge by presence rather than visibility), so the same specs
run on desktop and mobile. Only `chrome` downloads the **real file** for TC3 (see below);
the other projects verify TC3 via the *download-initiated* fallback.

### Useful variants

```bash
npx playwright test --ui                     # interactive UI mode
npx playwright test tests/download.spec.ts   # a single spec
```

## Why headed locally (the ad-gated download)

The portal's free **Download** is **ad-gated**: clicking it opens a *"Preparing your
download"* modal with a ~13s countdown, and the file only begins **after an ad is served
and viewed**. Ads do not serve to a headless browser, so:

- **Locally**, the `chrome` project runs **headed, in real Chrome** (`channel: 'chrome'`),
  serially (`workers: 1`). The window is foreground, the ad serves, and TC3 downloads and
  verifies the **real file** (exists, non-zero, image extension).
- **In CI** (`CI` env set), browsers run **headless**. The ad won't serve there — and the
  `firefox`/`webkit` projects don't get the real file either — so TC3 instead asserts the
  download was **correctly initiated** (the *"Preparing your download"* modal appears), which
  proves the user-facing action works. A documented fallback, not a silent skip.

The detail page is also Next.js SSR + hydration: the Download button renders before its
click handler binds, so the suite **retries the click** until it takes effect.

Serial execution is required: with parallel headed windows, only one is foreground, so the
others' ads never register as viewed and their downloads never start.

## View the report

An HTML report is written to `playwright-report/` after each run:

```bash
npx playwright show-report
```

## Continuous integration

`.github/workflows/e2e.yml` installs dependencies and browsers and runs the suite headless
on every push/PR. Provide the portal URL through a repository secret named `BASE_URL`.

The HTML report is published to **GitHub Pages** after each run (even on failure):

- **https://ropavlov.github.io/wallpaper-e2e/**

This requires Pages to be enabled once: repo **Settings → Pages → Build and deployment →
Source: GitHub Actions**.
