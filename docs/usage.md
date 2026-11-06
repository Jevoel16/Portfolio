# Using the site

[← back to the README](../README.md)

## Visitors on desktop

1. Scroll: the camera flies from the full sky to each section's planet or constellation while the text scrolls over it. Fling it hard and it stops at the next section, so every flight plays.
2. Use the header chips (**About**, **Projects**, **Toolkit**, **Contact**) or the altitude rail on the left to jump; long jumps play the hyperspace streak.
3. In **Projects**, open **details →** for a project's own page or **source ↗** for its repository.
4. In **Contact**, Spruce boots up and starts talking; press **Next** to hear the rest.
5. The URL follows the section you're in, so you can copy it and share that exact spot.

## The command terminal

Open it with `⌘K` / `Ctrl+K`, `/`, or the `>_` chip in the header:

```text
visitor@sprucetrap:~$ whoami
sprucetrap
aspiring cybersecurity professional · full-stack developer
visitor@sprucetrap:~$ ls projects
★ the-pulse            The Pulse
★ rankit               RankIT
…
visitor@sprucetrap:~$ open ran⇥        # Tab completes to `open rankit`, Enter opens its page
visitor@sprucetrap:~$ theme redteam
> red team mode engaged. be nice.
```

| Command | Does |
| --- | --- |
| `help` | List commands |
| `whoami` | Who runs the site |
| `ls [projects\|posts\|constellations]` | List what is in the sky |
| `open <slug>` | Open a project page, or scroll to `about`, `toolkit` or `contact`; Tab completes |
| `cat about` | Scroll to About |
| `blog [slug]` | Open the blog or a post |
| `contact` | Scroll to Contact |
| `sky` | Back to the top of the page |
| `theme default\|redteam` | Switch HUD colours |
| `sudo hire-me` | Escalate privileges (opens Contact) |
| `clear`, `exit` | Clear the screen, close the terminal |

↑ / ↓ walk through command history; Esc closes the terminal.

## Visitors on phones

1. Scroll as usual; the sky flies behind the page in portrait orientation. Phones get solid glass cards instead of blurred ones and a lighter canvas, so fast scrolling stays smooth.
2. Swipe the header chip row sideways to reach **Contact**, **Blog** and the terminal.
3. In **Contact**, Spruce sits above his speech bubble; tap the bubble or **Next** to continue.
4. Tap `>_` for the terminal; the quick-command chips cover the common commands without typing.

## Keyboard and screen-reader users

Tab moves through the header, the section rail and every card link in reading order. Sections are landmarks with `<h2>` headings, the 3D sky is hidden from assistive tech, and Spruce's lines are announced whole through a polite live region rather than letter by letter.

## Readers of the blog

1. Open **Blog** from the header or the Write-ups section, or go to `/blog`.
2. Pick a post; long posts show an *On this page* table of contents.
3. Security posts have **See it on the star map**, which goes back to the Write-ups section.

## Routes

| Path | Opens |
| --- | --- |
| `/` | The scroll page from the top |
| `/about`, `/toolkit`, `/contact` | The scroll page, scrolled to that section |
| `/#projects`, `/#writeups` | The scroll page, scrolled to that section |
| `/projects/<slug>` | A project's own page (`slug` = the project's `id` in `src/data/projects.ts`) |
| `/writeups/<slug>` | v1 write-up star links; shows the post and canonicalises to `/blog/<slug>` |
| `/blog` | List of posts, newest first |
| `/blog/<slug>` | A full post (`slug` = the Markdown file name) |
| anything else | 404 page |

| Query | Effect |
| --- | --- |
| `?mode=static` | Forces the SVG fallback map (useful for testing devices without WebGL) |

Every route is prerendered to its own HTML file (`/about` → `dist/about.html`), and Vercel's `cleanUrls` serves it without the extension. Unknown paths get `dist/404.html` with a real 404 status.
