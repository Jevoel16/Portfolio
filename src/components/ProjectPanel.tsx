import type { Project } from '../data/projects'
import { projectById } from '../data/projects'
import { constellationById } from '../data/constellations'
import { Panel } from './Panel'

interface Props {
  project: Project
  onClose: () => void
  onSelect: (id: string) => void
}

export function ProjectPanel({ project, onClose, onSelect }: Props) {
  const constellation = constellationById.get(project.constellation)!
  const siblings = constellation.stars
    .map((s) => (s.projectId ? projectById.get(s.projectId) : undefined))
    .filter((p): p is Project => !!p && p.id !== project.id)

  return (
    <Panel accent={constellation.color} labelledBy="panel-title" closeLabel="Close project details" onClose={onClose}>
      <p className="panel-kicker">
        <span className="dot" aria-hidden="true" /> {constellation.name}
        {project.featured && <span className="featured-tag">Featured</span>}
      </p>
      <h2 id="panel-title">{project.name}</h2>
      <p className="panel-desc">{project.description}</p>
      <ul className="chips" aria-label="Tech stack">
        {project.stack.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <a className="btn" href={project.url} target="_blank" rel="noreferrer">
        View on GitHub <span aria-hidden="true">↗</span>
      </a>
      {siblings.length > 0 && (
        <div className="panel-siblings">
          <h3>Also in {constellation.name}</h3>
          <ul>
            {siblings.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => onSelect(p.id)}>
                  {p.featured ? '★' : '✦'} {p.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  )
}
