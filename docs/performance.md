# Performance

[← back to the README](../README.md)

Lighthouse 12, mobile preset, run on 2026-11-15 against `npm start` (the production build on `vite preview`, without Vercel's compression or CDN).

| Page    | Performance | Accessibility | Best Practices | SEO | LCP   | CLS   | TBT    |
| ------- | ----------- | ------------- | -------------- | --- | ----- | ----- | ------ |
| `/`     | 97          | 100           | 96             | 100 | 2.3 s | 0.003 | 120 ms |
| `/blog` | 99          | 100           | 96             | 100 | 2.1 s | 0     | 0 ms   |

Over seven runs the home page scored 96 to 98 (median 98, LCP 2.2 s, TBT 65 ms). Best Practices loses points locally only: `/_vercel/insights/script.js` (Vercel Web Analytics) returns 404 outside Vercel.

## Home page: 72 → 98

Median of three to seven runs per step.

| Step                                                        | Performance | LCP   | TBT    |
| ----------------------------------------------------------- | ----------- | ----- | ------ |
| Before                                                      | 72          | 3.7 s | 584 ms |
| Start the sky after load and an idle callback               | 81          | 2.3 s | 666 ms |
| Compile shaders before the first frame (`never` → `demand`) | 84          | 2.3 s | 203 ms |
| Check for WebGL without creating a test context             | 97          | 2.3 s | 115 ms |
| Run the sky's state updates in `startTransition`            | 98          | 2.2 s | 65 ms  |

- **LCP:** the hero text waited 3.2 s to paint because three.js loaded and ran before the first frame. Starting the sky after the load event lets the prerendered hero paint first.
- **First frame:** `compileAsync` was meant to compile shaders in the background, but r3f drew a frame as soon as the canvas mounted, which compiled them all in one 98 ms task (about 400 ms on Lighthouse's throttled CPU). The canvas now waits on `frameloop="never"` until the compile finishes.
- **Hydration spikes:** `useSceneSupport` created a WebGL context just to test support. The first context starts the GPU process (about 67 ms here) inside hydration, which made some runs score around 80. It's now an API check; the sky's own context still falls back to the static map if it fails.
- **Transitions:** `START` and `READY` re-render the whole scroll page; as transitions, React splits that render into small tasks.

## Bundle

| Chunk       | Gzipped | Loads         |
| ----------- | ------- | ------------- |
| `index`     | 21.5 KB | on first load |
| `react`     | 61.8 KB | on first load |
| `ScrollSky` | 7.0 KB  | after load    |
| `r3f`       | 47.2 KB | after load    |
| `three`     | 177 KB  | after load    |

Initial JS is about 83 KB gzipped, under the 170 KB budget. Fonts are two self-hosted variable families (Space Grotesk, JetBrains Mono).

## How to measure

```bash
npm run build && npm start
npx lighthouse@12 http://localhost:4173/ --only-categories=performance --chrome-flags="--headless=new"
```

Run it at least five times and compare medians: single runs vary by several points.
