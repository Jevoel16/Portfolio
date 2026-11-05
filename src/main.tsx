import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App'
import { loadPost } from './content/posts'
import { applyMotionAttribute } from './hooks/useMotion'
import '@fontsource-variable/space-grotesk'
import '@fontsource-variable/jetbrains-mono'
import './index.css'

// Before the first paint of the app, so a visitor who paused motion never sees it start.
applyMotionAttribute()

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)

async function start() {
  // A prerendered post must have its HTML ready before hydrating, or React would swap it for a loader.
  const post = /^\/(?:blog|writeups)\/([a-z0-9-]+)\/?$/.exec(location.pathname)
  if (post) await loadPost(post[1]).catch(() => undefined)
  // Hydrate only markup prerendered for this exact URL. The dev server's empty root and the
  // shared 404.html (served for any unknown path) are rendered from scratch instead.
  const path = location.pathname.replace(/\/+$/, '') || '/'
  if (root.dataset.path === path) {
    hydrateRoot(root, app)
  } else {
    root.textContent = ''
    createRoot(root).render(app)
  }
}

void start()
