// Celestial bodies that hold the non-project content (About, tech stack, Contact).
// Same sky coordinates as constellations.ts. Ids must not clash with project ids.

export type BodyId = 'about' | 'toolkit' | 'contact'

export interface Body {
  id: BodyId
  name: string
  /** Short line under the name in the sky and the HUD. */
  caption: string
  kind: 'planet' | 'ringed' | 'beacon'
  color: string
  /** Second colour for planet bands or beacon rings. */
  color2: string
  x: number
  y: number
  z: number
  /** Visual radius in sky units. */
  radius: number
}

export const bodies: Body[] = [
  {
    id: 'about',
    name: 'About',
    caption: 'home planet',
    kind: 'planet',
    color: '#f5c86b',
    color2: '#c0563f',
    x: 0,
    y: 4.5,
    z: -0.4,
    radius: 0.62,
  },
  {
    id: 'toolkit',
    name: 'Toolkit',
    caption: 'tech stack',
    kind: 'ringed',
    color: '#8fb4ff',
    color2: '#4a3fa8',
    x: 0.2,
    y: -4.8,
    z: -0.3,
    radius: 0.5,
  },
  {
    id: 'contact',
    name: 'Contact',
    caption: 'open channel',
    kind: 'beacon',
    color: '#7fe3c4',
    color2: '#3fb8ff',
    x: 10.6,
    y: -0.6,
    z: 0.2,
    radius: 0.3,
  },
]

export const bodyById = new Map(bodies.map((b) => [b.id, b]))

export const isBodyId = (id: string | null | undefined): id is BodyId => !!id && bodyById.has(id as BodyId)
