# Sprucetrap Portfolio — instructions for Claude

React 18 + Vite + TypeScript + react-three-fiber. The whole site is one full-screen, interactive night sky:
projects are stars in constellations, and About / Toolkit / Contact are celestial bodies (`src/data/bodies.ts`).
The SVG map in `src/static/StaticSky.tsx` is only the loading placeholder and the no-WebGL fallback (`?mode=static` forces it).

## Rules (synced from my global "Instructions for Claude")

### Dev servers
- Start the dev server with the `portfolio` entry in `.claude/launch.json` (port 5173).
- Always stop any dev server, preview or background process you start once done, and confirm port 5173 is free before finishing.

### Code
- TypeScript/React, matching the existing style: function components, small focused files, no new dependencies unless needed.
- Clean, readable code with consistent naming. Short comments that explain the "why".
- Error handling and validation where it matters. Prefer simple solutions.
- Keep the site usable on phones (touch gestures, bottom-sheet panels, safe areas) and check a 375×812 viewport after visual changes.
- When fixing a bug, briefly explain the cause and the fix. For multi-file changes, list the files and what changed in each.

### README
- Keep `README.md` comprehensive, in this order: title and description, features, tech stack, prerequisites, installation, configuration and environment variables, usage, project structure, scripts, testing, troubleshooting, contributing, license, author.
- Centered header with logo, title and tagline; flat shields.io "name | version" badges (no logos) using installed versions; status badges; table of contents, dividers, "back to top" links; long tables in collapsible sections.
- Update the README (and its version badges) after every change and whenever dependencies change.

### Git and commits
- Never commit, stage or push. After every change, write the commit message to `commit-msg.txt` at the project root, replacing what was there.
- `commit-msg.txt` is listed in `.gitignore`; keep it there so the draft message never gets committed.
- Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `style:`, `perf:`, `test:`): imperative subject ≤ 72 characters, blank line, one bullet per change.
- Never include `Co-Authored-By` or any AI attribution.
- Branch names use a matching prefix, e.g. `feat/short-description`.
