import { posts } from '../content/posts'
import { projectById, projects, type ConstellationId } from './projects'
import { bodies, bodyById, type Body, type BodyId } from './bodies'

// Sky coordinates: x right, y up, z toward the viewer. Roughly x ∈ [-9, 9], y ∈ [-6, 6].
// The 3D scene uses them directly; the static SVG map flips y.

export interface Star {
  key: string
  /** Project id, or undefined for a decorative star that only shapes the figure. */
  projectId?: string
  /** Blog post slug, for write-up stars in the Cybersecurity constellation. */
  postSlug?: string
  x: number
  y: number
  z: number
}

export interface Constellation {
  id: ConstellationId
  name: string
  blurb: string
  color: string
  /** Where the constellation's name is drawn. */
  label: { x: number; y: number }
  stars: Star[]
  /** Pairs of star keys joined by a line. */
  edges: [string, string][]
  /** Still forming: drawn faint with dashed lines and no clickable stars. */
  forming?: boolean
}

export const constellations: Constellation[] = [
  {
    id: 'fullstack',
    name: 'Full-Stack Web',
    blurb: 'REST APIs with Express and FastAPI behind React and Next.js frontends, with auth, roles and audit trails.',
    color: '#f5c86b',
    label: { x: -6, y: 5.4 },
    stars: [
      { key: 'pulse', projectId: 'the-pulse', x: -7.6, y: 3.5, z: 0.4 },
      { key: 'rankit', projectId: 'rankit', x: -5.1, y: 4.4, z: -0.8 },
      { key: 'gpa', projectId: 'gpa-calculator', x: -3.9, y: 2.3, z: 0.6 },
      { key: 'cryp', projectId: 'cryp-cross', x: -6.5, y: 1.4, z: -0.3 },
    ],
    edges: [
      ['pulse', 'rankit'],
      ['rankit', 'gpa'],
      ['gpa', 'cryp'],
      ['cryp', 'pulse'],
    ],
  },
  {
    id: 'ml',
    name: 'Data & ML',
    blurb: 'Machine learning pipelines from data cleaning to forecasting, explained with SHAP and shown in interactive charts.',
    color: '#9ad1ff',
    label: { x: 6.2, y: 5.4 },
    stars: [
      { key: 'tourist', projectId: 'tourist-arrivals', x: 4.6, y: 3.9, z: 0.5 },
      { key: 'soil', projectId: 'soil-weather', x: 7.3, y: 2.5, z: -0.4 },
      { key: 'm1', x: 8.3, y: 4.5, z: -1 },
      { key: 'm2', x: 5.5, y: 1.5, z: 0.8 },
    ],
    edges: [
      ['tourist', 'm1'],
      ['tourist', 'soil'],
      ['soil', 'm2'],
    ],
  },
  {
    id: 'network',
    name: 'Networking',
    blurb: 'HTTP and WebSocket servers written from scratch, real-time broadcasting and WebRTC video calls.',
    color: '#c7a6ff',
    label: { x: -6, y: -5.6 },
    stars: [
      { key: 'jmeet', projectId: 'jmeet', x: -4.5, y: -3.1, z: 0.5 },
      { key: 'bsl', projectId: 'bsl-http-server', x: -7.3, y: -4.2, z: -0.5 },
      { key: 'n1', x: -6.3, y: -1.9, z: 0.2 },
      { key: 'n2', x: -2.9, y: -4.5, z: -0.6 },
    ],
    edges: [
      ['bsl', 'n1'],
      ['n1', 'jmeet'],
      ['jmeet', 'n2'],
      ['bsl', 'jmeet'],
    ],
  },
  {
    id: 'databases',
    name: 'Databases',
    blurb: 'Document, relational, graph, key-value and wide-column stores: MongoDB, MySQL, Neo4j, Redis and Cassandra.',
    color: '#7fe3c4',
    label: { x: 6, y: -5.9 },
    stars: [
      { key: 'neo4j', projectId: 'itd110-neo4j', x: 3.1, y: -2.1, z: 0.3 },
      { key: 'redis', projectId: 'itd110-redis', x: 4.8, y: -3.3, z: -0.6 },
      { key: 'cassandra', projectId: 'itd110-cassandra', x: 6.7, y: -2.4, z: 0.7 },
      { key: 'mongo', projectId: 'itd110', x: 7.9, y: -4.1, z: -0.2 },
      { key: 'school', projectId: 'school-enrollment', x: 5.4, y: -4.9, z: 0.4 },
    ],
    edges: [
      ['neo4j', 'redis'],
      ['redis', 'cassandra'],
      ['cassandra', 'mongo'],
      ['redis', 'school'],
      ['school', 'mongo'],
    ],
  },
  securityConstellation(),
]

/**
 * The Cybersecurity figure grows from blog write-ups: each post with `constellation: security`
 * claims one of the five base stars (oldest first), and later posts orbit around them.
 */
