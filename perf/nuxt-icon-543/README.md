# @nuxt/icon css mode: cost of the per-icon style insert

Measurements for [nuxt/icon#543](https://github.com/nuxt/icon/issues/543). In css mode `NuxtIconCss`
inserts one `<style>` for each icon the session has not shown yet, before every other stylesheet.
Each insert is a whole-document style recalc. #543 proposes appending instead when `cssLayer` is set.

## Findings

1. Inserting before the first stylesheet costs a whole-document recalc. Appending is ~10x cheaper,
   as #543 says, **unless the document has an adopted style sheet** (`document.adoptedStyleSheets`).
   Adopted sheets sort after every `<style>`, so an appended `<style>` is still an insert into the
   middle of the cascade, and it costs as much as inserting first.
2. vue-echarts 8 adopts a style sheet for its custom element, so any app with an echarts chart is
   in case 1 even with the append fix. In our app (Nuxt UI 4, Tailwind 4, vue-echarts 8) appending
   costs the same as inserting first: 29-32 ms per icon on the phone.
3. `@property` rules make the insert-first recalc dearer (phone: 16.5 -> 17.9 ms median in the
   synthetic page; 13.5 -> 28 ms with our app's real CSS and DOM copied into the page) but do not
   affect an appended sheet.
4. Our workaround: before the app mounts, generate the CSS of every client-bundle icon with
   `@iconify/utils` `getIconCSS` (same selectors and layer as the module) into one `<style>`.
   `NuxtIconCss` scans the document's sheets once on its first client render and skips selectors it
   finds, so it never inserts again for bundled icons. Cost: one 283 KB sheet for 766 icons,
   ~40 ms to insert into the running app on the phone (once, at startup, before mount, the DOM is
   nearly empty). See `app/app/plugins/iconCss.client.ts`.

## Synthetic page (`repro.html`)

2000 elements, one icon rule in `@layer base` per insert, insert + forced style recalc
(`offsetTop`), median of 8 inserts per cell, 3 page loads per variant. Variants: `none`, `property`
(one `@property` rule in the page CSS), `adopted` (one adopted style sheet with one rule).

Phone: Samsung S21 Ultra, Chrome 155, no throttling. Median of the 3 loads, ms:

| variant | insert first | append |
|---|---:|---:|
| none | 16.5 | 2.4 |
| property | 17.9 | 2.1 |
| adopted | 14.2 | **13.8** |

Desktop: headless Chromium 153 (Playwright), Apple Silicon. Median of the 3 loads, ms:

| variant | 1x first | 1x append | 4x CPU first | 4x CPU append |
|---|---:|---:|---:|---:|
| none | 4.7 | 0.7 | 11.9 | 1.1 |
| property | 6.7 | 0.6 | 15.4 | 1.1 |
| adopted | 4.5 | **4.6** | 11.6 | **11.9** |

Raw: `results/repro-phone.jsonl`, `results/repro-desktop.jsonl`.

## Real app, phone

The account in these runs: 5032 transactions over 12 years, 166 categories (145 of them children,
131 distinct icons), 26 wallets. The three category sheets opened in `switch` list 34, 316 and 570
transactions.

Insert of one icon-style rule into the running app (1265-1293 elements), median of 7, ms
(`results/app-insert.jsonl`):

| run | insert first | append |
|---|---:|---:|
| 1 | 30.0 | 28.8 |
| 2 | 29.8 | 32.0 |
| 3 | 30.8 | 30.8 |

What isolated it: with the app's CSS and a static copy of its DOM written into `repro.html` the
append was cheap again (2 ms); adding one adopted sheet to that copy brought it back to 28-30 ms.

A Chrome trace of opening a category sheet whose child categories have icons the session had not
shown: ~9 whole-document recalcs of 1800-1900 elements, 35-55 ms each, during the slide-in, one per
new icon (`StyleRecalc` invalidations with reason `PropertyRegistration` on `<html>`).

### Before / after the workaround

Two scenarios driven over CDP with real input on the phone, on that account, interleaved runs (before,
after, before, after). `full`: 16 steps through a chain of nested drawers. `switch`: open and close
three category sheets, then the first again. Sums over the steps, ms (`results/app-scenario-*.json`):

| scenario | metric | before run 1 / 2 | after run 1 / 2 |
|---|---|---:|---:|
| full | main-thread task | 5584 / 5458 | 4555 / 4660 |
| full | style recalc | 2097 / 2149 | 888 / 842 |
| full | dropped frames | 169 / 167 | 107 / 112 |
| switch | main-thread task | 2974 / 3347 | 2379 / 2458 |
| switch | style recalc | 1195 / 1224 | 494 / 502 |
| switch | dropped frames | 108 / 116 | 83 / 77 |

Opening the three category sheets (`switch`, task / style ms):

| sheet | before run 1 | before run 2 | after run 1 | after run 2 |
|---|---:|---:|---:|---:|
| 1 | 471 / 173 | 480 / 175 | 359 / 61 | 419 / 59 |
| 2 | 536 / 218 | 594 / 221 | 404 / 57 | 393 / 60 |
| 3 | 619 / 225 | 690 / 231 | 497 / 61 | 489 / 62 |

## Re-run

```bash
node perf/nuxt-icon-543/run-desktop.mjs 3
```

```bash
ORIGIN=https://<an origin open in the phone's Chrome> node perf/nuxt-icon-543/run-phone.mjs 3
```

The phone runner needs `adb forward tcp:9222 localabstract:chrome_devtools_remote` and a tab of
`ORIGIN` open on the phone; it borrows that tab and navigates it back to `ORIGIN/dashboard`.
