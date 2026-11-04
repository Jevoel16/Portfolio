<a id="top"></a>

<div align="center">

<img src="docs/logo.svg" alt="Sprucetrap logo" width="72" height="72" />

# Sprucetrap · Constellations

**A portfolio you explore like a night sky: every skill is a constellation, every project is a star.**

![React](https://img.shields.io/badge/React-18.3.1-blue?style=flat)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue?style=flat)
![Vite](https://img.shields.io/badge/Vite-6.4.4-blue?style=flat)
![three.js](https://img.shields.io/badge/three.js-0.170.0-blue?style=flat)
![React Three Fiber](https://img.shields.io/badge/React%20Three%20Fiber-8.18.0-blue?style=flat)
![drei](https://img.shields.io/badge/drei-9.122.0-blue?style=flat)
![React Router](https://img.shields.io/badge/React%20Router-6.30.6-blue?style=flat)
![Vitest](https://img.shields.io/badge/Vitest-3.2.7-blue?style=flat)
![marked](https://img.shields.io/badge/marked-15.0.12-blue?style=flat)
![Shiki](https://img.shields.io/badge/Shiki-3.23.0-blue?style=flat)
![Fontsource](https://img.shields.io/badge/Fontsource-5.3.0-blue?style=flat)

![Version](https://img.shields.io/badge/version-1.3.2-informational?style=flat)
![License](https://img.shields.io/badge/license-Sprucetrap%20Source--Available-orange?style=flat)
![Platform](https://img.shields.io/badge/platform-web%20%7C%20mobile-success?style=flat)

</div>

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration and environment variables](#configuration-and-environment-variables)
- [Usage](#usage)
- [Project structure](#project-structure)
- [Scripts](#scripts)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

---

## Features

- **One full-screen interactive sky** — the whole site is a 3D space scene; there are no plain list or scrolling sections.
- **Constellations as skills, stars as projects** — Full-Stack Web, Data & ML, Networking, Databases and Cybersecurity.
- **Blog** — write-ups and notes written in Markdown (`content/posts/*.md`), compiled to HTML with syntax highlighting at build time, so the browser never downloads a Markdown parser.
- **A constellation that grows** — every post with `constellation: security` becomes a star in the Cybersecurity constellation, with a teaser panel that links to the full write-up.
- **Celestial bodies for everything else** — a home planet (**About**), a ringed planet (**Toolkit** / tech stack) and a pulsing signal beacon (**Contact**).
- **Deep links** — every panel has its own URL (`/about`, `/toolkit`, `/contact`, `/projects/<slug>`); Back and Forward open and close panels, and unknown URLs show a 404 page.
- **Fly-to camera** — selecting a star or planet glides the camera to it and opens a details panel.
- **Phone-first gestures** — drag to look around, pinch to zoom, tap to fly; panels become bottom sheets with the target lifted above them; safe-area aware for notched phones.
- **Ambient motion** — twinkling stars, nebula clouds, a slow sway and occasional shooting stars (all switched off with *reduce motion*).
- **Prerendered for search engines** — every page (sky panels, projects, blog posts, 404) is rendered to static HTML at build time with its own title, description, canonical URL, Open Graph/Twitter card and JSON-LD, then hydrated in the browser. Crawlers and no-JS visitors get real content and real links.
- **SEO files** — `sitemap.xml` and `llms.txt` are generated from the data; `robots.txt`, favicon, touch icon, web manifest and a 1200×630 share image live in `public/`.
- **Security headers** — `vercel.json` sends HSTS, a strict Content-Security-Policy, `nosniff`, `X-Frame-Options: DENY`, a referrer policy and a permissions policy. Fonts are self-hosted, so nothing loads from third-party origins.
- **Hidden fallback** — if WebGL is missing or the 3D scene fails, a lightweight SVG star map with the same stars and planets takes over automatically.
- **Accessible** — keyboard-reachable list of every star and planet, focus-trapped dialogs, Escape to close.
- **Light and fast** — first paint is the prerendered SVG sky plus ~70 KB of gzipped JavaScript; three.js downloads only once the browser is idle, in long-cached vendor chunks. Every constellation star is one GPU point buffer (one draw call, twinkle in the shader), edges are two draw calls, and all labels live in a single DOM layer. The canvas renders on demand: full rate while you drag, fly or hover, ~30 fps for ambient motion, and nothing at all with *reduce motion* on. Textures are drawn in code, and data saver or slow connections get fewer background stars.

<p align="right"><a href="#top">back to top ↑</a></p>

---

## Tech stack

| Area | Tools |
| --- | --- |
| UI | React 18, TypeScript |
| Routing | React Router 6 (`BrowserRouter`, one layout route for the sky) |
| Blog | Markdown + frontmatter, compiled by a Vite plugin (`plugins/posts.ts`) with marked and Shiki |
| Testing | Vitest |
| 3D | three.js, React Three Fiber (on-demand frameloop), drei (`OrbitControls`, `Line`, `Billboard`), custom GLSL point shader |
| Build | Vite 6, `@vitejs/plugin-react` |
| Styling | Plain CSS with custom properties, split by area in `src/styles/` |
| Fonts | Space Grotesk and JetBrains Mono variable fonts, self-hosted via Fontsource |
| Prerender / SEO | `vite build --ssr` + `scripts/prerender.mjs` (`renderToString` per route), `src/seo/meta.ts` |
| Hosting | Vercel (`vercel.json`: clean URLs, headers, caching) |

<p align="right"><a href="#top">back to top ↑</a></p>

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer (20 LTS recommended) and npm
- A browser with WebGL for the 3D sky (any modern desktop or mobile browser)

<p align="right"><a href="#top">back to top ↑</a></p>

---

## Installation

```bash
git clone https://github.com/Jevoel16/Portfolio.git
cd Portfolio
npm install
```

<p align="right"><a href="#top">back to top ↑</a></p>

---

## Configuration and environment variables

No environment variables are needed. Content lives in data files:

| File | What it holds |
| --- | --- |
| `src/data/projects.ts` | Every project (name, description, stack, GitHub URL) and the Toolkit tech-stack groups |
| `src/data/constellations.ts` | Constellation names, colours and star positions in sky coordinates |
| `src/data/bodies.ts` | The About / Toolkit / Contact planets: kind, colours, position, size |
| `src/components/BodyPanel.tsx` | The text shown in the About, Toolkit and Contact panels |
| `content/posts/*.md` | Blog posts (see [Writing a post](#writing-a-post)) |

URL options:

| Query | Effect |
| --- | --- |
| `?mode=static` | Forces the SVG fallback map (useful for testing devices without WebGL) |

Routes:

| Path | Opens |
| --- | --- |
| `/` | The full sky, no panel |
| `/about`, `/toolkit`, `/contact` | That planet's panel |
| `/projects/<slug>` | A project's panel (`slug` = the project's `id` in `src/data/projects.ts`) |
| `/writeups/<slug>` | A Cybersecurity write-up star's teaser panel |
| `/blog` | List of posts, newest first |
| `/blog/<slug>` | A full post (`slug` = the Markdown file name) |
| anything else | 404 page |

Every route is prerendered to its own HTML file (`/about` → `dist/about.html`), and Vercel's `cleanUrls` serves it without the extension. Unknown paths get `dist/404.html` with a real 404 status.

Hosting files:

| File | Purpose |
| --- | --- |
| `vercel.json` | Clean URLs, `www` → apex redirect, security headers (HSTS, CSP, …), one-year caching for hashed `/assets/*` |
| `public/robots.txt` | Allows all crawlers and points to the sitemap |
| `public/site.webmanifest`, `favicon.svg`, `apple-touch-icon.png`, `icon-512.png` | Icons for tabs, home screens and installs |
| `public/og-default.png` | 1200×630 image used by link previews |
| `src/seo/meta.ts` | Titles, descriptions, canonicals and JSON-LD for every route; `SITE_URL` is the production domain |

<p align="right"><a href="#top">back to top ↑</a></p>

---

## Usage

Start the dev server:

```bash
npm run dev
```

Open <http://localhost:5173>. The server also listens on your LAN (`host: true`), so you can open the printed *Network* URL on your phone.

### Visitors on desktop

1. Drag anywhere to look around; scroll to zoom.
2. Click a star to fly to it and read about the project; **View on GitHub** opens the repo.
3. Click **About**, **Toolkit** or **Contact** (top right, or the planets themselves) to open those panels.
4. Use the constellation chips at the bottom to jump to a skill area; **Recenter** returns to the full sky.
5. Press **Escape** or click empty sky to close a panel.

### Visitors on phones

1. Drag with one finger to look around; pinch to zoom.
2. Tap a star or planet — the details slide up as a bottom sheet with the target kept in view above it.
3. Swipe the constellation chip row sideways to reach every constellation.
4. Tap the dimmed sky above the sheet, or the × button, to close it.

### Keyboard and screen-reader users

Press **Tab** from the top of the page to reach a list of every star and planet; **Enter** opens its panel. Panels trap focus and close with **Escape**.

### Readers of the blog

1. Open **Blog** from a panel link or go to `/blog`.
2. Pick a post; long posts show an *On this page* table of contents.
3. Security posts have **View in the sky**, which flies to the post's star in the Cybersecurity constellation.

### Writing a post

Create `content/posts/<slug>.md` (the file name is the URL, lowercase and hyphenated):

```markdown
---
title: Hardening a static portfolio with security headers
short: Security headers          # optional, the star label in the sky
date: 2026-11-04                 # YYYY-MM-DD
updated: 2026-11-20              # optional
summary: One or two sentences for the list, the sky panel and search results.
tags: [web-security, headers]
constellation: security          # optional: show it as a star in the Cybersecurity constellation
draft: true                      # optional: visible only on the dev server
---

## First section

Text, `code`, [links](https://example.com) and fenced code blocks with a language:

```bash
npm run build
```
```

Rules the build enforces: `title`, `date` and `summary` are required, dates use `YYYY-MM-DD`, and every image needs alt text (`![what it shows](/images/x.png)`). Headings start at `##`; the post title is the page's only `<h1>`.

### Search engines and sharing

After deploying, submit `https://jevoelorbilla.dev/sitemap.xml` in [Google Search Console](https://search.google.com/search-console) and Bing Webmaster Tools, and test a page with the [Rich Results Test](https://search.google.com/test/rich-results).

Backlink ideas (do these yourself; nothing here is posted automatically):

- Link the site from the GitHub profile README and from each project repository's *About → Website* field.
- Cross-post blog write-ups to dev.to or Hashnode with the canonical URL set to the post on this site.
- Add the site to your LinkedIn *Featured* section and to TryHackMe / Hack The Box profiles.
- Share security write-ups in communities that allow it (r/netsec rules permitting, Discord study groups), linking the post rather than the home page.
- Ask your school organisation or course pages that list student projects to link to the relevant project page.

### Adding a project

1. Add it to `projects` in `src/data/projects.ts`.
2. Give it a star in the right constellation in `src/data/constellations.ts` (`projectId` = the project's `id`) and, optionally, edges to link it in.

<p align="right"><a href="#top">back to top ↑</a></p>

---

## Project structure

<details>
<summary>Show the tree</summary>

```text
Portfolio/
├── docs/logo.svg              # README logo
├── index.html                 # Fonts, meta tags, viewport-fit=cover for notched phones
├── vite.config.ts
├── vercel.json                # Clean URLs, redirects, security and cache headers
├── public/                    # robots.txt, icons, manifest, share image (copied as-is)
├── scripts/
│   └── prerender.mjs          # Writes one HTML file per route, sitemap.xml and llms.txt
├── tsconfig.json              # References the app and node configs
├── tsconfig.app.json          # Browser code (src/)
├── tsconfig.node.json         # vite.config.ts, plugins/, scripts/
├── content/posts/             # Blog posts in Markdown
├── plugins/
│   └── posts.ts               # Vite plugin: Markdown → JS modules at build time
├── .claude/launch.json        # Local dev-server entry for Claude's preview (git-ignored)
└── src/
    ├── main.tsx               # Router + hydrate/render, self-hosted fonts
    ├── entry-server.tsx       # Server entry used only by the prerender step
    ├── App.tsx                # Route table
    ├── routes.ts              # URL ⇄ sky selection helpers
    ├── content/
    │   ├── posts.ts           # Post list, lazy post loader, date formatting
    │   └── types.ts           # PostMeta / Post shapes
    ├── pages/
    │   ├── SkyPage.tsx        # Full-screen sky, HUD, panels, fallback switching
    │   ├── NotFound.tsx       # 404 page
    │   └── blog/              # BlogIndex, BlogPost
    ├── index.css              # Imports the stylesheets below in order
    ├── styles/                # tokens, base, sky, static-sky, labels, panel, doc
    ├── components/
    │   ├── Header.tsx         # Brand + About / Toolkit / Contact shortcuts
    │   ├── Panel.tsx          # Shared dialog shell (side sheet / bottom sheet)
    │   ├── ProjectPanel.tsx   # Project details
    │   ├── PostPanel.tsx      # Write-up star teaser
    │   ├── DocLayout.tsx      # Scrolling shell for blog and 404 pages
    │   └── BodyPanel.tsx      # About, Toolkit and Contact content
    ├── data/
    │   ├── projects.ts
    │   ├── constellations.ts  # Stars, layout helpers (orient, skyBounds, targetFor)
    │   └── bodies.ts          # Planets and beacon
    ├── seo/
    │   ├── meta.ts            # Per-route title, description, canonical, Open Graph, JSON-LD
    │   └── RouteHead.tsx      # Keeps <head> in sync during client-side navigation
    ├── hooks/
    │   ├── useMediaQuery.ts   # Hydration-safe media queries; PORTRAIT_QUERY rotates the sky
    │   └── useSceneSupport.ts # WebGL / data-saver detection, reduced motion, coarse pointer
    ├── scene/                 # Lazy-loaded three.js chunk
    │   ├── SpaceScene.tsx     # Canvas, on-demand frameloop, camera rig, gestures
    │   ├── skyLayout.ts       # Star, edge and label positions for one orientation
    │   ├── SkyStars.tsx       # All constellation stars as one shader point buffer + picking
    │   ├── SkyLines.tsx       # All edges in two line-segment draws
    │   ├── LabelLayer.tsx     # One DOM label layer, projected each frame
    │   ├── cursor.ts          # Pointer cursor while hovering clickable things
    │   ├── Bodies.tsx         # Planets, ringed planet, beacon
    │   ├── ShootingStars.tsx
    │   ├── Starfield.tsx      # Background stars and nebulae
    │   └── textures.ts        # Canvas-drawn textures
    └── static/
        └── StaticSky.tsx      # SVG placeholder and no-WebGL fallback
```

</details>

<p align="right"><a href="#top">back to top ↑</a></p>

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server on port 5173 (also on your LAN) |
| `npm run build` | Type-check, build the client, build the server entry, then prerender every route plus `sitemap.xml` and `llms.txt` into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Run Vitest in watch mode |

<p align="right"><a href="#top">back to top ↑</a></p>

---

## Testing

Run the automated checks:

```bash
npm test
```

`plugins/posts.test.ts` checks frontmatter parsing, validation and Markdown rendering. `src/routes.test.ts` checks that every panel URL round-trips. `src/seo/meta.test.ts` checks unique titles, descriptions, canonicals, lowercase URLs and escaping in `<head>`. `src/data/data.test.ts` guards the hand-edited data: unique slug ids, every project has a star in its own constellation, edges only join real stars, and every repo link is an `https://github.com/` URL. `npm run build` also type-checks the project.

Before shipping, also check by hand:

- [ ] Desktop: drag, wheel zoom, click a star → panel opens and the star sits left of the panel.
- [ ] About, Toolkit and Contact open from both the header chips and the planets.
- [ ] Clicking empty sky or pressing Escape closes the panel; **Recenter** returns home.
- [ ] Phone (375×812, browser dev tools device mode): HUD fits with no horizontal scroll, labels don't overlap, constellation chips swipe sideways, tapping a star opens the bottom sheet with the star visible above it, the page never scrolls.
- [ ] Phone in landscape (812×375): compact title, sky still fits.
- [ ] `?mode=static`: SVG map shows the constellations and the three planets, and panels open.
- [ ] OS *reduce motion* on: no sway, twinkle or shooting stars; camera jumps instead of flying.
- [ ] No errors in the browser console.
- [ ] `npm run build && npm run preview`: view the page source of `/projects/rankit` and a blog post — one `<h1>`, the canonical link, Open Graph tags, JSON-LD and the text are all in the HTML.
- [ ] `/sitemap.xml`, `/robots.txt` and `/llms.txt` load from the preview server.

<p align="right"><a href="#top">back to top ↑</a></p>

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Only the flat star map shows | The browser has no WebGL (or it crashed). Enable hardware acceleration, or remove `?mode=static` from the URL. |
| Port 5173 already in use | Stop the other process, or run `npx vite --port 5174`. |
| Can't open the site on a phone | Use the *Network* URL Vite prints, on the same Wi-Fi; allow Node through the firewall. |
| Sky looks cut off under the notch | Make sure `viewport-fit=cover` is still in the viewport meta tag in `index.html`. |
| Build fails with a frontmatter error | The message names the file and field: fix the date format, add the missing field, or add alt text to the image. |
| A new post doesn't show | Posts with `draft: true` only appear on the dev server. Restart `npm run dev` after adding the first post. |
| `Minified React error #418` in the console | The page's HTML doesn't match what the client renders. Make sure values read from `window` go through `useMediaQuery` / `useSceneSupport` (they return a fixed server value during hydration). |
| A deep link 404s on Vercel | The route must be listed by `indexablePaths()` or `extraPaths()` in `src/seo/meta.ts` so the prerender step writes its HTML file. |
| Large chunk warning on build | three.js is ~690 KB in its own lazily loaded `three` chunk on purpose; the limit is set just above it in `vite.config.ts`. |
| The 3D sky stays blank in a background tab | Expected: the canvas only renders when the browser grants animation frames, which it throttles for hidden tabs and windows. |

<p align="right"><a href="#top">back to top ↑</a></p>

---

## Contributing

1. Create a branch with a matching prefix: `feat/short-description`, `fix/short-description`, `docs/…`, `refactor/…`.
2. Use [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `style:`, `perf:`, `test:` — an imperative subject of 72 characters or less, a blank line, then one bullet per change.
3. End every commit subject with the bumped [SemVer](https://semver.org/) version, e.g. `feat: add CSV export (v1.4.0)` (breaking → major, `feat` → minor, anything else → patch), and keep `package.json` and the README version badge in sync. `.claude/` (local Claude settings and worktrees) and `CLAUDE.md` (personal instructions for Claude) are git-ignored.
4. Run `npm run build` and the manual checks in [Testing](#testing), on desktop and a phone-sized viewport.
5. **Update this README with every change**, including the version badges when dependencies change.

<p align="right"><a href="#top">back to top ↑</a></p>

---

## License

Released under the **Sprucetrap Source-Available License 1.0**. See [`LICENSE`](LICENSE).

- You may view, study, run and fork the code for **non-commercial** purposes.
- Copies and forks must keep the license, credit the author visibly with a link — *"Based on Sprucetrap · Constellations by Sprucetrap (https://github.com/Jevoel16)"* — and say what was changed.
- Commercial use, reselling, or rebranding the site as your own needs written permission from the author.

<p align="right"><a href="#top">back to top ↑</a></p>

---

## Author

**Sprucetrap** — [@Jevoel16](https://github.com/Jevoel16) · personal portfolio

<p align="right"><a href="#top">back to top ↑</a></p>
