import { bodyById, type BodyId } from './data/bodies'
import { projectById } from './data/projects'

/** URL for a sky selection: bodies live at the top level, projects under /projects. */
export const pathFor = (id: string) => (bodyById.has(id as BodyId) ? `/${id}` : `/projects/${id}`)

/**
 * The sky selection a pathname points at: `null` for the home view, an id for a body or project,
 * or `undefined` when the path doesn't match anything in the sky.
 */
export function selectionFromPath(pathname: string): string | null | undefined {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/') return null
  const body = path.slice(1)
  if (bodyById.has(body as BodyId)) return body
  const match = /^\/projects\/([a-z0-9-]+)$/.exec(path)
  if (match && projectById.has(match[1])) return match[1]
  return undefined
}
