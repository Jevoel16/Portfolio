import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { DocLayout } from '../../components/DocLayout'
import { cachedPost, formatDate, loadPost, postBySlug, posts } from '../../content/posts'
import type { Post } from '../../content/types'
import { NotFound } from '../NotFound'

export function BlogPost() {
  const { slug = '' } = useParams()
  const meta = postBySlug.get(slug)
  const [post, setPost] = useState<Post | undefined>(() => cachedPost(slug))
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!meta) return
    let live = true
    setFailed(false)
    setPost(cachedPost(slug))
    loadPost(slug)
      .then((p) => live && setPost(p))
      .catch(() => live && setFailed(true))
    return () => {
      live = false
    }
  }, [slug, meta])

  if (!meta) return <NotFound />

  const index = posts.findIndex((p) => p.slug === slug)
  const newer = posts[index - 1]
  const older = posts[index + 1]

  return (
    <DocLayout>
      <article className="post">
        <header className="doc-hero">
          <p className="post-meta mono">
            <Link to="/blog">← blog</Link> · <time dateTime={meta.date}>{formatDate(meta.date)}</time> ·{' '}
            {meta.readingMinutes} min read
          </p>
          <h1>{meta.title}</h1>
          <p className="lede">{meta.summary}</p>
          <ul className="chips" aria-label="Tags">
            {meta.tags.map((t) => (
              <li key={t}>#{t}</li>
            ))}
          </ul>
          {meta.constellation === 'security' && (
            <Link className="btn ghost" to={`/writeups/${meta.slug}`}>
              View in the sky <span aria-hidden="true">↗</span>
            </Link>
          )}
        </header>

        {post && post.toc.length > 2 && (
          <nav className="toc" aria-label="On this page">
            <p className="mono">// on this page</p>
            <ol>
              {post.toc.map((t) => (
                <li key={t.id} className={`depth-${t.depth}`}>
                  <a href={`#${t.id}`}>{t.text}</a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {post ? (
          // HTML is generated at build time from the site's own Markdown files (plugins/posts.ts), not user input.
          <div className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />
        ) : failed ? (
          <p className="empty">This post failed to load. Check your connection and refresh.</p>
        ) : (
          <p className="empty mono" aria-live="polite">
            &gt; decrypting transmission…
          </p>
        )}

        <nav className="post-pager" aria-label="More posts">
          {older ? (
            <Link to={`/blog/${older.slug}`} rel="prev">
              <small className="mono">← older</small>
              {older.title}
            </Link>
          ) : (
            <span />
          )}
          {newer && (
            <Link to={`/blog/${newer.slug}`} rel="next" className="next">
              <small className="mono">newer →</small>
              {newer.title}
            </Link>
          )}
        </nav>
      </article>
    </DocLayout>
  )
}
