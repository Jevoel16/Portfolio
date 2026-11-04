import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { loadPost } from './content/posts'
import './index.css'

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
  const post = /^\/blog\/([a-z0-9-]+)\/?$/.exec(location.pathname)
  if (post) await loadPost(post[1]).catch(() => undefined)
  // Prerendered pages already hold the markup, so hydrate them; the dev server serves an empty root.
  if (root.hasChildNodes()) hydrateRoot(root, app)
  else createRoot(root).render(app)
}

void start()
