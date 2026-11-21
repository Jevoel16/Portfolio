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

## System, Light and Dark, with a dawn sky for Light

Replaces "Dark only, no theme picker" (2026-11-17).

- **Problem:** the site was dark only, so visitors who prefer light pages got nothing, and my rules now ask for a System/Light/Dark picker on every UI.
- **Options:** a light UI over the dark 3D sky, a flat paper star chart instead of the 3D scene in Light, or the same 3D scene redrawn as a dawn sky.
- **Choice:** the dawn sky. Colour tokens use `light-dark()`, so one `data-theme` attribute on `<html>` switches everything. The 3D scene redraws its stars and lines in ink with normal blending, because additive glow can only brighten and disappears on cream. The terminal, code blocks and Spruce stay dark in both themes. Red team mode moved to its own `data-hud` attribute so it stacks on either theme.
- **Trade-off:** the pre-paint script is inline, so its hash has to stay in the CSP (`scripts/csp.test.ts` checks it), and data colours need an ink version (`src/lib/ink.ts`) to pass AA on cream.

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

## Only public repos on the map

- **Problem:** six projects linked to repos I had made private, so their "source" links gave visitors a 404.
- **Options:** keep them without a source link, make the repos public again, or take them off the map.
- **Choice:** take them off. The Databases constellation stays in the sky as a forming figure with no clickable stars, the same way Cybersecurity started.
- **Trade-off:** the map shows less of my database work until I publish projects for it, and the old `/projects/<id>` URLs now hit the 404 page.
