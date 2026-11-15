# Performance

[← back to the README](../README.md)

Lighthouse 12, mobile preset, run on 2026-11-15 against `npm start` (the production build on `vite preview`, without Vercel's compression or CDN).

| Page    | Performance | Accessibility | Best Practices | SEO | LCP   | CLS   | TBT    |
| ------- | ----------- | ------------- | -------------- | --- | ----- | ----- | ------ |
| `/`     | 65          | 100           | 96             | 100 | 3.8 s | 0.006 | 960 ms |
| `/blog` | 99          | 100           | 96             | 100 | 2.1 s | 0     | 20 ms  |

Best Practices loses points locally only: `/_vercel/insights/script.js` (Vercel Web Analytics) returns 404 outside Vercel.

## Bundle

| Chunk       | Gzipped | Loads         |
| ----------- | ------- | ------------- |
| `index`     | 21.5 KB | on first load |
| `react`     | 61.8 KB | on first load |
| `ScrollSky` | 7.0 KB  | after paint   |
| `r3f`       | 47.2 KB | after paint   |
| `three`     | 177 KB  | after paint   |

Initial JS is about 83 KB gzipped, under the 170 KB budget. Fonts are two self-hosted variable families (Space Grotesk, JetBrains Mono).

## Open

The home page misses the budget (Performance 90, LCP 2.5 s). The time goes to starting the WebGL sky on Lighthouse's throttled phone CPU: shader compiles and texture uploads run before the sky is shown. Things to measure next: starting the 3D chunk only after the first interaction or on idle, and a lighter scene on low-end devices (`lite` in `useSceneSupport`).
