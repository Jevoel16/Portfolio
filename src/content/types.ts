// Shapes produced by plugins/posts.ts from content/posts/*.md at build time.

export interface PostMeta {
  /** File name without .md; also the URL slug. */
  slug: string
  title: string
  /** Short name for the star label in the sky; defaults to a trimmed title. */
  short?: string
  /** ISO date, YYYY-MM-DD. */
  date: string
  updated?: string
  summary: string
  tags: string[]
  /** Constellation that shows this post as a star, e.g. 'security'. */
  constellation?: string
  readingMinutes: number
  draft: boolean
}

export interface TocEntry {
  id: string
  text: string
  depth: 2 | 3
}

export interface Post extends PostMeta {
  /** Rendered and syntax-highlighted at build time from the author's own Markdown. */
  html: string
  toc: TocEntry[]
}
