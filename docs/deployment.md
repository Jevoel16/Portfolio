# Deployment, SEO and analytics

[← back to the README](../README.md)

## Continuous integration

[`.github/workflows/ci.yml`](../.github/workflows/ci.yml) runs on every push and pull request to `main`: `npm ci`, `npm audit --audit-level=high`, `npm test`, `npm run build`, then checks that `dist/` has the HTML, sitemap, robots and llms files and no links to the apex domain. The built `dist/` is kept as a run artifact for 7 days. Run the same checks locally before pushing:

```bash
npm ci && npm audit --audit-level=high && npm test && npm run build
```

## Vercel and smoke test

Vercel builds and deploys through its Git integration: pushes to `main` go to production, other branches get preview URLs. The apex domain redirects to `https://www.jevoelorbilla.dev` in Vercel Domains.

When Vercel marks a commit on `main` as deployed (its "Vercel" commit status turns green), [`.github/workflows/smoke.yml`](../.github/workflows/smoke.yml) runs `scripts/smoke.mjs` against the live site: every key route, redirect loops, the 404 page, that the home page's scripts, styles and icons load, security headers and the SEO files. It also runs every Monday and can be started by hand from the Actions tab. No secrets are needed.

```bash
npm run smoke                          # live site
npm run smoke -- https://other-url     # another deploy
```

## Hosting files

| File | Purpose |
| --- | --- |
| `vercel.json` | Clean URLs, security headers (HSTS, CSP, …), one-year caching for hashed `/assets/*` |
| `public/robots.txt` | Allows all crawlers and points to the sitemap |
| `public/site.webmanifest`, `favicon.svg`, `apple-touch-icon.png`, `icon-512.png` | Icons for tabs, home screens and installs |
| `public/og-default.png` | 1200×630 image used by link previews |
| `src/seo/meta.ts` | Titles, descriptions, canonicals and JSON-LD for every route; `SITE_URL` is the production domain |

## Analytics

`<Analytics />` from `@vercel/analytics/react` is mounted once in `src/App.tsx` and records a page view on every route change, including the URL changes as you scroll between sections. It is cookie-free and loads its script from the same origin (`/_vercel/insights/script.js`), so the existing CSP needs no changes. Turn on **Web Analytics** for the project in the Vercel dashboard; data appears after the next deploy. Locally it runs in debug mode and logs page views to the console instead of sending them.

## Search engines and sharing

After deploying, submit `https://www.jevoelorbilla.dev/sitemap.xml` in [Google Search Console](https://search.google.com/search-console) and Bing Webmaster Tools, and test a page with the [Rich Results Test](https://search.google.com/test/rich-results).

Backlink ideas (do these yourself; nothing here is posted automatically):

- Link the site from the GitHub profile README and from each project repository's *About → Website* field.
- Cross-post blog write-ups to dev.to or Hashnode with the canonical URL set to the post on this site.
- Add the site to your LinkedIn *Featured* section and to TryHackMe / Hack The Box profiles.
- Share security write-ups in communities that allow it (r/netsec rules permitting, Discord study groups), linking the post rather than the home page.
- Ask your school organisation or course pages that list student projects to link to the relevant project page.
