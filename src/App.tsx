import { useCallback } from 'react'
import { Route, Routes, useLocation } from 'react-router'
// The Vite/React entry: the '/next' build needs Next.js. Renders nothing; pageviews follow history changes.
import { Analytics } from '@vercel/analytics/react'
import { BlogIndex } from './pages/blog/BlogIndex'
import { BlogPost } from './pages/blog/BlogPost'
import { NotFound } from './pages/NotFound'
import { ProjectPage } from './pages/ProjectPage'
import { ScrollPage } from './pages/ScrollPage'
import { sectionForLocation } from './scroll/sections'
import { RouteHead } from './seo/RouteHead'
import { CommandTerminal } from './hud/CommandTerminal'
import { useKonami, useTheme } from './hud/theme'

/** Paths that aren't a section of the scroll page fall through to the 404 page. */
function ScrollRoute() {
  const { pathname } = useLocation()
  return sectionForLocation(pathname) === undefined ? <NotFound /> : <ScrollPage />
}

export default function App() {
  const [theme, setTheme] = useTheme()
  useKonami(useCallback(() => setTheme(theme === 'redteam' ? 'default' : 'redteam'), [theme, setTheme]))
  return (
    <>
      <RouteHead />
      <CommandTerminal />
      <Analytics />
      <Routes>
        {/* One layout route for every section URL keeps the page and its canvas mounted between them. */}
        <Route element={<ScrollRoute />}>
          <Route index element={null} />
          <Route path="about" element={null} />
          <Route path="toolkit" element={null} />
          <Route path="contact" element={null} />
        </Route>
        <Route path="projects/:slug" element={<ProjectPage />} />
        {/* Write-up stars from v1; the page canonicalises to /blog/:slug. */}
        <Route path="writeups/:slug" element={<BlogPost />} />
        <Route path="blog" element={<BlogIndex />} />
        <Route path="blog/:slug" element={<BlogPost />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
