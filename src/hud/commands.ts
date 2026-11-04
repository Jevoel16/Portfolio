// The ⌘K terminal's command set. Pure functions, so they're easy to test and reuse.
import { posts } from '../content/posts'
import { bodies } from '../data/bodies'
import { constellations } from '../data/constellations'
import { projects } from '../data/projects'
import { pathFor } from '../routes'

export type Theme = 'default' | 'redteam'

export interface CommandResult {
  /** Lines to print. A line starting with "!" is printed as an error. */
  lines: string[]
  navigate?: string
  theme?: Theme
  clear?: boolean
  close?: boolean
}

interface Command {
  usage: string
  help: string
  run: (args: string[]) => CommandResult
}

const targets = () => [...bodies.map((b) => b.id), ...projects.map((p) => p.id)]

const COMMANDS: Record<string, Command> = {
  help: { usage: 'help', help: 'list commands', run: () => ({ lines: helpLines() }) },
  whoami: {
    usage: 'whoami',
    help: 'who runs this observatory',
    run: () => ({
      lines: [
        'sprucetrap',
        'aspiring cybersecurity professional · full-stack developer',
        `${projects.length} projects · ${posts.length} write-up${posts.length === 1 ? '' : 's'} · github.com/Jevoel16`,
      ],
    }),
  },
  ls: {
    usage: 'ls [projects|posts|constellations]',
    help: 'list what is in the sky',
    run: ([what = '']) => {
      if (what.startsWith('proj')) return { lines: projects.map((p) => `${p.featured ? '★' : '·'} ${p.id.padEnd(20)} ${p.name}`) }
      if (what.startsWith('post') || what === 'blog') return { lines: posts.length ? posts.map((p) => `${p.date}  ${p.slug}`) : ['(no posts yet)'] }
      if (what.startsWith('const')) return { lines: constellations.map((c) => `${c.name.padEnd(16)} ${c.stars.filter((s) => s.projectId || s.postSlug).length} stars`) }
      if (what) return { lines: [`!ls: ${what}: no such directory`] }
      return { lines: ['about/  toolkit/  contact/  projects/  posts/  constellations/'] }
    },
  },
  open: {
    usage: 'open <slug>',
    help: 'fly to a project or planet (tab completes)',
    run: ([slug]) => {
      if (!slug) return { lines: ['!usage: open <slug> — try `ls projects`'] }
      if (!targets().includes(slug)) return { lines: [`!open: ${slug}: not found in this sky`] }
      return { lines: [`> plotting course to ${slug}…`], navigate: pathFor(slug), close: true }
    },
  },
  cat: {
    usage: 'cat about',
    help: 'read the about file',
    run: ([file]) =>
      file === 'about' || file === 'about.txt'
        ? { lines: ['> opening about…'], navigate: '/about', close: true }
        : { lines: [`!cat: ${file ?? ''}: no such file`] },
  },
  blog: {
    usage: 'blog [slug]',
    help: 'read write-ups and notes',
    run: ([slug]) => {
      if (!slug) return { lines: ['> tuning to transmissions…'], navigate: '/blog', close: true }
      if (!posts.some((p) => p.slug === slug)) return { lines: [`!blog: ${slug}: no such post`] }
      return { lines: [`> decrypting ${slug}…`], navigate: `/blog/${slug}`, close: true }
    },
  },
  contact: { usage: 'contact', help: 'open a channel', run: () => ({ lines: ['> opening channel…'], navigate: '/contact', close: true }) },
  sky: { usage: 'sky', help: 'back to the full sky', run: () => ({ lines: ['> recentering…'], navigate: '/', close: true }) },
  theme: {
    usage: 'theme [default|redteam]',
    help: 'switch HUD colours',
    run: ([name]) =>
      name === 'redteam' || name === 'default'
        ? { lines: [name === 'redteam' ? '> red team mode engaged. be nice.' : '> blue skies restored.'], theme: name }
        : { lines: ['!usage: theme default | theme redteam'] },
  },
  sudo: {
    usage: 'sudo hire-me',
    help: 'escalate privileges',
    run: (args) =>
      args.join(' ') === 'hire-me'
        ? { lines: ['[sudo] password for visitor: ********', 'access granted. opening secure channel…'], navigate: '/contact', close: true }
        : { lines: ['!visitor is not in the sudoers file. This incident will be reported. (kidding — try `sudo hire-me`)'] },
  },
  clear: { usage: 'clear', help: 'clear the screen', run: () => ({ lines: [], clear: true }) },
  exit: { usage: 'exit', help: 'close the terminal', run: () => ({ lines: [], close: true }) },
}

// Friendly aliases people type out of habit.
const ALIASES: Record<string, string> = { '?': 'help', home: 'sky', cd: 'sky', posts: 'blog', q: 'exit', quit: 'exit' }

function helpLines() {
  return Object.values(COMMANDS).map((c) => `${c.usage.padEnd(30)} ${c.help}`)
}

export function runCommand(input: string): CommandResult {
  const [rawName = '', ...args] = input.trim().split(/\s+/)
  if (!rawName) return { lines: [] }
  const lower = rawName.toLowerCase()
  const name = ALIASES[lower] ?? lower
  if (lower === 'projects') return COMMANDS.ls.run(['projects'])
  const cmd = COMMANDS[name]
  if (!cmd) return { lines: [`!command not found: ${rawName}. try \`help\``] }
  return cmd.run(args)
}

/** Tab completion for the command name, or for `open` / `blog` arguments. */
export function complete(input: string): string {
  const parts = input.trimStart().split(/\s+/)
  if (parts.length === 1) {
    const hits = Object.keys(COMMANDS).filter((c) => c.startsWith(parts[0].toLowerCase()))
    return hits.length === 1 ? `${hits[0]} ` : input
  }
  const [cmd, partial = ''] = parts
  const pool = cmd === 'open' ? targets() : cmd === 'blog' ? posts.map((p) => p.slug) : []
  const hits = pool.filter((t) => t.startsWith(partial))
  return hits.length === 1 ? `${cmd} ${hits[0]}` : input
}

/** Shortcuts shown as chips: the fast path on phones, and a hint for everyone else. */
export const QUICK_COMMANDS = ['whoami', 'ls projects', 'blog', 'sudo hire-me', 'help']
