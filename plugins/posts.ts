import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { Marked, type Tokens } from 'marked'
import { bundledLanguages, createHighlighter, type Highlighter } from 'shiki'
import type { Plugin } from 'vite'
import type { Post, PostMeta, TocEntry } from '../src/content/types'

const POSTS_DIR = path.resolve(process.cwd(), 'content/posts')
const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/
const DATE = /^\d{4}-\d{2}-\d{2}$/
const THEME = 'github-dark-default'

type Value = string | string[] | boolean

/** Minimal YAML subset: `key: value`, `key: [a, b]`, booleans and quoted strings. */
export function parseFrontmatter(source: string, file: string): { data: Record<string, Value>; body: string } {
  const match = FRONTMATTER.exec(source)
  if (!match) throw new Error(`${file}: missing --- frontmatter --- block`)
  const data: Record<string, Value> = {}
  for (const raw of match[1].split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const sep = line.indexOf(':')
    if (sep < 1) throw new Error(`${file}: bad frontmatter line "${line}"`)
    const key = line.slice(0, sep).trim()
    const value = line.slice(sep + 1).trim()
    const unquote = (v: string) => v.replace(/^(['"])(.*)\1$/, '$2')
    if (value.startsWith('[') && value.endsWith(']')) {
      data[key] = value.slice(1, -1).split(',').map((v) => unquote(v.trim())).filter(Boolean)
    } else if (value === 'true' || value === 'false') {
      data[key] = value === 'true'
    } else {
      data[key] = unquote(value)
    }
  }
  return { data, body: source.slice(match[0].length) }
}

export function toMeta(slug: string, data: Record<string, Value>, body: string, file: string): PostMeta {
  const str = (key: string, required = true) => {
    const v = data[key]
    if (v === undefined && !required) return undefined
    if (typeof v !== 'string' || !v) throw new Error(`${file}: frontmatter "${key}" must be a non-empty string`)
    return v
  }
  if (!SLUG.test(slug)) throw new Error(`${file}: file name must be a lowercase-hyphenated slug`)
  const date = str('date')!
  const updated = str('updated', false)
  for (const d of [date, updated]) if (d && !DATE.test(d)) throw new Error(`${file}: dates must be YYYY-MM-DD`)
  const tags = data.tags ?? []
  if (!Array.isArray(tags)) throw new Error(`${file}: "tags" must be a [list]`)
  const words = body.split(/\s+/).filter(Boolean).length
  return {
    slug,
    title: str('title')!,
    ...(data.short ? { short: str('short')! } : {}),
    date,
    ...(updated ? { updated } : {}),
    summary: str('summary')!,
    tags,
    ...(data.constellation ? { constellation: str('constellation')! } : {}),
    readingMinutes: Math.max(1, Math.round(words / 220)),
    draft: data.draft === true,
  }
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z]+;/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

let highlighter: Promise<Highlighter> | undefined
const getHighlighter = () => (highlighter ??= createHighlighter({ themes: [THEME], langs: [] }))

export async function renderMarkdown(body: string): Promise<{ html: string; toc: TocEntry[] }> {
  const hl = await getHighlighter()
  const toc: TocEntry[] = []
  const used = new Map<string, number>()
  const highlighted = new WeakMap<Tokens.Code, string>()

  const marked = new Marked({ async: true, gfm: true })
  marked.use({
    async walkTokens(token) {
      if (token.type !== 'code') return
      const code = token as Tokens.Code
      const lang = (code.lang ?? '').split(/\s/)[0].toLowerCase()
      const known = lang in bundledLanguages ? lang : 'text'
      if (known !== 'text' && !hl.getLoadedLanguages().includes(known)) await hl.loadLanguage(known as keyof typeof bundledLanguages)
      const html = hl.codeToHtml(code.text, { lang: known, theme: THEME })
      // Terminal-style frame; the label shows the language like a window title.
      highlighted.set(code, `<figure class="code-block" data-lang="${known}">${html}</figure>`)
    },
    renderer: {
      code(token) {
        return highlighted.get(token) ?? false
      },
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens)
        const base = slugify(text) || 'section'
        const n = used.get(base) ?? 0
        used.set(base, n + 1)
        const id = n ? `${base}-${n}` : base
        // The post title is the page's only h1, so Markdown headings start at h2.
        const level = Math.min(Math.max(depth, 2), 6)
        if (level === 2 || level === 3) toc.push({ id, text: text.replace(/<[^>]+>/g, ''), depth: level })
        return `<h${level} id="${id}"><a class="anchor" href="#${id}" aria-hidden="true" tabindex="-1">#</a>${text}</h${level}>\n`
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens)
        const external = /^https?:\/\//.test(href)
        const t = title ? ` title="${title}"` : ''
        return external
          ? `<a href="${href}"${t} target="_blank" rel="noopener noreferrer">${text}</a>`
          : `<a href="${href}"${t}>${text}</a>`
      },
      image({ href, title, text }) {
        if (!text) throw new Error(`Image ${href} needs alt text: ![describe it](${href})`)
        const t = title ? ` title="${title}"` : ''
        return `<img src="${href}" alt="${text}"${t} loading="lazy" decoding="async" />`
      },
    },
  })
  const html = await marked.parse(body)
  return { html, toc }
}

/**
 * Turns content/posts/*.md into JS modules at build time:
 * `post.md?meta` → PostMeta (cheap, bundled eagerly for lists and sky stars),
 * `post.md` → full Post with pre-rendered HTML (lazy-loaded per page).
 */
export function posts(): Plugin {
  return {
    name: 'sprucetrap-posts',
    async load(id) {
      const [file, query] = id.split('?')
      if (!file.endsWith('.md') || !path.resolve(file).startsWith(POSTS_DIR)) return null
      const source = await readFile(file, 'utf8')
      const rel = path.relative(process.cwd(), file)
      const { data, body } = parseFrontmatter(source, rel)
      const meta = toMeta(path.basename(file, '.md'), data, body, rel)
      if (query === 'meta') return `export default ${JSON.stringify(meta)}`
      const post: Post = { ...meta, ...(await renderMarkdown(body)) }
      return `export default ${JSON.stringify(post)}`
    },
  }
}
