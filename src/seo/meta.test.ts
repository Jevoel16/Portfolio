import { describe, expect, it } from 'vitest'
import { extraPaths, headHtml, indexablePaths, metaFor } from './meta'

describe('page meta', () => {
  const all = [...indexablePaths(), ...extraPaths()]

  it('gives every indexable page a unique title and a description', () => {
    const titles = indexablePaths().map((p) => metaFor(p).title)
    expect(new Set(titles).size).toBe(titles.length)
    for (const p of all) expect(metaFor(p).description.length, p).toBeGreaterThan(30)
  })

  it('never marks real pages noindex, and marks unknown ones', () => {
    for (const p of all) expect(metaFor(p).noindex, p).toBeFalsy()
    expect(metaFor('/nope').noindex).toBe(true)
  })

  it('points write-up panels at the blog post as canonical', () => {
    for (const p of extraPaths()) expect(metaFor(p).canonical).toBe(p.replace('/writeups/', '/blog/'))
  })

  it('uses lowercase hyphenated URLs', () => {
    for (const p of all) expect(p).toMatch(/^\/([a-z0-9-]+(\/[a-z0-9-]+)*)?$/)
  })

  it('escapes head content', () => {
    const html = headHtml({ ...metaFor('/'), title: 'a "b" <c>', jsonLd: [{ x: '</script>' }] })
    expect(html).toContain('a &quot;b&quot; &lt;c&gt;')
    expect(html).not.toContain('</script></script>')
  })
})
