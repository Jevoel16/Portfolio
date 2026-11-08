import { describe, expect, it } from 'vitest'
import robots from '../../public/robots.txt?raw'
import vercelJson from '../../vercel.json?raw'
import { SITE_URL } from './meta'

// Vercel 308s the apex to www, so an apex redirect in vercel.json would loop.
describe('canonical domain', () => {
  it('uses the www host that Vercel serves', () => {
    expect(SITE_URL).toBe('https://www.jevoelorbilla.dev')
  })

  it('never redirects www back to the apex in vercel.json', () => {
    const config = JSON.parse(vercelJson) as { redirects?: { destination: string }[] }
    for (const r of config.redirects ?? []) expect(r.destination).not.toMatch(/^https:\/\/jevoelorbilla\.dev/)
  })

  it('points robots.txt at the canonical sitemap', () => {
    expect(robots).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`)
  })
})
