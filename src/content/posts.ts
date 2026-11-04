import type { Post, PostMeta } from './types'

// Built by plugins/posts.ts: `?meta` modules are tiny and eager; full posts load per page.
const metaModules = import.meta.glob<PostMeta>('/content/posts/*.md', { query: '?meta', import: 'default', eager: true })
const postModules = import.meta.glob<Post>('/content/posts/*.md', { import: 'default' })

/** Published posts, newest first. Drafts only show on the dev server. */
export const posts: PostMeta[] = Object.values(metaModules)
  .filter((p) => !p.draft || import.meta.env.DEV)
  .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title))

export const postBySlug = new Map(posts.map((p) => [p.slug, p]))

const loaded = new Map<string, Post>()

/** Already-loaded post, so prerendered pages hydrate without a loading flash. */
export const cachedPost = (slug: string) => loaded.get(slug)

export async function loadPost(slug: string): Promise<Post | undefined> {
  const hit = loaded.get(slug)
  if (hit) return hit
  const load = postBySlug.has(slug) ? postModules[`/content/posts/${slug}.md`] : undefined
  if (!load) return undefined
  const post = await load()
  loaded.set(slug, post)
  return post
}

export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
