# State machines

Every piece of UI that moves through steps has one status field and one place that changes it. Audited on 2026-11-15.

## 3D scene

Owner: `src/scene/sceneStatus.ts` (`sceneTransition`), used by `src/pages/ScrollPage.tsx` through `useReducer`.

| From      | Event   | To        |
| --------- | ------- | --------- |
| `waiting` | `START` | `loading` |
| `loading` | `READY` | `ready`   |
| `loading` | `FAIL`  | `failed`  |
| `ready`   | `FAIL`  | `failed`  |

Anything else keeps the current status. `START` comes from `whenPageSettled` (after the load event and an idle callback), so the prerendered page paints before three.js runs. `failed` is final: the static SVG map stays for the rest of the visit. The boot gate opens once the status reaches `ready` or `failed`.

## Blog post body

Owner: `src/content/postLoad.ts` (`postLoadTransition`), used by `src/pages/blog/BlogPost.tsx`.

States: `loading`, `loaded` (holds `post`), `failed`.

| From               | Event              | To                                 |
| ------------------ | ------------------ | ---------------------------------- |
| any                | `START` (new slug) | `loaded` if cached, else `loading` |
| `loading`/`loaded` | `RESOLVE` + post   | `loaded`                           |
| `loading`/`loaded` | `RESOLVE`, no post | `failed`                           |
| `loading`          | `FAIL`             | `failed`                           |

`RESOLVE` after `failed` and `FAIL` after `loaded` are ignored.

## Spruce's boot-up

Owner: `src/components/HoloAvatar.tsx`, `phase: 'idle' | 'standby' | 'online'`.

`idle` (prerendered, fully visible) → `standby` (after mount, waiting off-screen) → `online` (scrolled into view, starts talking). Without `IntersectionObserver` it goes straight from `idle` to `online`. Only the mount effect changes it, and it never goes back.

## Reveal on scroll

Owner: `src/scroll/useReveal.ts`, `RevealState: 'idle' | 'armed' | 'in'`.

`idle` (on screen at mount, never animates) or `armed` (below the fold) → `in` (intersected). One effect, one direction.

## Reviewed, not machines

- `useBootGate` (`ready` + `done`): a progress count and a one-way flag. `ready` with `done < total` is the 4s timeout, which is intended.
- `BootLine` (`mounted`, `text`): an SSR guard plus a typing animation.
- `CommandTerminal` (`open`), `useWarp` (`on`): single booleans with no dependent state.
