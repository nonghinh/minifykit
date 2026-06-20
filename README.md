# MinifyKit

Tiny in-browser toolbox to **minify JavaScript/CSS** and **beautify JSON/HTML/CSS**. Nothing is uploaded — every byte stays on your machine.

## Live tools

- Minify JS (via [terser](https://github.com/terser/terser))
- Minify CSS (via [csso](https://github.com/css/csso))
- Format JSON (built-in `JSON.parse` / `JSON.stringify`)
- Format HTML (via [js-beautify](https://github.com/beautifier/js-beautify))
- Format CSS (via js-beautify)

## Run locally

```bash
npm install
npm run dev
```

Open the URL Astro prints (usually <http://localhost:4321>).

## Build a static site

```bash
npm run build
npm run preview   # serve the production build locally
```

The output goes to `dist/` and can be hosted on any static host (Cloudflare Pages, Netlify, GitHub Pages, etc.).

## Deploy to Cloudflare Pages

1. Push this repo to GitHub.
2. Create a Pages project pointed at the repo.
3. Build command: `npm run build` · Output directory: `dist`.

That's it — no env vars, no functions.

## License

MIT
