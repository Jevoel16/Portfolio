import { describe, expect, it } from 'vitest'
import { complete, runCommand } from './commands'
import { projects } from '../data/projects'

describe('terminal commands', () => {
  it('opens projects and planets by slug', () => {
    expect(runCommand('open rankit')).toMatchObject({ navigate: '/projects/rankit', close: true })
    expect(runCommand('open about').navigate).toBe('/about')
    expect(runCommand('open nope').lines[0]).toMatch(/^!open/)
  })

  it('has the easter eggs', () => {
    expect(runCommand('sudo hire-me')).toMatchObject({ navigate: '/contact' })
    expect(runCommand('theme redteam').theme).toBe('redteam')
    expect(runCommand('sudo rm -rf /').navigate).toBeUndefined()
  })

  it('switches the sky between light, dark and system', () => {
    expect(runCommand('theme light').scheme).toBe('light')
    expect(runCommand('theme dark').scheme).toBe('dark')
    expect(runCommand('theme system').scheme).toBe('system')
    expect(runCommand('theme light').theme).toBeUndefined()
    expect(runCommand('theme redteam').scheme).toBeUndefined()
  })

  it('rejects unknown themes with the usage line', () => {
    const result = runCommand('theme purple')
    expect(result.lines[0]).toMatch(/^!usage: theme light \| dark/)
    expect(result.scheme).toBeUndefined()
    expect(result.theme).toBeUndefined()
    expect(runCommand('theme').lines[0]).toMatch(/^!usage/)
  })

  it('tab-completes theme names', () => {
    expect(complete('theme li')).toBe('theme light')
    expect(complete('theme d')).toBe('theme d')
  })

  it('reports unknown commands and ignores blank input', () => {
    expect(runCommand('hack the planet').lines[0]).toMatch(/command not found: hack/)
    expect(runCommand('   ').lines).toEqual([])
  })

  it('lists projects and is case-insensitive', () => {
    expect(runCommand('LS projects').lines).toHaveLength(projects.length)
    expect(runCommand('clear').clear).toBe(true)
  })

  it('tab-completes commands and slugs', () => {
    expect(complete('who')).toBe('whoami ')
    expect(complete('open ran')).toBe('open rankit')
    expect(complete('open c')).toBe('open c')
  })
})
