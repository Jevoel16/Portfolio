import { Link } from 'react-router'
import { DocLayout } from '../../components/DocLayout'
import { formatDate, posts } from '../../content/posts'

export function BlogIndex() {
  return (
    <DocLayout>
      <header className="doc-hero">
        <p className="mono kicker">// transmissions · {posts.length} logged</p>
        <h1>Blog</h1>
        <p className="lede">
          Write-ups, labs and notes on cybersecurity and full-stack development. Security posts also appear as stars in
          the Cybersecurity constellation.
        </p>
      </header>
      {posts.length === 0 ? (
        <p className="empty">No transmissions yet. Check back soon.</p>
      ) : (
        <ol className="post-list">
          {posts.map((p) => (
            <li key={p.slug}>
              <article>
                <p className="post-meta mono">
                  <time dateTime={p.date}>{formatDate(p.date)}</time> · {p.readingMinutes} min read
                  {p.draft && <span className="draft-tag">draft</span>}
                </p>
                <h2>
                  <Link to={`/blog/${p.slug}`}>{p.title}</Link>
                </h2>
                <p>{p.summary}</p>
                <ul className="chips" aria-label="Tags">
                  {p.tags.map((t) => (
                    <li key={t}>#{t}</li>
                  ))}
                </ul>
              </article>
            </li>
          ))}
        </ol>
      )}
    </DocLayout>
  )
}
