# Architecture notes

[← back to the README](../README.md)

The why behind the less obvious parts of the code. Comments in the source are one line each and point here when there is more to say.

## Sky coordinates

- x points right, y up and z toward the viewer, roughly x ∈ [-9, 9] and y ∈ [-6, 6] (`src/data/constellations.ts`).
- The 3D scene uses these directly; the static SVG map (`src/static/StaticSky.tsx`) flips y.
- Body ids in `src/data/bodies.ts` share the selection namespace with project ids, so they must not clash.
- In portrait the figures are rotated, so a constellation's name sits centred above its stars instead of at its hand-placed landscape spot.
- The Cybersecurity figure grows from blog posts: each post with `constellation: security` claims one of the five base stars, oldest first, and later posts orbit them.

## Scroll, URL and camera

- `/`, `/about`, `/toolkit` and `/contact` all render `src/pages/ScrollPage.tsx`, each prerendered with every section, and open scrolled to their section. About, Toolkit and Contact keep their own indexable paths; Projects and Write-ups use a hash on `/`.
- `src/scroll/useSectionSync.ts` keeps the URL and scroll position in step both ways:
  - navigating to `/about`, `/#projects` and so on scrolls to that section (instantly on first load);
  - scrolling replaces the URL with the section in view, so the title, canonical URL and Back button stay right.
- Progress is paced by section: section `k` of `n` sits at exactly `k / (n - 1)`, so the rail's evenly spaced ticks light up as the fill reaches them. It is written as `--scroll` only on elements marked `data-scroll-var`; setting it on `<html>` restyled the whole page every frame and made fast scrolling stutter on phones.
- The camera (`src/scroll/cameraPath.ts`, `src/scene/ScrollSky.tsx`) eases between `data-cam` waypoints: `home` (the whole sky), `body:<id>` (a planet or the beacon) and `const:<id>` (a constellation). Long hops pull the camera back mid-flight so they read as flights rather than pans.
- The fast-scroll brake (`src/scroll/useScrollBrake.ts`) catches flings faster than about four viewports a second, locks input and glides to the next section in that direction so its camera flight still plays. Slow scrolling is never touched.

## Loading and hydration

- The boot gate (`src/hooks/useBootGate.ts`) holds scrolling until the fonts, the Spruce avatar and the 3D sky are ready, capped at 4 seconds. The lock is set on the DOM after hydration, never in the prerendered markup, so crawlers and no-JS visitors are never locked. Deep links and nav clicks still scroll during it.
- The sky starts only after the load event and an idle moment (`whenPageSettled`), so the prerendered hero is the first paint and the Largest Contentful Paint.
- Support is an API check (`WebGLRenderingContext`), not a test context: the first WebGL context starts the GPU process and used to block hydration. If the sky's own context fails, `SceneBoundary` falls back to the static map.
- The canvas starts with `frameloop="never"` while `compileAsync` compiles every shader in the background, then switches to `demand`. Rendering earlier made the first frame compile them all in one long task. Every texture is uploaded first too, so the first camera flight never stalls.
- The sky's state updates run in `startTransition`, so re-rendering the page when it starts yields to input.
- `src/main.tsx` hydrates only markup prerendered for the exact URL; the dev server's empty root and the shared `404.html` render from scratch.
- `useMediaQuery` returns `serverValue` during prerender and hydration, then re-renders with the real value, so hydration never mismatches.
- The static SVG sky is the prerendered first paint, the loading placeholder and the no-WebGL fallback. Both orientations are rendered and CSS picks one with the same media query as the 3D scene. It is decorative: everything it shows has a real link in the page.

## Motion

- The site's motion setting (`src/hooks/useMotion.ts`) is full by default on every device, including desktops with the OS reduce-motion setting on; the header chip pauses it. It is a deliberate exception to the usual `prefers-reduced-motion` rule.
- Paused motion stops ambient and looping effects, the warp flash and typing. Scroll-linked motion (camera flight, parallax, reveals, page transitions) keeps running because it only moves when the reader scrolls or clicks.
- Reveals start `idle` when already on screen at mount (no flash or shift), `armed` below the fold, and `in` once revealed.

## Themes

- System, Light and Dark live in `src/lib/theme.ts`. Light and Dark set `data-theme` on `<html>` and save it; System removes both, so the page follows `prefers-color-scheme`.
- An inline script in `index.html` applies the saved theme before first paint. The CSP allows it by its `sha256` hash, and `scripts/csp.test.ts` fails if the script changes without the hash. `.gitattributes` keeps LF endings so a Windows checkout hashes the same bytes.
- Every colour token in `src/styles/tokens.css` is `light-dark(light, dark)`, and `:root` sets `color-scheme` from `data-theme`. The terminal, code blocks and Spruce's speech bubble set `color-scheme: dark` on themselves, so their tokens resolve dark in both themes.
- Data colours (constellations, planets) are night-sky pastels. `themedAccent()` in `src/lib/ink.ts` wraps each in `light-dark()` with a darkened version that passes AA on cream and on the pale top of the sky.
- The 3D scene can't read CSS, so `useResolvedScheme()` tells it the scheme. In Light it builds the layout in ink, switches additive materials to normal blending (added light is invisible on a pale sky), softens star halos and hides the nebula clouds.
- Red team mode is a separate `data-hud` attribute with its own storage key, so it stacks on either theme.

## Rendering performance

- All constellation stars are one GPU point buffer; hover and selection only touch a one-float attribute, and clicks pick the star nearest the ray.
- Data packets on constellation edges are one draw call, with positions computed on the GPU from time.
- Point sizes use drawing-buffer pixels per sky unit at distance 1 (`src/scene/pointScale.ts`), so points keep a sprite's world size at any DPR and zoom.
- The canvas is sized to the large viewport, so a phone toolbar hiding mid-scroll never resizes it (a resize reallocates buffers and stalls a frame).
- On phones the cards use near-opaque glass instead of backdrop blur, which would re-blur the sky every frame.
- The telemetry readout writes straight to the DOM, so pointer moves never re-render React.

## Blog build

`plugins/posts.ts` turns `content/posts/*.md` into JS modules at build time: `post.md?meta` gives a cheap `PostMeta`, bundled eagerly for lists and sky stars, and `post.md` gives the full post with prerendered HTML, lazy-loaded per page.

## Hosting

Vercel's domain settings make www the primary host and 308 the apex to it. A `vercel.json` redirect back to the apex once caused an infinite redirect loop on every page but `/`; `src/seo/domain.test.ts` guards against it.
