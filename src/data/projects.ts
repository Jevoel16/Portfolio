// Single source of truth for every project shown on the site.
// Adding a project: add it here, then give it a star in constellations.ts.

export type ConstellationId = 'fullstack' | 'ml' | 'network' | 'databases' | 'security'

export interface Project {
  id: string
  name: string
  constellation: ConstellationId
  featured: boolean
  description: string
  stack: string[]
  url: string
}

export const projects: Project[] = [
  {
    id: 'the-pulse',
    name: 'The Pulse',
    constellation: 'fullstack',
    featured: true,
    description:
      'Emergency platform for Iligan City with a live infrastructure map, shortest-path routing for first responders, QR-based worker login, admin approvals and database backups.',
    stack: ['React', 'Vite', 'Node.js', 'Neo4j', 'Leaflet', 'Docker'],
    url: 'https://github.com/Jevoel16/The-Pulse',
  },
  {
    id: 'rankit',
    name: 'RankIT',
    constellation: 'fullstack',
    featured: true,
    description:
      'Scoring platform for school events, with role-based access (superadmin, admin, tabulator, grievance), live public rankings, audit logs and PDF reports.',
    stack: ['React', 'Vite', 'Express', 'MongoDB', 'JWT'],
    url: 'https://github.com/Jevoel16/RankIT',
  },
  {
    id: 'gpa-calculator',
    name: 'GPA Calculator',
    constellation: 'fullstack',
    featured: true,
    description: 'App that tracks term and cumulative GPA, with Google sign-in and saved sessions.',
    stack: ['Node.js', 'Express', 'MySQL', 'Google OAuth'],
    url: 'https://github.com/Jevoel16/gpa-calculator',
  },
  {
    id: 'cryp-cross',
    name: 'Cryp-Cross',
    constellation: 'fullstack',
    featured: false,
    description: 'MERN app for managing project logs (create, view, update, delete).',
    stack: ['MongoDB', 'Express', 'React', 'Node.js'],
    url: 'https://github.com/Jevoel16/Orbilla---Lab-Activity-Final',
  },
  {
    id: 'tourist-arrivals',
    name: 'Tourist Arrivals Forecasting Lab',
    constellation: 'ml',
    featured: true,
    description:
      '8-stage machine learning pipeline that forecasts Philippine tourist arrivals, with a step-by-step interface and SHAP explanations.',
    stack: ['FastAPI', 'Next.js', 'TensorFlow', 'scikit-learn'],
    url: 'https://github.com/Jevoel16/tourist-arrivals-app',
  },
  {
    id: 'soil-weather',
    name: 'Soil & Weather API App',
    constellation: 'ml',
    featured: true,
    description: 'Combines Open-Meteo weather data and SoilGrids soil data in interactive charts.',
    stack: ['FastAPI', 'Next.js', 'Streamlit', 'Plotly'],
    url: 'https://github.com/Jevoel16/api-app',
  },
  {
    id: 'jmeet',
    name: 'Jmeet',
    constellation: 'network',
    featured: true,
    description: 'Multi-user video call and chat app on a custom WebSocket server.',
    stack: ['Bonezegei', 'WebSocket', 'WebRTC'],
    url: 'https://github.com/Jevoel16/ITE183_Lab2_Websocket',
  },
  {
    id: 'bsl-http-server',
    name: 'my-bsl-http-server',
    constellation: 'network',
    featured: false,
    description: 'HTTP server written from scratch in Bonezegei, with custom routing and 404 handling.',
    stack: ['Bonezegei', 'HTTP'],
    url: 'https://github.com/Jevoel16/my-bsl-http-server',
  },
  {
    id: 'itd110-neo4j',
    name: 'itd110_neo4j',
    constellation: 'databases',
    featured: false,
    description: 'Academic records manager (colleges, departments, faculty, courses, students) on a Neo4j graph.',
    stack: ['Neo4j', 'Cypher'],
    url: 'https://github.com/Jevoel16/itd110_neo4j',
  },
  {
    id: 'itd110-redis',
    name: 'itd110_redis',
    constellation: 'databases',
    featured: false,
    description: 'Student records app with Redis and a React frontend.',
    stack: ['Redis', 'React'],
    url: 'https://github.com/Jevoel16/itd110_redis',
  },
  {
    id: 'itd110-cassandra',
    name: 'itd110_cassandra',
    constellation: 'databases',
    featured: false,
    description: 'Water and sanitation data app (UN Goal 6) on Apache Cassandra.',
    stack: ['Cassandra'],
    url: 'https://github.com/Jevoel16/itd110_cassandra',
  },
  {
    id: 'itd110',
    name: 'itd110',
    constellation: 'databases',
    featured: false,
    description: 'Student records app with MongoDB.',
    stack: ['MongoDB'],
    url: 'https://github.com/Jevoel16/itd110',
  },
  {
    id: 'school-enrollment',
    name: 'school-enrollment-system',
    constellation: 'databases',
    featured: false,
    description: 'School enrollment system on MySQL.',
    stack: ['MySQL'],
    url: 'https://github.com/Jevoel16/school-enrollment-system',
  },
]

export const projectById = new Map(projects.map((p) => [p.id, p]))

export const techStack: { group: string; items: string[] }[] = [
  { group: 'Languages', items: ['JavaScript', 'TypeScript', 'Python', 'HTML5', 'CSS3', 'SQL'] },
  { group: 'Frontend', items: ['React', 'Next.js', 'Vite', 'Tailwind CSS', 'Leaflet', 'Plotly'] },
  { group: 'Backend', items: ['Node.js', 'Express', 'FastAPI', 'Streamlit'] },
  { group: 'Databases', items: ['MongoDB', 'MySQL', 'Neo4j', 'Redis', 'Cassandra'] },
  { group: 'Data & ML', items: ['pandas', 'NumPy', 'scikit-learn', 'TensorFlow'] },
  { group: 'Tools', items: ['Git', 'Docker', 'Vercel', 'VS Code'] },
]
