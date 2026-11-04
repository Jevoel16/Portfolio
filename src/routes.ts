import { postBySlug } from './content/posts'
import { bodyById, type BodyId } from './data/bodies'
import { projectById } from './data/projects'

/** URL for a sky selection: bodies at the top level, projects under /projects, write-up stars under /writeups. */
export function pathFor(id: string) {
  if (bodyById.has(id as BodyId)) return `/${id}`
  if (id.startsWith('post:')) return `/writeups/${id.slice(5)}`
  return `/projects/${id}`
}

/**
 * The sky selection a pathname points at: `null` for the home view, an id for a body or project,
 * or `undefined` when the path doesn't match anything in the sky.
 */
export function selectionFromPath(pathname: string): string | null | undefined {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/') return null
  const body = path.slice(1)
  if (bodyById.has(body as BodyId)) return body
  const project = /^\/projects\/([a-z0-9-]+)$/.exec(path)
  if (project && projectById.has(project[1])) return project[1]
  const writeup = /^\/writeups\/([a-z0-9-]+)$/.exec(path)
  if (writeup && postBySlug.has(writeup[1])) return `post:${writeup[1]}`
  return undefined
}
