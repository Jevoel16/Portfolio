import { Link } from 'react-router-dom'
import { formatDate } from '../content/posts'
import type { PostMeta } from '../content/types'
import { constellationById, starItem } from '../data/constellations'
import { Panel } from './Panel'

interface Props {
  post: PostMeta
  onClose: () => void
  onSelect: (id: string) => void
}

/** Sky panel for a write-up star: a teaser that links through to the full post. */
export function PostPanel({ post, onClose, onSelect }: Props) {
  const constellation = constellationById.get('security')!
  const siblings = constellation.stars
    .map(starItem)
    .filter((s): s is NonNullable<typeof s> => !!s && s.id !== `post:${post.slug}`)

  return (
    <Panel accent={constellation.color} labelledBy="panel-title" closeLabel="Close write-up" onClose={onClose}>
      <p className="panel-kicker">
        <span className="dot" aria-hidden="true" /> {constellation.name} · write-up
      </p>
      <h1 id="panel-title">{post.title}</h1>
      <p className="post-meta mono">
        <time dateTime={post.date}>{formatDate(post.date)}</time> · {post.readingMinutes} min read
      </p>
      <p className="panel-desc">{post.summary}</p>
      {post.tags.length > 0 && (
        <ul className="chips" aria-label="Tags">
          {post.tags.map((t) => (
            <li key={t}>#{t}</li>
          ))}
        </ul>
      )}
      <Link className="btn" to={`/blog/${post.slug}`}>
        Read the write-up <span aria-hidden="true">→</span>
      </Link>
      {siblings.length > 0 && (
        <div className="panel-siblings">
          <h2>Also in {constellation.name}</h2>
          <ul>
            {siblings.map((s) => (
              <li key={s.id}>
                <button type="button" onClick={() => onSelect(s.id)}>
                  ✦ {s.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  )
}
