import { Route, Routes, useLocation } from 'react-router-dom'
import { NotFound } from './pages/NotFound'
import { SkyPage } from './pages/SkyPage'
import { selectionFromPath } from './routes'

/** Unknown project slugs fall through to the 404 page instead of an empty sky. */
function SkyRoute() {
  const { pathname } = useLocation()
  return selectionFromPath(pathname) === undefined ? <NotFound /> : <SkyPage />
}

export default function App() {
  return (
    <Routes>
      {/* One layout route for every sky URL keeps the canvas mounted while panels change. */}
      <Route element={<SkyRoute />}>
        <Route index element={null} />
        <Route path="about" element={null} />
        <Route path="toolkit" element={null} />
        <Route path="contact" element={null} />
        <Route path="projects/:slug" element={null} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
