import { Link, useParams } from 'react-router'
import { DocLayout } from '../components/DocLayout'
import { constellationById } from '../data/constellations'
import { projectById, projectImage, projects } from '../data/projects'
import { hrefForSection } from '../scroll/sections'
import { NotFound } from './NotFound'
import { themedAccent } from '../lib/ink'

// React 18 doesn't know fetchPriority yet and warns, so pass the lowercase HTML attribute.
const HIGH_PRIORITY = { fetchpriority: 'high' } as Record<string, string>

/** Full page for one project star: its own URL, title and description for search engines. */
export function ProjectPage() {
  const { slug = '' } = useParams()
  const project = projectById.get(slug)
  if (!project) return <NotFound />

  const constellation = constellationById.get(project.constellation)!
  const siblings = projects.filter((p) => p.constellation === project.constellation && p.id !== project.id)

  return (
    <DocLayout>
      <article className="project-page" style={{ '--accent': themedAccent(constellation.color) } as React.CSSProperties}>
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
          <p className="project-actions">
            {project.live && (
              <a className="btn" href={project.live} target="_blank" rel="noreferrer">
                Live demo <span aria-hidden="true">↗</span>
              </a>
            )}
            <a className={project.live ? 'btn ghost' : 'btn'} href={project.url} target="_blank" rel="noreferrer">
              View on GitHub <span aria-hidden="true">↗</span>
            </a>
          </p>
        </header>

        {project.image && (
          <figure className="project-shot">
            <img
              src={projectImage(project.id).large}
              srcSet={`${projectImage(project.id).small} 640w, ${projectImage(project.id).large} 1280w`}
              sizes="(max-width: 760px) 100vw, 712px"
              width={1280}
              height={800}
              alt={project.image.alt}
              {...HIGH_PRIORITY}
            />
          </figure>
        )}

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
