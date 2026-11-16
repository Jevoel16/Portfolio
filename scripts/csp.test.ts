import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'

const read = (file: string) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')

it('allows every inline script in index.html by its hash in the CSP', () => {
  const inline = [...read('index.html').matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1])
  expect(inline.length).toBeGreaterThan(0)
  const csp = read('vercel.json')
  for (const code of inline) {
    const hash = createHash('sha256').update(code).digest('base64')
    expect(csp).toContain(`'sha256-${hash}'`)
  }
})
