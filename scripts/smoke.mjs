// Post-deploy smoke test: checks the live site answers every key route without redirect loops,
// sends its security headers and serves the SEO files. Usage: node scripts/smoke.mjs [baseUrl]
const base = (process.argv[2] ?? 'https://www.jevoelorbilla.dev').replace(/\/$/, '')
const MAX_HOPS = 5
const failures = []

/** Follows redirects by hand so a loop is reported as such instead of a generic fetch error. */
async function get(url) {
  const hops = []
  for (let i = 0; i <= MAX_HOPS; i++) {
    const res = await fetch(url, { redirect: 'manual', headers: { 'user-agent': 'portfolio-smoke-test' } })
    const next = res.headers.get('location')
    if (res.status < 300 || res.status >= 400 || !next) return { res, hops }
    url = new URL(next, url).href
    if (hops.includes(url)) throw new Error(`redirect loop: ${[...hops, url].join(' -> ')}`)
    hops.push(url)
  }
  throw new Error(`more than ${MAX_HOPS} redirects: ${hops.join(' -> ')}`)
}

async function check(name, fn) {
  try {
    await fn()
    console.log(`ok   ${name}`)
  } catch (err) {
    failures.push(name)
    console.error(`FAIL ${name}: ${err.message}`)
  }
}

const expectStatus = (res, status) => {
  if (res.status !== status) throw new Error(`expected ${status}, got ${res.status}`)
}

for (const path of ['/', '/about', '/toolkit', '/contact', '/blog', '/projects/the-pulse']) {
  await check(`GET ${path}`, async () => {
    const { res } = await get(base + path)
    expectStatus(res, 200)
    const html = await res.text()
    if (!html.includes('rel="canonical"')) throw new Error('missing canonical link')
  })
}

// A page can return 200 while its CSS/JS redirect away (CSP then blocks them), leaving it unstyled and dead.
await check('home page scripts, styles and icons load', async () => {
  const { res } = await get(`${base}/`)
  const html = await res.text()
  const refs = [...html.matchAll(/(?:src|href)="(\/(?:assets\/[^"]+|favicon\.svg|site\.webmanifest))"/g)].map((m) => m[1])
  if (!refs.some((r) => r.endsWith('.js'))) throw new Error('no /assets/*.js referenced by the home page')
  for (const ref of new Set(refs)) {
    const asset = await fetch(base + ref, { redirect: 'manual' })
    if (asset.status !== 200) throw new Error(`${ref} returned ${asset.status}`)
  }
})

await check('unknown path returns 404', async () => {
  const { res } = await get(`${base}/this-page-does-not-exist`)
  expectStatus(res, 404)
})

for (const file of ['/robots.txt', '/sitemap.xml', '/llms.txt']) {
  await check(`GET ${file}`, async () => {
    const { res } = await get(base + file)
    expectStatus(res, 200)
  })
}

await check('security headers', async () => {
  const { res } = await get(`${base}/`)
  for (const h of ['content-security-policy', 'strict-transport-security', 'x-content-type-options', 'x-frame-options', 'referrer-policy']) {
    if (!res.headers.get(h)) throw new Error(`missing ${h}`)
  }
})

// Only meaningful against the production domain: the apex and plain HTTP must land on the www page.
if (new URL(base).hostname === 'www.jevoelorbilla.dev') {
  for (const alias of ['https://jevoelorbilla.dev/about', 'http://jevoelorbilla.dev/about', 'http://www.jevoelorbilla.dev/about']) {
    await check(`${alias} redirects to www`, async () => {
      const { res, hops } = await get(alias)
      expectStatus(res, 200)
      if (hops.at(-1) !== `${base}/about`) throw new Error(`ended at ${hops.at(-1) ?? alias}`)
    })
  }
}

if (failures.length) {
  console.error(`\n${failures.length} smoke check(s) failed against ${base}`)
  process.exit(1)
}
console.log(`\nall smoke checks passed against ${base}`)
