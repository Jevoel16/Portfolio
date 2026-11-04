import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <main className="not-found">
      <p className="mono">// 404 · signal lost</p>
      <h1>This star isn't on the map</h1>
      <p>The page you followed may have moved, or it never existed.</p>
      <Link className="btn" to="/">
        Back to the sky
      </Link>
    </main>
  )
}
