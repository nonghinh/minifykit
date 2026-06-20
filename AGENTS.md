# AGENTS.md

Guide for AI coding agents (and humans) working on MinifyKit.

## 1. Project overview

MinifyKit is a small multi-page web app that runs **entirely in the browser** to:

- **Minify** JavaScript and CSS.
- **Beautify / format** JSON, HTML, and CSS.

Design goals:

- Zero backend, zero database, zero auth.
- No user data leaves the browser — no logging, no analytics, no `localStorage` for user code.
- **One route per tool** for SEO and easy linking from search results / AI assistants.
- Small, predictable per-page bundle (processors are dynamically imported so `/format-json` doesn't ship terser).
- shadcn-inspired UI, but implemented with **plain Tailwind utility classes**. No React, no Radix.

## 2. Tech stack

| Layer            | Choice                                  | Notes |
| ---------------- | --------------------------------------- | ----- |
| Framework        | [Astro](https://astro.build) `^6.4`     | Static site, island architecture |
| Styling          | Tailwind CSS `v4` via `@tailwindcss/vite` | No `tailwind.config.js` — theme is declared inline in `src/styles/global.css` with `@theme {}` |
| Interactive JS   | Vanilla TypeScript                      | A single client island in `src/scripts/tool-app.ts`, instantiated by every tool page |
| Minify JS        | `terser`                                | Lazy-loaded only on `/minify-js` |
| Minify CSS       | `csso`                                  | Lazy-loaded only on `/minify-css` |
| Format JSON      | Built-in `JSON.parse` + `JSON.stringify` | Zero extra weight |
| Format HTML/CSS  | `js-beautify`                           | Lazy-loaded; chunk shared between the two pages |
| Editor (format pages only) | `codemirror` 6 + `@codemirror/lang-{json,html,css}` + `@codemirror/theme-one-dark` | Lazy-loaded after `requestIdleCallback`; replaces the textarea on `/format-*` pages once idle. Minify pages stay plain textarea. |
| SEO              | `@astrojs/sitemap`                      | Generates `sitemap-index.xml` at build time |
| Deploy target    | Cloudflare Pages (any static host works) | |

Node 20+ recommended.

## 3. Routes

| Path           | Page file                       | What it is |
| -------------- | ------------------------------- | ---------- |
| `/`            | `src/pages/index.astro`         | Landing / hub. H1, intro, grid of cards linking to each tool |
| `/minify-js`   | `src/pages/minify-js.astro`     | Minify JavaScript with terser |
| `/minify-css`  | `src/pages/minify-css.astro`    | Minify CSS with csso |
| `/format-json` | `src/pages/format-json.astro`   | Format / validate JSON |
| `/format-html` | `src/pages/format-html.astro`   | Beautify HTML with js-beautify |
| `/format-css`  | `src/pages/format-css.astro`    | Beautify CSS with js-beautify |

Each tool page passes its `toolId` to the shared `<ToolApp>` component, which renders the topbar, tabs (as navigation links), action buttons, and the input/output panels.

`sitemap-index.xml`, `sitemap-0.xml`, and `robots.txt` ship at the site root automatically.

## 4. Directory layout

```
.
├── astro.config.mjs              # Astro + Tailwind Vite plugin + sitemap
├── tsconfig.json                 # Strict, with `~/*` → `src/*` alias
├── package.json
├── public/
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro      # <html>, <head>, theme bootstrap, per-page <title>/meta/canonical/OG
│   ├── pages/
│   │   ├── index.astro           # Landing hub
│   │   ├── minify-js.astro       # One thin page per tool
│   │   ├── minify-css.astro
│   │   ├── format-json.astro
│   │   ├── format-html.astro
│   │   └── format-css.astro
│   ├── components/
│   │   └── ToolApp.astro         # Topbar + tool UI; takes `toolId` prop
│   ├── scripts/
│   │   └── tool-app.ts           # Client island: reads tool id from `data-tool-id`, dynamic-imports processor
│   ├── lib/
│   │   ├── processors/
│   │   │   ├── types.ts          # ToolId, ToolMeta, TOOLS registry, getTool()
│   │   │   ├── minify-js.ts      # terser wrapper
│   │   │   ├── minify-css.ts     # csso wrapper
│   │   │   ├── format-json.ts    # built-in JSON pretty-print
│   │   │   ├── format-html.ts    # js-beautify.html
│   │   │   ├── format-css.ts     # js-beautify.css
│   │   │   └── index.ts          # loadProcessor(id) — dynamic import; re-exports
│   │   ├── validators/
│   │   │   └── index.ts          # validate(toolId, input) — used for live input feedback
│   │   └── utils/
│   │       └── bytes.ts          # byteLength, formatBytes, reductionPercent
│   └── styles/
│       └── global.css            # Tailwind import + CSS variables for themes
├── AGENTS.md
└── README.md
```

### Why this split

- `src/pages/*.astro` are **thin shells**. Each one just imports `BaseLayout` + `ToolApp` and passes a tool id. The reason there are 5 pages instead of 1 is SEO: each page gets its own URL, `<title>`, `<meta description>`, `<link rel="canonical">`, OG tags, and H1 — that's how Google and AI crawlers identify what the page is about.
- `lib/processors/*` knows nothing about the DOM. Each module exports a single async function `(input: string) => Promise<string>` and throws on bad input. Trivial to unit-test or swap.
- `lib/processors/index.ts::loadProcessor(id)` uses **dynamic `import()`** so Vite code-splits each processor into its own chunk. The big libs (terser, csso, js-beautify) only download on the pages that need them.
- `lib/processors/types.ts` is the **single source of truth** for the tool list — id, slug, label, SEO title/description, intro paragraph. Adding a tab in two places is a bug.
- `components/ToolApp.astro` is **static HTML** with `data-*` hooks. No reactive framework. The currently-active tab is determined server-side from the URL.
- `scripts/tool-app.ts` is the **only** client-side bundle the tool pages ship at initial load (~11 KB). The processor chunks and CodeMirror are dynamic-imported on demand.
- `scripts/editor.ts` adapts CodeMirror to our textarea contract: it hides the textarea, mounts CM into the same frame, and bidirectionally mirrors changes. It is only loaded on `/format-*` pages and only after `requestIdleCallback` fires, so it doesn't touch first paint or LCP. The textarea remains the source of truth — `value` reads still work for any code that doesn't know about the editor.

## 5. Conventions

### File naming
- `kebab-case.ts` and `kebab-case.astro` for modules and pages (matches the URL slug).
- `PascalCase.astro` for shared components and layouts.
- One processor per file, named after its tool id (`minify-js.ts`, `format-html.ts`, …).

### Module shape
- Processor modules export a single named async function whose name matches the file: `minifyJs`, `formatHtml`, etc. No default exports.
- Processors **throw** on invalid input. The UI layer catches and renders the message — processors should not return error sentinels.
- Validators (live input feedback) are intentionally narrow. JSON uses `JSON.parse`; JS uses the `Function` constructor (parse only, never executes). CSS/HTML aren't validated live because their parsers are too forgiving for the signal to be useful — the hard error from the processor on Process click is the source of truth instead.
- The DOM script (`tool-app.ts`) only uses `data-*` attribute selectors, never IDs or class selectors (except where unavoidable like `<label for>`). This keeps Tailwind class churn from breaking JS.

### Styling
- Use Tailwind utilities directly in Astro templates. No `@apply`, no custom component classes.
- Light/dark colors via Tailwind's `dark:` variant. The `dark` class is toggled on `<html>` and persisted in `localStorage` under key `mk-theme` (this is the only allowed `localStorage` use — see §8).
- Spacing scale: stick to Tailwind defaults (`gap-2`, `p-4`, `py-1.5`, …).
- Rounded corners: `rounded-md` for buttons/inputs, `rounded-lg` for cards.
- Buttons: solid (`bg-slate-900 text-slate-50`) for the primary action, outline (`border border-slate-200 bg-white`) for secondary. Always include `cursor-pointer` — Tailwind v4 no longer applies it by default.
- Shadows: stop at `shadow-sm` for cards, `shadow-xl` only for floating elements (toasts).

### TypeScript
- `strict` is on. Don't disable it locally; fix the type instead.
- Use the `~/...` path alias for cross-folder imports (`import { TOOLS } from "~/lib/processors"`).

## 6. Common commands

```bash
npm install        # install deps
npm run dev        # start dev server (default :4321)
npm run build      # build static site to dist/
npm run preview    # preview the built site
npm run astro -- <cmd>   # invoke the Astro CLI directly
```

There is no test runner yet. Processor modules are pure enough that adding Vitest later is straightforward — wire it under `npm test` if you do.

## 7. Adding a new tool (e.g. minify SQL, format YAML)

Each step is mechanical because the page list, navigation tabs, and landing-page cards are all generated from the same `TOOLS` registry.

1. **Create the processor** at `src/lib/processors/<id>.ts`:

   ```ts
   // src/lib/processors/format-yaml.ts
   import yaml from "some-yaml-lib";
   export async function formatYaml(input: string): Promise<string> {
     const data = yaml.parse(input);  // throws on bad input — perfect
     return yaml.stringify(data, { indent: 2 });
   }
   ```

2. **Register the tool** in `src/lib/processors/types.ts`:

   - Add the new id to the `ToolId` union.
   - Push a `ToolMeta` entry into `TOOLS` with: `id`, `slug` (must match the page route), `label`, `shortLabel`, `kind`, `placeholder`, SEO `title`, `description`, and human-readable `intro` paragraph.

3. **Wire the processor** in `src/lib/processors/index.ts`'s `loadProcessor(id)`:

   ```ts
   case "format-yaml":
     return (await import("./format-yaml")).formatYaml;
   ```

   Keep this as `case` + dynamic import — that's what makes Vite code-split it into its own chunk.

4. **Create the page** at `src/pages/<slug>.astro` (3 files all look the same — copy `format-json.astro` and change the id):

   ```astro
   ---
   import BaseLayout from "~/layouts/BaseLayout.astro";
   import ToolApp from "~/components/ToolApp.astro";
   import { getTool } from "~/lib/processors";
   const tool = getTool("format-yaml");
   ---
   <BaseLayout title={tool.title} description={tool.description}>
     <ToolApp toolId={tool.id} />
   </BaseLayout>
   ```

5. *(Optional)* **Add a validator** in `src/lib/validators/index.ts` if you can cheaply detect bad syntax. Skip if the parser is too forgiving (CSS/HTML-style).

   *(Optional)* **Add a CodeMirror language** in `src/scripts/editor.ts`: extend the `EditorLang` union, add a case in `loadLangExtension()`, and add the mapping in `LANG_BY_TOOL`. Install the corresponding `@codemirror/lang-*` package. The editor is auto-loaded for any tool whose id is mapped.

6. *(Optional)* **Add an icon** for the landing-page card in `src/pages/index.astro`'s `ICONS` map. Reuse an existing one if it fits.

7. **Install the lib** if needed: `npm install some-yaml-lib`.

8. Run `npm run dev`. The new tab appears on every tool's topbar, the landing page shows a new card, and the new route is included in `sitemap-0.xml` automatically — none of those lists are duplicated anywhere; they all come from `TOOLS`.

## 8. Constraints — do not violate

- **No backend.** No API routes, no Astro server endpoints, no SSR. Output must stay `mode: "static"`.
- **No persistence of user code.** Never write input/output to `localStorage`, `IndexedDB`, cookies, or any network endpoint. The only allowed `localStorage` key is `mk-theme` for dark-mode preference.
- **No analytics / telemetry / external fetches at runtime.** The only network request the app makes is the optional Inter font from `rsms.me` — feel free to self-host it if you want full offline use.
- **Keep per-page bundles lean.** The whole reason `loadProcessor` uses dynamic imports is so `/format-json` doesn't ship terser (~200 KB gzipped) it never uses. If you add a heavy lib, make sure it lives behind a dynamic import inside `loadProcessor`.
- **No React / no Radix / no shadcn package.** The UI is intentionally vanilla.
- **Tailwind v4 has no `tailwind.config.js`** — configure tokens via `@theme {}` in `src/styles/global.css`. Don't add a config file.
- Processors are pure functions of `(string) => Promise<string>`. Don't reach into the DOM from them.
- **Each new tool needs its own page** — do not turn this back into a single-page app with tabs that swap state. The per-route URL is the whole SEO argument.

## 9. Deploy

Cloudflare Pages:

- Framework preset: **Astro** (or "None" — both work).
- Build command: `npm run build`
- Build output directory: `dist`
- No environment variables required.

Astro will emit:

- `index.html` and 5 tool routes as static HTML
- `sitemap-index.xml` + `sitemap-0.xml`
- `robots.txt` (copied from `public/`)
- `_astro/*` with one chunk per heavy processor lib (terser, csso, js-beautify), plus the shared island bundle

Any other static host (Netlify, Vercel static, GitHub Pages, S3+CloudFront) works the same way: build, upload `dist/`.

Update `site:` in `astro.config.mjs` if you deploy to a custom domain — that value is what builds the canonical URLs and the sitemap.

## 10. Troubleshooting

- **`@astrojs/tailwind` peer warning** — don't install it. We use Tailwind v4 via `@tailwindcss/vite`, which is the official path for Astro 5+/6+.
- **"chunks larger than 500 kB"** warning from Vite — expected on the `/minify-js` chunk because that's terser. Acceptable. Don't try to fix it by importing terser statically into the shared island; that defeats the code-split.
- **Tab does not highlight as active** — check that the slug in `TOOLS` matches the page file name exactly (e.g. tool slug `/format-yaml` ↔ `src/pages/format-yaml.astro`). The active state is computed server-side by comparing `Astro.url.pathname` to `tool.slug`.
- **Dark-mode flash on load** — make sure the inline `<script is:inline>` in `BaseLayout.astro` runs *before* `<body>`. Don't move it.
