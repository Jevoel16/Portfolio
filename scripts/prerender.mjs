// Turns the client build into one static HTML file per route, plus sitemap.xml and llms.txt.
// Runs after `vite build` and `vite build --ssr src/entry-server.tsx --outDir dist-ssr`.
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const dist = path.join(root, 'dist')
const ssrDir = path.join(root, 'dist-ssr')

const server = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href)
// One source of truth for the canonical origin (src/seo/meta.ts).
const { SITE_URL } = server
const template = await readFile(path.join(dist, 'index.html'), 'utf8')

const HEAD = /<!--head:start-->[\s\S]*?<!--head:end-->/
if (!HEAD.test(template) || !template.includes('<!--app-html-->')) {
  throw new Error('dist/index.html is missing the <!--head:start/end--> or <!--app-html--> markers')
}

// Preload the Latin subsets of both fonts: they are needed for the first paint on every page.
const assets = await readdir(path.join(dist, 'assets'))
const fontPreloads = assets
  .filter((f) => /^(space-grotesk|jetbrains-mono)-latin-wght-normal-.*\.woff2$/.test(f))
  .map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin />`)
  .join('\n    ')

/** /about → dist/about.html; / → dist/index.html. Vercel's cleanUrls serves them without .html. */
const fileFor = (url) => (url === '/' ? path.join(dist, 'index.html') : path.join(dist, `${url.slice(1)}.html`))

async function writePage(url, file) {
  const { html, head } = await server.render(url)
  // data-path tells the client which URL this markup was rendered for (404.html is served for many URLs).
  const page = template
    .replace(HEAD, `${head}\n    ${fontPreloads}`)
    .replace('<div id="root"><!--app-html-->', `<div id="root" data-path="${url}">${html}`)
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, page)
}

const indexable = server.indexablePaths()
const urls = [...indexable, ...server.extraPaths()]
for (const url of urls) await writePage(url, fileFor(url))
// Vercel serves 404.html with a 404 status for any path that has no file.
await writePage('/404', path.join(dist, '404.html'))

// sitemap.xml: indexable pages only; posts carry their last-modified date.
const lastmod = new Map(server.posts.map((p) => [`/blog/${p.slug}`, p.updated ?? p.date]))
const newest = server.posts[0] ? server.posts[0].updated ?? server.posts[0].date : undefined
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable
  .map((url) => {
    const mod = lastmod.get(url) ?? (url === '/blog' ? newest : undefined)
    return `  <url><loc>${SITE_URL}${url === '/' ? '/' : url}</loc>${mod ? `<lastmod>${mod}</lastmod>` : ''}</url>`
  })
  .join('\n')}
</urlset>
`
await writeFile(path.join(dist, 'sitemap.xml'), sitemap)

// llms.txt: a plain-text map of the site for language models (https://llmstxt.org).
const line = (url) => {
  const meta = server.metaFor(url)
  return `- [${meta.title}](${SITE_URL}${url === '/' ? '/' : url}): ${meta.description}`
}
const llms = `# Sprucetrap

> Portfolio and blog of Sprucetrap, an aspiring cybersecurity professional and full-stack developer.
> Projects are shown as stars in constellations (skill areas) in an interactive 3D night sky;
> every star also has its own prerendered page.

## Pages

${['/', '/about', '/toolkit', '/contact', '/blog'].map(line).join('\n')}

## Projects

${indexable.filter((u) => u.startsWith('/projects/')).map(line).join('\n')}

## Blog posts

${indexable.filter((u) => u.startsWith('/blog/')).map(line).join('\n') || '- No posts yet.'}

## Elsewhere

- [GitHub](https://github.com/Jevoel16): source code for every project
`
await writeFile(path.join(dist, 'llms.txt'), llms)

await rm(ssrDir, { recursive: true, force: true })
console.log(`prerendered ${urls.length + 1} pages, sitemap.xml (${indexable.length} urls) and llms.txt`)
