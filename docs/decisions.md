# Decisions

[← back to the README](../README.md)

Short notes on the choices that aren't obvious from the code: the problem, what I considered, what I picked and what it costs.

## A 3D night sky instead of a plain page

- **Problem:** a portfolio of a dozen projects reads like every other list of cards.
- **Options:** a plain scrolling page, a 2D canvas animation, a three.js scene.
- **Choice:** a react-three-fiber sky where skills are constellations and projects are stars, with the camera flying between sections as you scroll.
- **Trade-off:** three.js is the biggest chunk (177 KB gzipped), so it loads lazily after the prerendered page paints, and a static SVG map covers no-WebGL devices and slow loads.

## Prerendering with `renderToString` instead of a framework

- **Problem:** search engines and link previews need real HTML for every route, but the site is a Vite SPA.
- **Options:** move to Next.js or Astro, or prerender the existing app.
- **Choice:** `scripts/prerender.mjs` renders every route with `renderToString` after the Vite build and writes the sitemap and `llms.txt`.
- **Trade-off:** I maintain a small script and an SSR entry, and code that touches `window` has to wait for hydration.

## Blog posts compiled at build time

- **Problem:** posts need syntax highlighting and a table of contents without shipping a Markdown parser to visitors.
- **Options:** parse Markdown in the browser, use a CMS, or compile it in a Vite plugin.
- **Choice:** `plugins/posts.ts` turns `content/posts/*.md` into modules with ready HTML (marked + Shiki), with a light metadata module per post for lists and stars.
- **Trade-off:** a new post needs a rebuild and deploy, which is fine for a personal blog.

## Dark only, no theme picker

- **Problem:** my usual rule is a System/Light/Dark picker on every UI.
- **Options:** a full light theme, a picker on the blog only, or dark only.
- **Choice:** dark only. The whole site is a night sky, and a light version of the 3D scene, HUD and cards would be a second design.
- **Trade-off:** visitors who prefer light pages don't get one.

## www as the canonical host

- **Problem:** the apex and www both served the site, splitting search ranking.
- **Options:** canonical apex or canonical www.
- **Choice:** www, with the apex redirected in Vercel Domains.
- **Trade-off:** a `vercel.json` redirect back to the apex once caused a redirect loop; `src/seo/domain.test.ts` and a CI check on `dist/` now guard it.

## Vitest instead of `node:test`

- **Problem:** tests import TypeScript and the blog posts that only exist through the Vite plugin (`src/data/data.test.ts`, `src/routes.test.ts`).
- **Options:** `node:test` with a separate TypeScript loader, or Vitest.
- **Choice:** Vitest, which reuses the Vite config.
- **Trade-off:** one more dev dependency than the built-in runner.

## One status per state machine

- **Problem:** pairs of flags like `sceneReady` + `sceneFailed` could disagree, and a blog post load could hang on its loading line.
- **Options:** keep the flags and add guards, or one status per machine with a transition function.
- **Choice:** a status union and a small reducer for each, listed in [state-machines.md](state-machines.md).
- **Trade-off:** a few more lines per machine, in exchange for impossible states that can't be written.
