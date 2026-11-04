import { postBySlug, posts } from '../content/posts'
import { bodies, bodyById, type BodyId } from '../data/bodies'
import { constellationById } from '../data/constellations'
import { projectById, projects, techStack } from '../data/projects'
import { GITHUB } from '../data/profile'

// www is the primary domain in Vercel (the apex 308s to it), so every canonical URL must use it.
export const SITE_URL = 'https://www.jevoelorbilla.dev'
export const SITE_NAME = 'Sprucetrap'
const OG_IMAGE = `${SITE_URL}/og-default.png`
const TAGLINE = 'Aspiring Cybersecurity Professional · Full-Stack Developer'

export interface PageMeta {
  title: string
  description: string
  /** Path of the canonical URL, e.g. /blog/x. Write-up sky panels point at their blog post. */
  canonical: string
  type: 'website' | 'article' | 'profile'
  noindex?: boolean
  publishedTime?: string
  modifiedTime?: string
  jsonLd: Record<string, unknown>[]
}

const person = {
  '@type': 'Person',
  '@id': `${SITE_URL}/#person`,
  name: SITE_NAME,
  url: SITE_URL,
  jobTitle: TAGLINE,
  sameAs: [GITHUB],
  knowsAbout: ['Cybersecurity', 'Web security', 'Full-stack development', ...techStack.flatMap((g) => g.items).slice(0, 12)],
}

const breadcrumbs = (items: [string, string][]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE_URL}${path}` })),
})

const BODY_COPY: Record<BodyId, { title: string; description: string }> = {
  about: {
    title: `About · ${SITE_NAME}`,
    description: 'Sprucetrap is an early-career cybersecurity learner and full-stack developer building web apps, database projects, ML pipelines and network servers.',
  },
  toolkit: {
    title: `Toolkit · ${SITE_NAME}`,
    description: `Languages, frameworks and tools Sprucetrap works with: ${techStack.map((g) => g.items.slice(0, 3).join(', ')).join('; ')}.`,
  },
  contact: {
    title: `Contact · ${SITE_NAME}`,
    description: 'Get in touch with Sprucetrap about cybersecurity or full-stack projects through GitHub.',
  },
}

/** Everything a page needs in <head>; shared by the prerender script and client-side navigation. */
export function metaFor(pathname: string): PageMeta {
  const path = pathname.replace(/\/+$/, '') || '/'

  if (path === '/') {
    return {
      title: `${SITE_NAME} — Cybersecurity & Full-Stack Developer Portfolio`,
      description: `${TAGLINE}. Explore ${projects.length} projects as stars in an interactive night sky, plus write-ups on web security.`,
      canonical: '/',
      type: 'profile',
      jsonLd: [
        { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: SITE_URL, name: SITE_NAME, author: { '@id': person['@id'] } },
        { '@context': 'https://schema.org', '@type': 'ProfilePage', url: SITE_URL, mainEntity: person },
      ],
    }
  }

  const body = bodyById.get(path.slice(1) as BodyId)
  if (body) {
    const copy = BODY_COPY[body.id]
    return {
      ...copy,
      canonical: path,
      type: body.id === 'about' ? 'profile' : 'website',
      jsonLd: [
        body.id === 'about'
          ? { '@context': 'https://schema.org', '@type': 'AboutPage', url: `${SITE_URL}${path}`, mainEntity: person }
          : { '@context': 'https://schema.org', '@type': body.id === 'contact' ? 'ContactPage' : 'WebPage', url: `${SITE_URL}${path}`, name: copy.title },
        breadcrumbs([['Sky', '/'], [body.name, path]]),
      ],
    }
  }

  const project = /^\/projects\/([a-z0-9-]+)$/.exec(path)?.[1]
  const p = project ? projectById.get(project) : undefined
  if (p) {
    const constellation = constellationById.get(p.constellation)!
    return {
      title: `${p.name} — ${constellation.name} project · ${SITE_NAME}`,
      description: p.description,
      canonical: path,
      type: 'website',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: p.name,
          description: p.description,
          codeRepository: p.url,
          url: `${SITE_URL}${path}`,
          keywords: p.stack.join(', '),
          author: person,
        },
        breadcrumbs([['Sky', '/'], [p.name, path]]),
      ],
    }
  }

  if (path === '/blog') {
    return {
      title: `Blog — cybersecurity write-ups and dev notes · ${SITE_NAME}`,
      description: 'Write-ups, labs and notes on cybersecurity and full-stack development by Sprucetrap.',
      canonical: '/blog',
      type: 'website',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Blog',
          url: `${SITE_URL}/blog`,
          name: `${SITE_NAME} · Blog`,
          author: person,
          blogPost: posts.map((post) => ({ '@type': 'BlogPosting', headline: post.title, url: `${SITE_URL}/blog/${post.slug}`, datePublished: post.date })),
        },
      ],
    }
  }

  const postSlug = /^\/(blog|writeups)\/([a-z0-9-]+)$/.exec(path)
  const post = postSlug ? postBySlug.get(postSlug[2]) : undefined
  if (post && postSlug) {
    const isPanel = postSlug[1] === 'writeups'
    return {
      title: isPanel ? `${post.title} · write-up star · ${SITE_NAME}` : `${post.title} · ${SITE_NAME}`,
      description: post.summary,
      canonical: `/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.summary,
          datePublished: post.date,
          dateModified: post.updated ?? post.date,
          keywords: post.tags.join(', '),
          url: `${SITE_URL}/blog/${post.slug}`,
          mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
          image: OG_IMAGE,
          author: person,
        },
        breadcrumbs([['Blog', '/blog'], [post.title, `/blog/${post.slug}`]]),
      ],
    }
  }

  return {
    title: `Not found · ${SITE_NAME}`,
    description: 'This page is not on the map.',
    canonical: path,
    type: 'website',
    noindex: true,
    jsonLd: [],
  }
}

/** Every indexable URL, for the prerender script and sitemap. Write-up panels are left out: they canonicalise to /blog. */
export function indexablePaths(): string[] {
  return ['/', ...bodies.map((b) => `/${b.id}`), ...projects.map((p) => `/projects/${p.id}`), '/blog', ...posts.map((p) => `/blog/${p.slug}`)]
}

/** Paths that are prerendered but not listed in the sitemap. */
export function extraPaths(): string[] {
  return posts.filter((p) => p.constellation === 'security').map((p) => `/writeups/${p.slug}`)
}

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** <head> tags as an HTML string, for the prerendered pages. */
export function headHtml(meta: PageMeta): string {
  const url = `${SITE_URL}${meta.canonical === '/' ? '' : meta.canonical}`
  const tags = [
    `<title>${escape(meta.title)}</title>`,
    `<meta name="description" content="${escape(meta.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    meta.noindex ? '<meta name="robots" content="noindex" />' : '',
    `<meta property="og:type" content="${meta.type}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:title" content="${escape(meta.title)}" />`,
    `<meta property="og:description" content="${escape(meta.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    `<meta property="og:image:alt" content="${SITE_NAME} — constellations of projects in a night sky" />`,
    meta.publishedTime ? `<meta property="article:published_time" content="${meta.publishedTime}" />` : '',
    meta.modifiedTime ? `<meta property="article:modified_time" content="${meta.modifiedTime}" />` : '',
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${escape(meta.title)}" />`,
    `<meta name="twitter:description" content="${escape(meta.description)}" />`,
    `<meta name="twitter:image" content="${OG_IMAGE}" />`,
    // JSON-LD is data, not script; "<" is escaped so content can never close the tag.
    ...meta.jsonLd.map((data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`),
  ]
  return tags.filter(Boolean).join('\n    ')
}
