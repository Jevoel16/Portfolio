# Editing content

[← back to the README](../README.md)

No environment variables are needed. Everything on the site comes from these files:

| File | What it holds |
| --- | --- |
| `src/data/projects.ts` | Every project (name, description, stack, GitHub URL) and the Toolkit tech-stack groups |
| `src/data/constellations.ts` | Constellation names, colours and star positions in sky coordinates |
| `src/data/bodies.ts` | The About / Toolkit / Contact planets: kind, colours, position, size |
| `src/pages/ScrollPage.tsx` | The About copy, section order and section text |
| `src/data/profile.ts` | GitHub and license links, and the avatar image path, size and alt text |
| `src/data/dialogue.ts` | What Spruce says in the Contact section |
| `public/avatar/spruce.webp` | The avatar artwork (black background; the page blends it out) |
| `content/posts/*.md` | Blog posts (see below) |

## Writing a post

Create `content/posts/<slug>.md` (the file name is the URL, lowercase and hyphenated):

````markdown
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
````

Rules the build enforces: `title`, `date` and `summary` are required, dates use `YYYY-MM-DD`, and every image needs alt text (`![what it shows](/images/x.png)`). Headings start at `##`; the post title is the page's only `<h1>`.

## Adding a project

1. Add it to `projects` in `src/data/projects.ts`; its card appears under its constellation and `/projects/<id>` is prerendered.
2. Give it a star in the right constellation in `src/data/constellations.ts` (`projectId` = the project's `id`) and, optionally, edges to link it in.
3. Run `npm test` and `npm run build`, then check the new card and page on desktop and at 375×812.
