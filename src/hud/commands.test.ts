import { describe, expect, it } from 'vitest'
import { complete, runCommand } from './commands'

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

  it('reports unknown commands and ignores blank input', () => {
    expect(runCommand('hack the planet').lines[0]).toMatch(/command not found: hack/)
    expect(runCommand('   ').lines).toEqual([])
  })

  it('lists projects and is case-insensitive', () => {
    expect(runCommand('LS projects').lines.length).toBeGreaterThan(5)
    expect(runCommand('clear').clear).toBe(true)
  })

  it('tab-completes commands and slugs', () => {
    expect(complete('who')).toBe('whoami ')
    expect(complete('open ran')).toBe('open rankit')
    expect(complete('open itd110')).toBe('open itd110')
  })
})
