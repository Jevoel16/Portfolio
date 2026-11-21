<a id="top"></a>

<div align="center">

<img src="docs/logo.svg" alt="Sprucetrap logo" width="72" height="72" />

# Sprucetrap · Constellations

**A cybersecurity × full-stack portfolio you scroll through like a flight across the night sky.**

[![CI](https://img.shields.io/github/actions/workflow/status/Jevoel16/Portfolio/ci.yml?branch=main&label=CI&style=flat)](https://github.com/Jevoel16/Portfolio/actions/workflows/ci.yml)
![Version](https://img.shields.io/badge/version-2.5.0-informational?style=flat)
![Platform](https://img.shields.io/badge/platform-web%20%7C%20mobile-success?style=flat)
![React](https://img.shields.io/badge/React-18-blue?style=flat)

</div>

<img src="docs/images/home-sky.webp" width="100%" alt="Home section: the Sprucetrap title over the 3D night sky with constellations, planets and the section rail">

<p align="center">
  <a href="#about">About</a> · <a href="#screenshots">Screenshots</a> · <a href="#features">Features</a> · <a href="#tech-stack">Tech Stack</a> · <a href="#architecture">Architecture</a> · <a href="#getting-started">Getting Started</a> · <a href="#usage">Usage</a> · <a href="#more">More</a>
</p>

---

## About

My personal portfolio and blog, built as an interactive 3D night sky: every skill is a constellation, every project is a star, and Spruce, a holographic guide, answers in the Contact section. It shows recruiters and collaborators my cybersecurity and full-stack work in one place. The choices behind it are in [docs/decisions.md](docs/decisions.md).

## Screenshots

<details>
<summary><b>Screenshots</b></summary>

<table>
<tr>
<td width="50%" align="center"><b>Home</b><br><a href="docs/images/home-sky.webp"><img src="docs/images/home-sky.webp" width="100%" alt="Home section: the Sprucetrap title over the 3D night sky with constellations, planets and the section rail"></a></td>
<td width="50%" align="center"><b>About</b><br><a href="docs/images/about.webp"><img src="docs/images/about.webp" width="100%" alt="About section card next to the orange About planet"></a></td>
</tr>
<tr>
<td width="50%" align="center"><b>Projects</b><br><a href="docs/images/projects.webp"><img src="docs/images/projects.webp" width="100%" alt="Projects section with Full-Stack Web project cards over their constellation"></a></td>
<td width="50%" align="center"><b>Toolkit</b><br><a href="docs/images/toolkit.webp"><img src="docs/images/toolkit.webp" width="100%" alt="Toolkit section listing languages, frameworks and tools next to the ringed Toolkit planet"></a></td>
</tr>
<tr>
<td width="50%" align="center"><b>Contact with Spruce</b><br><a href="docs/images/contact-spruce.webp"><img src="docs/images/contact-spruce.webp" width="100%" alt="Contact section with Spruce, the holographic avatar, speaking in a dialogue bubble"></a></td>
<td width="50%" align="center"><b>Command terminal</b><br><a href="docs/images/terminal.webp"><img src="docs/images/terminal.webp" width="100%" alt="Command terminal overlay showing whoami and ls projects output"></a></td>
</tr>
<tr>
<td width="50%" align="center"><b>Project page</b><br><a href="docs/images/project-page.webp"><img src="docs/images/project-page.webp" width="100%" alt="RankIT project page with description, tech tags, GitHub link and related projects"></a></td>
<td width="50%" align="center"><b>Blog</b><br><a href="docs/images/blog-index.webp"><img src="docs/images/blog-index.webp" width="100%" alt="Blog index listing the security headers write-up"></a></td>
</tr>
<tr>
<td width="50%" align="center"><b>Blog post</b><br><a href="docs/images/blog-post.webp"><img src="docs/images/blog-post.webp" width="100%" alt="Blog post page with title, tags, star map link and an On this page table of contents"></a></td>
<td width="50%" align="center"><b>No-WebGL fallback</b><br><a href="docs/images/static-fallback.webp"><img src="docs/images/static-fallback.webp" width="100%" alt="Static SVG star map shown when WebGL is unavailable"></a></td>
</tr>
<tr>
<td width="50%" align="center"><b>Phone (home and Contact)</b><br><a href="docs/images/phone.webp"><img src="docs/images/phone.webp" width="100%" alt="Two phone screens side by side: the home sky with swipeable header chips, and Spruce above the speech bubble in Contact"></a></td>
<td width="50%" align="center"><b>Light theme</b><br><a href="docs/images/light-theme.webp"><img src="docs/images/light-theme.webp" width="100%" alt="Home section in the Light theme: a cream dawn sky with the constellations drawn in ink"></a></td>
</tr>
</table>

</details>

## Features

- Scroll to fly the camera from the full sky to each section's planet or constellation.
- Browse projects as stars grouped into skill constellations, each with a screenshot, its own page and a live demo link where one exists.
- Meet Spruce, a holographic guide who talks you through the Contact section.
- Navigate by keyboard with a `Ctrl+K` command terminal (`whoami`, `ls projects`, `open <slug>`).
- Read security write-ups and notes on a fast, prerendered blog.
- Pick System, Light or Dark in the footer; Light redraws the sky as a dawn star chart.
- Use it comfortably on phones, with screen readers, or without WebGL.

Full details: [docs/features.md](docs/features.md).

## Tech Stack

| Layer               | Tools                                                                       |
| ------------------- | --------------------------------------------------------------------------- |
| UI                  | React 18.3.1, TypeScript 5.6.3, React Router 7.18.5                         |
| 3D                  | three.js 0.170.0, React Three Fiber 8.18.0, drei 9.122.0                    |
| Build and blog      | Vite 6.4.5, marked 15.0.12, Shiki 3.23.0, prerendered with `renderToString` |
| Testing and quality | Vitest 5.1.0, ESLint 10.15.0, Prettier 3.10.1                               |
| Hosting             | Vercel with Vercel Web Analytics 2.0.1, GitHub Actions CI                   |

## Architecture

```mermaid
flowchart LR
  Browser --> Vercel[Vercel: prerendered HTML + assets]
  Vercel --> App[React app]
  App --> Sky[3D sky, lazy-loaded]
  App --> Blog[Blog posts compiled at build time]
  App --> Static[Static SVG map fallback]
```

How the scroll, camera, loading and motion code fits together: [docs/architecture.md](docs/architecture.md). State machines: [docs/state-machines.md](docs/state-machines.md). Performance: [docs/performance.md](docs/performance.md).

## Getting Started

Requires Node.js 26.13.1 (pinned in `.nvmrc`) and npm.

```bash
git clone https://github.com/Jevoel16/Portfolio.git
cd Portfolio
npm install
npm run dev        # http://localhost:5173
```

## Usage

1. Scroll, or use the header chips and the left-hand rail, to fly between About, Projects, Toolkit and Contact.
2. Open a project's **details →** for its page, or **source ↗** for its repository.
3. Press `Ctrl+K` (or `/`) for the terminal and type `help`.
4. Add a blog post by creating `content/posts/<slug>.md`.

Guides: [using the site](docs/usage.md) · [editing content and writing posts](docs/content.md) · [deployment, SEO and analytics](docs/deployment.md).

## More

<details>
<summary><b>Project structure</b></summary>

```text
Portfolio/
├── .github/workflows/   # CI (audit, test, build) and post-deploy smoke test
├── content/posts/       # Blog posts in Markdown
├── docs/                # Guides, README logo and screenshots
├── plugins/             # Vite plugin that compiles posts at build time
├── public/              # Icons, manifest, share image, robots.txt, Spruce avatar
├── scripts/             # Prerender (pages, sitemap.xml, llms.txt) and smoke test
├── src/                 # App: pages, components, HUD, scroll, 3D scene, SEO, data
└── vercel.json          # Clean URLs, security and cache headers
```

</details>

<details>
<summary><b>Scripts</b></summary>

| Command              | Description                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------- |
| `npm run dev`        | Start the Vite dev server on port 5173 (also on your LAN)                                    |
| `npm run build`      | Type-check, build, then prerender every route plus `sitemap.xml` and `llms.txt` into `dist/` |
| `npm start`          | Serve the production build locally (`npm run preview` does the same)                         |
| `npm test`           | Run the Vitest suite once                                                                    |
| `npm run test:watch` | Run Vitest in watch mode                                                                     |
| `npm run lint`       | Lint with ESLint                                                                             |
| `npm run format`     | Format with Prettier                                                                         |
| `npm run typecheck`  | Type-check without building                                                                  |
| `npm run smoke`      | Smoke-test the live site (`npm run smoke -- <url>` for another deploy)                       |

</details>

<p align="right"><a href="#top">Back to top</a></p>
