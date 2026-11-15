import { useEffect, useReducer } from 'react'
import { Link, useParams } from 'react-router'
import { DocLayout } from '../../components/DocLayout'
import { postLoadTransition, startPostLoad, type PostLoad } from '../../content/postLoad'
import { cachedPost, formatDate, loadPost, postBySlug, posts } from '../../content/posts'
import { NotFound } from '../NotFound'

function PostBody({ load }: { load: PostLoad }) {
  switch (load.status) {
    case 'loaded':
      // HTML is generated at build time from the site's own Markdown files (plugins/posts.ts), not user input.
      return <div className="prose" dangerouslySetInnerHTML={{ __html: load.post.html }} />
    case 'failed':
      return <p className="empty post-placeholder">This post failed to load. Check your connection and refresh.</p>
    case 'loading':
      return (
        <p className="empty mono post-placeholder" aria-live="polite">
          &gt; decrypting transmission…
        </p>
      )
  }
}

export function BlogPost() {
  const { slug = '' } = useParams()
  const meta = postBySlug.get(slug)
  const [load, send] = useReducer(postLoadTransition, cachedPost(slug), startPostLoad)
  const post = load.status === 'loaded' ? load.post : undefined

  useEffect(() => {
    if (!meta) return
    let live = true
    send({ type: 'START', cached: cachedPost(slug) })
    loadPost(slug)
      .then((p) => live && send({ type: 'RESOLVE', post: p }))
      .catch(() => live && send({ type: 'FAIL' }))
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
            <Link to="/blog">← blog</Link> · <time dateTime={meta.date}>{formatDate(meta.date)}</time> · {meta.readingMinutes} min read
          </p>
          <h1>{meta.title}</h1>
          <p className="lede">{meta.summary}</p>
          <ul className="chips" aria-label="Tags">
            {meta.tags.map((t) => (
              <li key={t}>#{t}</li>
            ))}
          </ul>
          {meta.constellation === 'security' && (
            <Link className="btn ghost" to="/#writeups" viewTransition>
              See it on the star map <span aria-hidden="true">↗</span>
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

        <PostBody load={load} />

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
