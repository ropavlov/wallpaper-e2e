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
    → src/core/webUi.ts (WebUi / UiElement — driver-agnostic interfaces)
      → src/core/playwrightWebUi.ts (the ONLY file that imports Playwright)
```

- Specs use injected page objects and `expect` only.
- Page objects keep their selectors private and depend only on the `WebUi` abstraction.
- `src/fixtures/testFixtures.ts` is the composition root: it builds `PlaywrightWebUi`
  from Playwright's `page` and injects the page objects.

```
.
├── tests/                      search.spec.ts, freeVsPremium.spec.ts, download.spec.ts
├── src/
│   ├── core/                   webUi.ts, playwrightWebUi.ts
│   ├── pages/                  base/home/searchResults/wallpaperDetails page objects
│   ├── fixtures/               testFixtures.ts
│   └── data/                   testData.ts
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

The page objects are viewport-aware (they target the _visible_ search input and detect the
premium badge by presence), so the specs run on desktop and mobile. Coverage is scoped to
where each journey is deterministic on slow CI runners (see
[Coverage & known limitations](#coverage--known-limitations)):

| Test                              | Projects                                |
| --------------------------------- | --------------------------------------- |
| TC1 — search box                  | `chrome`, `firefox`, `webkit` (desktop) |
| TC2 — free/premium classification | all 5 (desktop + mobile)                |
| TC3 — download                    | `chrome`                                |

### Useful variants

```bash
npx playwright test --ui                     # interactive UI mode
npx playwright test tests/download.spec.ts   # a single spec
```

## Why headed locally (the ad-gated download)

The portal's free **Download** is **ad-gated**: clicking it opens a _"Preparing your
download"_ modal with a ~13s countdown, and the file only begins **after an ad is served
and viewed**. Ads do not serve to a headless browser, so:

- **Locally**, the `chrome` project runs **headed, in real Chrome** (`channel: 'chrome'`),
  serially (`workers: 1`). The window is foreground, the ad serves, and TC3 downloads and
  verifies the **real file** (exists, non-zero, image extension).
- **In CI** (`CI` env set), the `chrome` project runs **headless**. The ad won't serve there,
  so TC3 instead asserts the download was **correctly initiated** (the _"Preparing your
  download"_ modal appears), which proves the user-facing action works.

The portal is Next.js SSR + hydration: buttons/forms render before their handlers bind, so
the suite **retries** the search submit and the Download click (each with a bounded timeout)
until they take effect — this is what keeps CI fast and stable instead of hanging.

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

## Coverage & known limitations

This suite runs against the **live production portal**, which is ad-driven and Next.js
SSR + client-hydrated. That makes two interactions inherently timing-sensitive on slow
(headless, free-tier) CI runners:

- **The ad-gated download (TC3).** The file only arrives after a served+viewed ad; the
  intermediate modal depends on the Download button's handler hydrating. Reliable on
  `chrome`; flaky across the full matrix on slow runners — so it's scoped to `chrome`.
- **The mobile search box (TC1).** The search `<form>` has no `action`, so navigation relies
  entirely on React's `onSubmit` after hydration. On mobile headless this races (Chromium
  triggers a native reload that resets hydration; WebKit needs the opposite handling), and it
  isn't deterministic even with retries on slow runners — so the search box is verified on
  desktop. Mobile is still exercised by **TC2** (which opens results by URL), proving the
  mobile layout, grid, and free/premium classification work.

These are **automation/environment limitations, not product bugs** — the features work for
real users in a real browser.

## Future improvements

- **Decouple from the live site** (the biggest win): record the portal's responses to a HAR
  and replay them (`page.routeFromHAR`), or point at a controlled/staging build. The DOM
  becomes deterministic, removing ad/hydration flakiness — the full browser×device matrix
  could then run all three journeys reliably (and TC3 could assert the real file everywhere).
- **Request stable `data-testid` hooks** from the app team to replace brittle internal
  selectors (`Card_card…` classes, the `premium*.png` background, `:text-is("Premium")`).
- **Block ad/analytics hosts for TC1/TC2** to speed them and reduce hydration jitter (kept
  enabled for TC3, whose download depends on them).
- **CI sharding** (`--shard`) for speed as the matrix grows, and **test tags**
  (`@smoke`/`@mobile`) for selective runs.
- Negative/edge cases (no-results keyword), accessibility checks (`@axe-core/playwright`),
  and a visual snapshot of the results grid.
