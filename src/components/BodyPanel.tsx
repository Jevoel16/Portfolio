import type { Body } from '../data/bodies'
import { constellations } from '../data/constellations'
import { projects, techStack } from '../data/projects'
import { Panel } from './Panel'

interface Props {
  body: Body
  onClose: () => void
  onSelect: (id: string) => void
}

const GITHUB = 'https://github.com/Jevoel16'

export function BodyPanel({ body, onClose, onSelect }: Props) {
  return (
    <Panel accent={body.color} labelledBy="panel-title" closeLabel={`Close ${body.name}`} onClose={onClose}>
      <p className="panel-kicker">
        <span className="dot" aria-hidden="true" /> {body.caption}
      </p>
      {body.id === 'about' && <About onSelect={onSelect} />}
      {body.id === 'toolkit' && <Toolkit />}
      {body.id === 'contact' && <Contact />}
    </Panel>
  )
}

function About({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <>
      <h2 id="panel-title">Sprucetrap</h2>
      <p className="panel-desc">
        I'm early in my cybersecurity career and building my skills step by step. Along the way I've built full-stack web
        apps, worked with several kinds of databases, put together machine learning pipelines, and written network servers
        from scratch.
      </p>
      <ul className="facts">
        <li><span className="mono">focus</span> Learning cybersecurity, starting with the fundamentals</li>
        <li><span className="mono">now</span> Building the core skills every cybersecurity professional needs</li>
        <li><span className="mono">learning</span> New tools, techniques and threats in the field</li>
        <li><span className="mono">open to</span> Working on ideas and projects that help me grow in cybersecurity</li>
      </ul>
      <div className="panel-siblings">
        <h3>{projects.length} stars across {constellations.length} constellations</h3>
        <ul>
          {constellations.map((c) => {
            const first = projects.find((p) => p.constellation === c.id && p.featured) ?? projects.find((p) => p.constellation === c.id)
            return (
              <li key={c.id} style={{ '--accent': c.color } as React.CSSProperties}>
                <button type="button" disabled={!first} onClick={() => first && onSelect(first.id)}>
                  <span className="dot" aria-hidden="true" /> {c.name}
                  {!first && <small> · in formation</small>}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}

function Toolkit() {
  return (
    <>
      <h2 id="panel-title">Toolkit</h2>
      <p className="panel-desc">The languages, frameworks and tools that orbit my projects.</p>
      {techStack.map((g) => (
        <div key={g.group} className="stack-group">
          <h3 className="mono">{g.group}</h3>
          <ul className="chips">
            {g.items.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      ))}
    </>
  )
}

function Contact() {
  return (
    <>
      <h2 id="panel-title">Get in touch</h2>
      <p className="panel-desc">
        Have an idea or want to work together? Open an issue in one of my public repositories and I'll get back to you.
      </p>
      <a className="btn" href={GITHUB} target="_blank" rel="noreferrer">
        github.com/Jevoel16 <span aria-hidden="true">↗</span>
      </a>
      <blockquote className="quote">
        “Things are not meant to last, but they will last to give meaning to things.”
        <cite>— Sprucetrap</cite>
      </blockquote>
      <p className="credit mono">© {new Date().getFullYear()} Sprucetrap · built with React, Vite & three.js</p>
    </>
  )
}
