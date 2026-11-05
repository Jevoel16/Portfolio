<a id="top"></a>

<div align="center">

<img src="docs/logo.svg" alt="Sprucetrap logo" width="72" height="72" />

# Sprucetrap · Constellations

**A cybersecurity × full-stack portfolio you scroll through like a flight across the night sky, through an observatory HUD: every skill is a constellation, every project is a star, and a holographic guide answers the comms.**

![React](https://img.shields.io/badge/React-18.3.1-blue?style=flat)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue?style=flat)
![Vite](https://img.shields.io/badge/Vite-6.4.5-blue?style=flat)
![three.js](https://img.shields.io/badge/three.js-0.170.0-blue?style=flat)
![React Three Fiber](https://img.shields.io/badge/React%20Three%20Fiber-8.18.0-blue?style=flat)
![drei](https://img.shields.io/badge/drei-9.122.0-blue?style=flat)
![React Router](https://img.shields.io/badge/React%20Router-7.18.5-blue?style=flat)
![Vitest](https://img.shields.io/badge/Vitest-5.1.0-blue?style=flat)
![marked](https://img.shields.io/badge/marked-15.0.12-blue?style=flat)
![Shiki](https://img.shields.io/badge/Shiki-3.23.0-blue?style=flat)
![Fontsource](https://img.shields.io/badge/Fontsource-5.3.0-blue?style=flat)

![Version](https://img.shields.io/badge/version-2.1.0-informational?style=flat)
![License](https://img.shields.io/badge/license-Sprucetrap%20Source--Available-orange?style=flat)
![Platform](https://img.shields.io/badge/platform-web%20%7C%20mobile-success?style=flat)
[![CI](https://github.com/Jevoel16/Portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/Jevoel16/Portfolio/actions/workflows/ci.yml)

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
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

---

## Features

- **Observatory HUD** — corner brackets, a faint scanline veil, a one-time `> establishing uplink… ok` boot line, a blinking caret, a live telemetry readout (pointer RA/Dec, locked target, uptime), target-lock reticles and a short "decrypt" scramble on star names, and data packets travelling along constellation lines like traffic on a network map. All of it stops with the header's pause-motion chip.
- **⌘K command terminal** — press `⌘K` / `Ctrl+K` or `/` anywhere (or the `>_` button) for a small shell: `whoami`, `ls projects`, `open <slug>` with Tab completion, `cat about`, `blog`, `contact`, `theme redteam`, `sudo hire-me`, `help`. Every command maps to a page, so it doubles as keyboard navigation; on phones it is a bottom sheet with tappable quick commands.
- **Red team mode** — `theme redteam` or the Konami code (↑↑↓↓←→←→BA) swaps the HUD to crimson; the choice is remembered in the browser.
- **One scrolling flight through space (v2)** — the home page is a single long page over a fixed 3D night sky. As you scroll, the camera flies between waypoints: the whole sky for the hero, the home planet for About, each constellation in turn for Projects, the ringed planet for Toolkit, the security nebula for Write-ups and the signal beacon for Contact. Long hops pull the camera back mid-flight so they read as flights, not pans.
- **Constellations as skills, stars as projects** — Full-Stack Web, Data & ML, Networking, Databases and Cybersecurity, each with a block of project cards that the camera frames as you reach it.
- **Spruce, the holographic guide** — in Contact, the avatar (`public/avatar/spruce.webp`) boots up as a hologram over the beacon (scanlines, projector cone, float) when the section scrolls in, then talks: a speech bubble types out his lines while voice bars bounce. **Next** skips to the end of a line, then moves on; a short glitch plays between lines. Screen readers get each full line from a live region.
- **Themed transitions** — sections resolve with a "signal acquired" scan-line wipe and blur-to-focus, section titles decrypt, orbit dividers carry travelling data packets, long jumps from the header play a hyperspace star-streak, a left-hand altitude rail and the header's progress line track the flight (paced by section, so the rail fill meets each tick as that section becomes active), and moving to the blog or a project page scans the new page in with the View Transitions API (plain swap where unsupported).
- **Blog** — write-ups and notes written in Markdown (`content/posts/*.md`), compiled to HTML with syntax highlighting at build time, so the browser never downloads a Markdown parser.
- **A constellation that grows** — every post with `constellation: security` becomes a star in the Cybersecurity constellation and a card in the Write-ups section.
- **Celestial bodies for everything else** — a home planet (**About**), a ringed planet (**Toolkit** / tech stack) and a pulsing signal beacon (**Contact**).
- **Deep links that scroll** — `/about`, `/toolkit` and `/contact` open the page scrolled to that section, `/#projects` and `/#writeups` to theirs, and the URL, title and canonical follow along as you scroll. Each project has its own page at `/projects/<slug>`; unknown URLs show a 404 page.
- **Phone-first** — native scrolling, a swipeable header chip row, cards in one column, the avatar stacked above its speech bubble, and safe-area padding for notched phones.
- **Ambient motion** — twinkling stars, nebula clouds, a slow sway and occasional shooting stars (on by default on every device, including desktops with the OS *reduce motion* setting on; the header's pause-motion chip stops it).
- **Prerendered for search engines** — every page (each section URL with every section in its HTML, projects, blog posts, 404) is rendered to static HTML at build time with its own title, description, canonical URL, Open Graph/Twitter card and JSON-LD, then hydrated in the browser. Crawlers and no-JS visitors get real content and real links.
- **SEO files** — `sitemap.xml` and `llms.txt` are generated from the data; `robots.txt`, favicon, touch icon, web manifest and a 1200×630 share image live in `public/`.
- **Security headers** — `vercel.json` sends HSTS, a strict Content-Security-Policy, `nosniff`, `X-Frame-Options: DENY`, a referrer policy and a permissions policy. Fonts are self-hosted, so nothing loads from third-party origins.
- **CI/CD** — every push and pull request to `main` runs `npm audit`, the tests and the full prerender build on GitHub Actions; Vercel deploys on push, and each successful production deploy triggers a smoke test of the live domain (status codes, redirect loops, page assets, security headers, SEO files). `main` is the only branch and is protected against force pushes and deletion.
- **Hidden fallback** — if WebGL is missing or the 3D scene fails, a lightweight SVG star map with the same stars and planets stays behind the page, with a light CSS parallax.
- **Accessible** — every project, section and post is a real link in the page; one `<h1>`, then `<h2>` sections and `<h3>`/`<h4>` cards; the 3D canvas is decorative and hidden from assistive tech; motion is on by default everywhere, and a pause-motion chip in the header (remembered per browser) turns off ambient motion, the warp flash and typing; scroll-driven motion (camera flight, parallax, reveals, page transitions) follows the reader's own scrolling and stays on, so desktop and phone look the same.
- **Light and fast** — first paint is the prerendered SVG sky plus ~70 KB of gzipped JavaScript; three.js downloads only once the browser is idle, in long-cached vendor chunks. Every constellation star is one GPU point buffer (one draw call, twinkle in the shader), edges are two draw calls, and all labels live in a single DOM layer. The canvas renders on demand: full rate while the camera is flying, ~30 fps for ambient motion, and only for camera flights while motion is paused. Textures are drawn in code, and data saver or slow connections get fewer background stars.

<p align="right"><a href="#top">back to top ↑</a></p>

---

## Tech stack

| Area | Tools |
| --- | --- |
| UI | React 18, TypeScript |
| Routing | React Router 7 in declarative mode (`BrowserRouter`, one layout route for the scroll page, `viewTransition` links; `StaticRouter` for prerendering) |
| Blog | Markdown + frontmatter, compiled by a Vite plugin (`plugins/posts.ts`) with marked and Shiki |
| Testing | Vitest |
| 3D | three.js, React Three Fiber (on-demand frameloop, scroll-driven camera), drei (`Billboard`), custom GLSL point shader |
| Build | Vite 6, `@vitejs/plugin-react` |
| Styling | Plain CSS with custom properties, split by area in `src/styles/`; transitions are CSS plus IntersectionObserver, no animation library |
| Fonts | Space Grotesk and JetBrains Mono variable fonts, self-hosted via Fontsource |
| Prerender / SEO | `vite build --ssr` + `scripts/prerender.mjs` (`renderToString` per route), `src/seo/meta.ts` |
| Hosting | Vercel (`vercel.json`: clean URLs, headers, caching), deployed by the Vercel Git integration |
| CI/CD | GitHub Actions (`ci.yml`: audit, test, build; `smoke.yml`: post-deploy smoke test) |

<p align="right"><a href="#top">back to top ↑</a></p>

---

## Prerequisites

- [Node.js](https://nodejs.org/) 22.12 or newer (see `.nvmrc`) and npm
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
| `src/pages/ScrollPage.tsx` | The About copy, section order and section text |
| `src/data/profile.ts` | GitHub and license links, and the avatar image path, size and alt text |
| `src/data/dialogue.ts` | What Spruce says in the Contact section |
| `public/avatar/spruce.webp` | The avatar artwork (black background; the page blends it out) |
| `content/posts/*.md` | Blog posts (see [Writing a post](#writing-a-post)) |

URL options:

| Query | Effect |
| --- | --- |
| `?mode=static` | Forces the SVG fallback map (useful for testing devices without WebGL) |

Routes:

| Path | Opens |
| --- | --- |
| `/` | The scroll page from the top |
| `/about`, `/toolkit`, `/contact` | The scroll page, scrolled to that section |
| `/#projects`, `/#writeups` | The scroll page, scrolled to that section |
| `/projects/<slug>` | A project's own page (`slug` = the project's `id` in `src/data/projects.ts`) |
| `/writeups/<slug>` | v1 write-up star links; shows the post and canonicalises to `/blog/<slug>` |
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

1. Scroll: the camera flies from the full sky to each section's planet or constellation while the text scrolls over it.
2. Use the header chips (**About**, **Projects**, **Toolkit**, **Contact**) or the altitude rail on the left to jump; long jumps play the hyperspace streak.
3. In **Projects**, open **details →** for a project's own page or **source ↗** for its repository.
4. In **Contact**, Spruce boots up and starts talking; press **Next** to hear the rest.
5. The URL follows the section you're in, so you can copy it and share that exact spot.

### The command terminal

Open it with `⌘K` / `Ctrl+K`, `/`, or the `>_` chip in the header:

```text
visitor@sprucetrap:~$ whoami
sprucetrap
aspiring cybersecurity professional · full-stack developer
visitor@sprucetrap:~$ ls projects
★ the-pulse            The Pulse
★ rankit               RankIT
…
visitor@sprucetrap:~$ open ran⇥        # Tab completes to `open rankit`, Enter opens its page
visitor@sprucetrap:~$ theme redteam
> red team mode engaged. be nice.
```

<details>
<summary>All commands</summary>

| Command | Does |
| --- | --- |
| `help` | List commands |
| `whoami` | Who runs the site |
| `ls [projects\|posts\|constellations]` | List what is in the sky |
| `open <slug>` | Open a project page, or scroll to `about`, `toolkit` or `contact`; Tab completes |
| `cat about` | Scroll to About |
| `blog [slug]` | Open the blog or a post |
| `contact` | Scroll to Contact |
| `sky` | Back to the top of the page |
| `theme default\|redteam` | Switch HUD colours |
| `sudo hire-me` | Escalate privileges (opens Contact) |
| `clear`, `exit` | Clear the screen, close the terminal |

↑ / ↓ walk through command history; Esc closes the terminal.

</details>

### Visitors on phones

1. Scroll as usual; the sky flies behind the page in portrait orientation. Phones get solid glass cards instead of blurred ones and a lighter canvas, so fast scrolling stays smooth.
2. Swipe the header chip row sideways to reach **Contact**, **Blog** and the terminal.
3. In **Contact**, Spruce sits above his speech bubble; tap the bubble or **Next** to continue.
4. Tap `>_` for the terminal; the quick-command chips cover the common commands without typing.

### Keyboard and screen-reader users

Tab moves through the header, the section rail and every card link in reading order. Sections are landmarks with `<h2>` headings, the 3D sky is hidden from assistive tech, and Spruce's lines are announced whole through a polite live region rather than letter by letter.

### Readers of the blog

1. Open **Blog** from the header or the Write-ups section, or go to `/blog`.
2. Pick a post; long posts show an *On this page* table of contents.
3. Security posts have **See it on the star map**, which goes back to the Write-ups section.

### Writing a post

Create `content/posts/<slug>.md` (the file name is the URL, lowercase and hyphenated):

```markdown
---
title: Hardening a static portfolio with security headers
short: Security headers          # optional, the star label in the sky
date: 2026-11-04                 # YYYY-MM-DD
updated: 2026-11-20              # optional
summary: One or two sentences for the list, the Write-ups card and search results.
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

After deploying, submit `https://www.jevoelorbilla.dev/sitemap.xml` in [Google Search Console](https://search.google.com/search-console) and Bing Webmaster Tools, and test a page with the [Rich Results Test](https://search.google.com/test/rich-results).

Backlink ideas (do these yourself; nothing here is posted automatically):

- Link the site from the GitHub profile README and from each project repository's *About → Website* field.
- Cross-post blog write-ups to dev.to or Hashnode with the canonical URL set to the post on this site.
- Add the site to your LinkedIn *Featured* section and to TryHackMe / Hack The Box profiles.
- Share security write-ups in communities that allow it (r/netsec rules permitting, Discord study groups), linking the post rather than the home page.
- Ask your school organisation or course pages that list student projects to link to the relevant project page.

### Adding a project

1. Add it to `projects` in `src/data/projects.ts`; its card appears under its constellation and `/projects/<id>` is prerendered.
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
├── .nvmrc                     # Node version used locally and in CI
├── .github/
│   ├── workflows/ci.yml       # Audit, test and build on push / PR to main
│   └── workflows/smoke.yml    # Smoke test the live site after each production deploy
├── vercel.json                # Clean URLs, security and cache headers (apex → www is set in Vercel Domains)
├── public/                    # robots.txt, icons, manifest, share image, avatar/spruce.webp (copied as-is)
├── scripts/
│   ├── prerender.mjs          # Writes one HTML file per route, sitemap.xml and llms.txt
│   └── smoke.mjs              # Post-deploy checks against the live site
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
    │   ├── ScrollPage.tsx     # v2 home: fixed sky backdrop, HUD, rail and every section
    │   ├── ProjectPage.tsx    # One page per project
    │   ├── NotFound.tsx       # 404 page
    │   └── blog/              # BlogIndex, BlogPost
    ├── index.css              # Imports the stylesheets below in order
    ├── styles/                # tokens, base, sky (chrome), static-sky, ui, scroll, holo, doc, hud, terminal
    ├── components/
    │   ├── Header.tsx         # Sticky bar: brand, section chips, blog, terminal, progress line
    │   ├── HoloAvatar.tsx     # Spruce: hologram, typed speech, Next / Skip / Replay
    │   ├── SectionHeading.tsx # Section h2 that decrypts on first view
    │   ├── Reveal.tsx         # "Signal acquired" reveal wrapper
    │   └── DocLayout.tsx      # Scrolling shell for blog, project and 404 pages
    ├── data/
    │   ├── projects.ts
    │   ├── constellations.ts  # Stars, layout helpers (orient, skyBounds, targetFor)
    │   ├── bodies.ts          # Planets and beacon
    │   ├── profile.ts         # GitHub / license links, avatar image
    │   └── dialogue.ts        # Spruce's lines
    ├── hud/
    │   ├── Hud.tsx            # HudFrame (brackets, scanlines), BootLine, Telemetry
    │   ├── CommandTerminal.tsx# ⌘K terminal dialog / phone bottom sheet
    │   ├── commands.ts        # Pure command parser, completion, quick commands
    │   ├── theme.ts           # Red team theme + Konami code
    │   ├── useTypewriter.ts   # Typing effect for the avatar's speech
    │   └── Scramble.tsx       # "Decrypt" text effect for section titles
    ├── scroll/
    │   ├── sections.ts        # Section order, URL ⇄ section mapping
    │   ├── useSectionSync.ts  # Scroll to the URL's section; keep the URL on the section in view
    │   ├── useReveal.ts       # One-shot IntersectionObserver reveal state
    │   └── cameraPath.ts      # Pure camera maths: waypoints, tracking, eased flight poses
    ├── seo/
    │   ├── meta.ts            # Per-route title, description, canonical, Open Graph, JSON-LD
    │   └── RouteHead.tsx      # Keeps <head> in sync during client-side navigation
    ├── hooks/
    │   ├── useMediaQuery.ts   # Hydration-safe media queries; PORTRAIT_QUERY rotates the sky
    │   ├── useMotion.ts       # Site motion setting (full by default) behind the pause-motion chip
    │   └── useSceneSupport.ts # WebGL / data-saver detection, coarse pointer
    ├── scene/                 # Lazy-loaded three.js chunk
    │   ├── ScrollSky.tsx      # Fixed canvas, on-demand frameloop, scroll-driven camera rig
    │   ├── skyLayout.ts       # Star, edge and label positions for one orientation
    │   ├── SkyStars.tsx       # All constellation stars as one shader point buffer + picking
    │   ├── SkyLines.tsx       # All edges in two line-segment draws
    │   ├── SkyPackets.tsx     # Packets travelling along edges (GPU-animated points)
    │   ├── pointScale.ts      # Pixel scale shared by the point shaders
    │   ├── cursor.ts          # Pointer cursor while hovering clickable things
    │   ├── Bodies.tsx         # Planets, ringed planet, beacon
    │   ├── ShootingStars.tsx
    │   ├── Starfield.tsx      # Background stars and nebulae
    │   └── textures.ts        # Canvas-drawn textures
    └── static/
        └── StaticSky.tsx      # Decorative SVG placeholder and no-WebGL fallback
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
| `npm run smoke` | Smoke-test the live site (`npm run smoke -- https://other-url` for another deploy) |

<p align="right"><a href="#top">back to top ↑</a></p>

---

## Deployment

### Continuous integration

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on every push and pull request to `main`: `npm ci`, `npm audit --audit-level=high`, `npm test`, `npm run build`, then checks that `dist/` has the HTML, sitemap, robots and llms files and no links to the apex domain. The built `dist/` is kept as a run artifact for 7 days. Run the same checks locally before pushing:

```bash
npm ci && npm audit --audit-level=high && npm test && npm run build
```

### Vercel and smoke test

Vercel builds and deploys through its Git integration: pushes to `main` go to production, other branches get preview URLs. When Vercel marks a commit on `main` as deployed (its "Vercel" commit status turns green), [`.github/workflows/smoke.yml`](.github/workflows/smoke.yml) runs `scripts/smoke.mjs` against https://www.jevoelorbilla.dev: every key route, redirect loops, the 404 page, that the home page's scripts, styles and icons load, security headers and the SEO files. It also runs every Monday and can be started by hand from the Actions tab. No secrets are needed.

```bash
npm run smoke
```

<p align="right"><a href="#top">back to top ↑</a></p>

---

## Contributing

1. Create a branch with a matching prefix: `feat/short-description`, `fix/short-description`, `docs/…`, `refactor/…`.
2. Use [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `style:`, `perf:`, `test:` — an imperative subject of 72 characters or less, a blank line, then one bullet per change.
3. End every commit subject with the bumped [SemVer](https://semver.org/) version, e.g. `feat: add CSV export (v1.4.0)` (breaking → major, `feat` → minor, anything else → patch), and keep `package.json` and the README version badge in sync. `.claude/` (local Claude settings and worktrees) and `CLAUDE.md` (personal instructions for Claude) are git-ignored.
4. Run `npm test` and `npm run build`, and check the change on desktop and a phone-sized viewport.
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
