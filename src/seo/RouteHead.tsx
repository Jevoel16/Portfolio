import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { SITE_URL, metaFor } from './meta'

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

/**
 * Keeps <head> in step with client-side navigation. Prerendered pages already ship the right
 * tags; this matters for tabs, history entries and link previews after in-app navigation.
 */
export function RouteHead() {
  const { pathname } = useLocation()
  useEffect(() => {
    const meta = metaFor(pathname)
    const url = `${SITE_URL}${meta.canonical === '/' ? '' : meta.canonical}`
    document.title = meta.title
    setMeta('name', 'description', meta.description)
    setMeta('property', 'og:title', meta.title)
    setMeta('property', 'og:description', meta.description)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:type', meta.type)
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = url
  }, [pathname])
  return null
}
