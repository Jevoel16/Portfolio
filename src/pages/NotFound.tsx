import { Link } from 'react-router-dom'
import { DocLayout } from '../components/DocLayout'

export function NotFound() {
  return (
    <DocLayout>
      <section className="not-found">
        <p className="mono kicker">// 404 · signal lost</p>
        <h1>This star isn't on the map</h1>
        <p>The page you followed may have moved, or it never existed.</p>
        <Link className="btn" to="/">
          Back to the sky
        </Link>
      </section>
    </DocLayout>
  )
}
