import { describe, expect, it } from 'vitest'
import { parseFrontmatter, renderMarkdown, toMeta } from './posts'

const source = `---
title: "A post: with a colon"
date: 2026-01-02
summary: Short summary
tags: [one, two]
constellation: security
draft: true
---

## Hello world

Body text with a [link](https://example.com).
`

describe('posts plugin', () => {
  it('parses frontmatter strings, lists and booleans', () => {
    const { data, body } = parseFrontmatter(source, 'x.md')
    expect(data).toMatchObject({ title: 'A post: with a colon', tags: ['one', 'two'], draft: true })
    expect(body.trim().startsWith('## Hello world')).toBe(true)
  })

  it('validates required fields and slugs', () => {
    const { data, body } = parseFrontmatter(source, 'x.md')
    expect(toMeta('good-slug', data, body, 'x.md')).toMatchObject({ slug: 'good-slug', constellation: 'security', draft: true })
    expect(() => toMeta('Bad Slug', data, body, 'x.md')).toThrow(/slug/)
    expect(() => toMeta('ok', { ...data, date: '2 Jan 2026' }, body, 'x.md')).toThrow(/YYYY-MM-DD/)
    expect(() => toMeta('ok', { ...data, summary: '' }, body, 'x.md')).toThrow(/summary/)
  })

  it('renders anchored headings, safe external links and a TOC', async () => {
    const { html, toc } = await renderMarkdown('# Title\n\n## Hello world\n\n[x](https://example.com)')
    // Markdown h1 is demoted: the page title is the only h1.
    expect(html).not.toContain('<h1')
    expect(html).toContain('<h2 id="title">')
    expect(html).toContain('rel="noopener noreferrer"')
    expect(toc.map((t) => t.id)).toEqual(['title', 'hello-world'])
  })

  it('requires alt text on images', async () => {
    await expect(renderMarkdown('![](/a.png)')).rejects.toThrow(/alt text/)
  })
})
