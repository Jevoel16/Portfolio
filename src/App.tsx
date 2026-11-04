import { Route, Routes, useLocation } from 'react-router-dom'
import { BlogIndex } from './pages/blog/BlogIndex'
import { BlogPost } from './pages/blog/BlogPost'
import { NotFound } from './pages/NotFound'
import { SkyPage } from './pages/SkyPage'
import { selectionFromPath } from './routes'
import { RouteHead } from './seo/RouteHead'

/** Unknown project slugs fall through to the 404 page instead of an empty sky. */
function SkyRoute() {
  const { pathname } = useLocation()
  return selectionFromPath(pathname) === undefined ? <NotFound /> : <SkyPage />
}

export default function App() {
  return (
    <>
      <RouteHead />
      <Routes>
        {/* One layout route for every sky URL keeps the canvas mounted while panels change. */}
        <Route element={<SkyRoute />}>
          <Route index element={null} />
          <Route path="about" element={null} />
          <Route path="toolkit" element={null} />
          <Route path="contact" element={null} />
          <Route path="projects/:slug" element={null} />
          <Route path="writeups/:slug" element={null} />
        </Route>
        <Route path="blog" element={<BlogIndex />} />
        <Route path="blog/:slug" element={<BlogPost />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
