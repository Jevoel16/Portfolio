// Every project on the site; each also needs a star in constellations.ts.

export type ConstellationId = 'fullstack' | 'ml' | 'network' | 'databases' | 'security'

export interface Project {
  id: string
  name: string
  constellation: ConstellationId
  featured: boolean
  description: string
  stack: string[]
  url: string
  /** Live demo, shown next to the source link. */
  live?: string
  /** Screenshot in public/projects/<id>-{640,1280}.webp and <id>-og.jpg. */
  image?: { alt: string }
}

export const projects: Project[] = [
  {
    id: 'rankit',
    name: 'RankIT',
    constellation: 'fullstack',
    featured: true,
    description:
      'Scoring platform for school events, with role-based access (superadmin, admin, tabulator, grievance), live public rankings, audit logs and PDF reports.',
    stack: ['React', 'Vite', 'Express', 'MongoDB', 'JWT'],
    url: 'https://github.com/Jevoel16/RankIT',
    live: 'https://rankit.jevoelorbilla.dev',
    image: { alt: 'RankIT live rankings page with a podium for the top three colleges and the event list on the left.' },
  },
  {
    id: 'gpa-calculator',
    name: 'GPA Calculator',
    constellation: 'fullstack',
    featured: true,
    description: 'App that tracks term and cumulative GPA, with Google sign-in and saved sessions.',
    stack: ['Node.js', 'Express', 'MySQL', 'Google OAuth'],
    url: 'https://github.com/Jevoel16/gpa-calculator',
    live: 'https://gpa-calculator-ruddy-two.vercel.app',
    image: { alt: 'GPA Calculator term view with five courses, their units and grades, and the term GPA card.' },
  },
  {
    id: 'cryp-cross',
    name: 'Cryp-Cross',
    constellation: 'fullstack',
    featured: false,
    description:
      'Daily crossword where every clue is encrypted with Caesar, Atbash or Vigenère, with a built-in decoder, server-timed solves and a leaderboard.',
    stack: ['MongoDB', 'Express', 'React', 'Node.js'],
    url: 'https://github.com/Jevoel16/Cryp-Cross',
    live: 'https://cryp-cross.jevoelorbilla.dev',
    image: { alt: 'Cryp-Cross daily puzzle with an Atbash-encoded clue, the crossword grid and the decoder panel.' },
  },
]

export const projectById = new Map(projects.map((p) => [p.id, p]))

/** Public paths of a project's screenshot sizes. */
export const projectImage = (id: string) => ({
  small: `/projects/${id}-640.webp`,
  large: `/projects/${id}-1280.webp`,
  og: `/projects/${id}-og.jpg`,
})

export const techStack: { group: string; items: string[] }[] = [
  { group: 'Languages', items: ['JavaScript', 'TypeScript', 'Python', 'HTML5', 'CSS3', 'SQL'] },
  { group: 'Frontend', items: ['React', 'Next.js', 'Vite', 'Tailwind CSS', 'Leaflet', 'Plotly'] },
  { group: 'Backend', items: ['Node.js', 'Express', 'FastAPI', 'Streamlit'] },
  { group: 'Databases', items: ['MongoDB', 'MySQL', 'Neo4j', 'Redis', 'Cassandra'] },
  { group: 'Data & ML', items: ['pandas', 'NumPy', 'scikit-learn', 'TensorFlow'] },
  { group: 'Tools', items: ['Git', 'Docker', 'Vercel', 'VS Code'] },
]
