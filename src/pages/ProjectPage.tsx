import { Link, useParams } from 'react-router'
import { DocLayout } from '../components/DocLayout'
import { constellationById } from '../data/constellations'
import { projectById, projects } from '../data/projects'
import { hrefForSection } from '../scroll/sections'
import { NotFound } from './NotFound'

/** Full page for one project star: its own URL, title and description for search engines. */
export function ProjectPage() {
  const { slug = '' } = useParams()
  const project = projectById.get(slug)
  if (!project) return <NotFound />

  const constellation = constellationById.get(project.constellation)!
  const siblings = projects.filter((p) => p.constellation === project.constellation && p.id !== project.id)

  return (
    <DocLayout>
      <article className="project-page" style={{ '--accent': constellation.color } as React.CSSProperties}>
        <header className="doc-hero">
          <p className="post-meta mono">
            <Link to={hrefForSection('projects')} viewTransition>
              ← star map
            </Link>{' '}
            · <span className="dot" aria-hidden="true" /> {constellation.name}
            {project.featured && <span className="featured-tag">Featured</span>}
          </p>
          <h1>{project.name}</h1>
          <p className="lede">{project.description}</p>
          <ul className="chips" aria-label="Tech stack">
            {project.stack.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <a className="btn" href={project.url} target="_blank" rel="noreferrer">
            View on GitHub <span aria-hidden="true">↗</span>
          </a>
        </header>

        <section className="project-constellation" aria-labelledby="constellation-title">
          <h2 id="constellation-title">{constellation.name}</h2>
          <p>{constellation.blurb}</p>
          {siblings.length > 0 && (
            <ul className="post-list">
              {siblings.map((p) => (
                <li key={p.id}>
                  <article>
                    <h3>
                      <Link to={`/projects/${p.id}`} viewTransition>
                        {p.featured ? '★' : '✦'} {p.name}
                      </Link>
                    </h3>
                    <p>{p.description}</p>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </section>
      </article>
    </DocLayout>
  )
}