function securityConstellation(): Constellation {
  const base: Star[] = [
    { key: 's1', x: -0.9, y: 0.7, z: 0.3 },
    { key: 's2', x: 0.4, y: 1.3, z: -0.4 },
    { key: 's3', x: 1.3, y: 0.1, z: 0.5 },
    { key: 's4', x: 0.1, y: -0.8, z: -0.2 },
    { key: 's5', x: -1.2, y: -0.4, z: 0.1 },
  ]
  const edges: [string, string][] = [
    ['s1', 's2'],
    ['s2', 's3'],
    ['s3', 's4'],
    ['s4', 's5'],
    ['s5', 's1'],
  ]
  const writeups = posts.filter((p) => p.constellation === 'security').reverse()
  const stars = base.map((s, i) => (writeups[i] ? { ...s, postSlug: writeups[i].slug } : s))
  writeups.slice(base.length).forEach((p, i) => {
    // Golden-angle spiral keeps extra stars evenly spread without hand placement.
    const angle = i * 2.39996 + 0.4
    const r = 2 + 0.18 * i
    const key = `w${i}`
    stars.push({ key, postSlug: p.slug, x: 0.1 + Math.cos(angle) * r, y: 0.2 + Math.sin(angle) * r * 0.8, z: ((i % 3) - 1) * 0.4 })
    edges.push([key, base[i % base.length].key])
  })
  const forming = writeups.length === 0
  return {
    id: 'security',
    name: 'Cybersecurity',
    blurb: forming
      ? 'My current focus. This constellation is still forming — stars appear here as I publish write-ups and finish security projects.'
      : 'My current focus: write-ups, labs and notes from learning cybersecurity. Each star is a post.',
    color: '#ff7a9c',
    label: { x: 0, y: -1.9 },
    forming,
    stars,
    edges,
  }
}

const trimLabel = (text: string, max = 24) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text)

/** Selection id of a star: project id, `post:<slug>` for write-ups, or undefined for decorative stars. */
export const starId = (s: Star) => s.projectId ?? (s.postSlug ? `post:${s.postSlug}` : undefined)

export interface StarItem {
  id: string
  name: string
  featured: boolean
}

/** What a clickable star stands for, for labels in both the 3D and SVG skies. */
export function starItem(s: Star): StarItem | undefined {
  if (s.projectId) {
    const p = projectById.get(s.projectId)
    return p && { id: p.id, name: p.name, featured: p.featured }
  }
  const post = s.postSlug ? posts.find((p) => p.slug === s.postSlug) : undefined
  return post && { id: `post:${post.slug}`, name: post.short ?? trimLabel(post.title), featured: false }
}

export const constellationById = new Map(constellations.map((c) => [c.id, c]))

/** Star lookup by selection id (project id or `post:<slug>`): which constellation and where. */
export const starForId = new Map(
  constellations.flatMap((c) => c.stars.flatMap((s) => (starId(s) ? [[starId(s)!, { constellation: c, star: s }] as const] : []))),
)

/** Star to open when a constellation chip is pressed: a featured project first, then any star. */
export function firstStarId(c: Constellation): string | undefined {
  const ids = c.stars.map(starId).filter((id): id is string => !!id)
  return ids.find((id) => projectById.get(id)?.featured) ?? ids[0] ?? projects.find((p) => p.constellation === c.id)?.id
}

/** On portrait screens the wide sky is rotated a quarter turn so it fills the height. */
export function orient(x: number, y: number, portrait: boolean): [number, number] {
  return portrait ? [-y * 0.85, x * 1.05] : [x, y]
}

/**
 * Oriented position of a constellation's name. Landscape uses the hand-placed spot; in portrait
 * the figures are rotated, so the name goes centred above its stars (star names hang below them).
 */
export function labelPosition(c: Constellation, portrait: boolean): [number, number] {
  if (!portrait) return [c.label.x, c.label.y]
  const pts = c.stars.map((s) => orient(s.x, s.y, portrait))
  const xs = pts.map((p) => p[0])
  const x = (Math.min(...xs) + Math.max(...xs)) / 2
  return [x, Math.max(...pts.map((p) => p[1])) + 0.75]
}

/** Oriented sky position of a project star or a celestial body, or undefined for an unknown id. */
export function targetFor(id: string, portrait: boolean): { x: number; y: number; z: number; body?: Body } | undefined {
  const body = bodyById.get(id as BodyId)
  const src = body ?? starForId.get(id)?.star
  if (!src) return undefined
  const [x, y] = orient(src.x, src.y, portrait)
  return { x, y, z: src.z, body }
}

/** Oriented position of a body's name, just under it. */
export function bodyLabelPosition(b: Body, portrait: boolean): [number, number] {
  const [x, y] = orient(b.x, b.y, portrait)
  return [x, y - b.radius - 0.55]
}

/** Box (in oriented sky units) that both views fit to the screen, with room for labels. */
export function skyBounds(portrait: boolean) {
  const pts = [
    ...constellations.flatMap((c) => [...c.stars.map((s) => orient(s.x, s.y, portrait)), labelPosition(c, portrait)]),
    ...bodies.flatMap((b) => [orient(b.x, b.y + b.radius, portrait), bodyLabelPosition(b, portrait)]),
  ]
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  const mx = portrait ? 1.2 : 1.4
  const my = portrait ? 0.7 : 0.8
  const minX = Math.min(...xs) - mx
  const maxX = Math.max(...xs) + mx
  // Extra room at the bottom for the name hanging under the lowest star.
  const minY = Math.min(...ys) - my - 0.4
  const maxY = Math.max(...ys) + my
  return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY }
}
