// Built with `vite build --ssr` and run by scripts/prerender.mjs, never shipped to the browser.
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import App from './App'
import { loadPost, posts } from './content/posts'
import { extraPaths, headHtml, indexablePaths, metaFor } from './seo/meta'

export { extraPaths, indexablePaths, metaFor, posts }

export async function render(url: string) {
  const post = /^\/blog\/([a-z0-9-]+)$/.exec(url)
  // Load the post body first so the prerendered page contains the full article, not a loader.
  if (post) await loadPost(post[1])
  const html = renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  )
  return { html, head: headHtml(metaFor(url)) }
}
