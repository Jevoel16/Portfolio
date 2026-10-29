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

![Version](https://img.shields.io/badge/version-1.0.0-informational?style=flat)
![License](https://img.shields.io/badge/license-All%20rights%20reserved-lightgrey?style=flat)
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
- **Constellations as skills, stars as projects** — Full-Stack Web, Data & ML, Networking, Databases, and a Cybersecurity constellation that is still forming.
- **Celestial bodies for everything else** — a home planet (**About**), a ringed planet (**Toolkit** / tech stack) and a pulsing signal beacon (**Contact**).
- **Fly-to camera** — selecting a star or planet glides the camera to it and opens a details panel.
- **Phone-first gestures** — drag to look around, pinch to zoom, tap to fly; panels become bottom sheets with the target lifted above them; safe-area aware for notched phones.
- **Ambient motion** — twinkling stars, nebula clouds, a slow sway and occasional shooting stars (all switched off with *reduce motion*).
- **Hidden fallback** — if WebGL is missing or the 3D scene fails, a lightweight SVG star map with the same stars and planets takes over automatically.
- **Accessible** — keyboard-reachable list of every star and planet, focus-trapped dialogs, Escape to close.
- **Light on data** — three.js loads lazily in its own chunk; all textures are drawn in code (no image downloads); fewer background stars on data saver or slow connections.

<p align="right"><a href="#top">back to top ↑</a></p>

---

## Tech stack

| Area | Tools |
| --- | --- |
| UI | React 18, TypeScript |
| 3D | three.js, React Three Fiber, drei (`OrbitControls`, `Html`, `Line`, `Billboard`) |
| Build | Vite 6, `@vitejs/plugin-react` |
| Styling | Plain CSS with custom properties (`src/index.css`) |
| Fonts | Space Grotesk, JetBrains Mono (Google Fonts) |

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

URL options:

| Query | Effect |
| --- | --- |
| `?mode=static` | Forces the SVG fallback map (useful for testing devices without WebGL) |

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
├── .claude/launch.json        # Local dev-server entry for Claude's preview (git-ignored)
└── src/
    ├── main.tsx
    ├── App.tsx                # Full-screen sky, HUD, panels, fallback switching
    ├── index.css              # All styles (HUD, panels, labels, static map)
    ├── components/
    │   ├── Header.tsx         # Brand + About / Toolkit / Contact shortcuts
    │   ├── Panel.tsx          # Shared dialog shell (side sheet / bottom sheet)
    │   ├── ProjectPanel.tsx   # Project details
    │   └── BodyPanel.tsx      # About, Toolkit and Contact content
    ├── data/
    │   ├── projects.ts
    │   ├── constellations.ts  # Stars, layout helpers (orient, skyBounds, targetFor)
    │   └── bodies.ts          # Planets and beacon
    ├── hooks/
    │   ├── device.ts          # Touch detection
    │   ├── usePortrait.ts     # Rotates the sky on tall screens
    │   └── useSceneSupport.ts # WebGL / data-saver detection, reduced motion
    ├── scene/                 # Lazy-loaded three.js chunk
    │   ├── SpaceScene.tsx     # Canvas, camera rig, gestures
    │   ├── Constellation.tsx  # Star sprites, lines, labels
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
| `npm run build` | Type-check with `tsc -b`, then build to `dist/` |
| `npm run preview` | Serve the production build locally |

<p align="right"><a href="#top">back to top ↑</a></p>

---

## Testing

There are no automated tests. `npm run build` type-checks the project. Before shipping, check by hand:

- [ ] Desktop: drag, wheel zoom, click a star → panel opens and the star sits left of the panel.
- [ ] About, Toolkit and Contact open from both the header chips and the planets.
- [ ] Clicking empty sky or pressing Escape closes the panel; **Recenter** returns home.
- [ ] Phone (375×812, browser dev tools device mode): HUD fits with no horizontal scroll, labels don't overlap, constellation chips swipe sideways, tapping a star opens the bottom sheet with the star visible above it, the page never scrolls.
- [ ] Phone in landscape (812×375): compact title, sky still fits.
- [ ] `?mode=static`: SVG map shows the constellations and the three planets, and panels open.
- [ ] OS *reduce motion* on: no sway, twinkle or shooting stars; camera jumps instead of flying.
- [ ] No errors in the browser console.

<p align="right"><a href="#top">back to top ↑</a></p>

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Only the flat star map shows | The browser has no WebGL (or it crashed). Enable hardware acceleration, or remove `?mode=static` from the URL. |
| Port 5173 already in use | Stop the other process, or run `npx vite --port 5174`. |
| Can't open the site on a phone | Use the *Network* URL Vite prints, on the same Wi-Fi; allow Node through the firewall. |
| Sky looks cut off under the notch | Make sure `viewport-fit=cover` is still in the viewport meta tag in `index.html`. |
| Large chunk warning on build | Expected: three.js lives in the lazily loaded `SpaceScene` chunk on purpose. |

<p align="right"><a href="#top">back to top ↑</a></p>

---

## Contributing

1. Create a branch with a matching prefix: `feat/short-description`, `fix/short-description`, `docs/…`, `refactor/…`.
2. Use [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `style:`, `perf:`, `test:` — an imperative subject of 72 characters or less, a blank line, then one bullet per change.
3. Write the commit message in `commit-msg.txt` at the project root. It is git-ignored, so it stays a local draft. `.claude/` (local Claude settings and worktrees) and `CLAUDE.md` (personal instructions for Claude) are git-ignored too.
4. Run `npm run build` and the manual checks in [Testing](#testing), on desktop and a phone-sized viewport.
5. **Update this README with every change**, including the version badges when dependencies change.

<p align="right"><a href="#top">back to top ↑</a></p>

---

## License

All rights reserved. No license has been chosen yet; contact the author before reusing the code or content.

<p align="right"><a href="#top">back to top ↑</a></p>

---

## Author

**Sprucetrap** — [@Jevoel16](https://github.com/Jevoel16) · personal portfolio

<p align="right"><a href="#top">back to top ↑</a></p>
