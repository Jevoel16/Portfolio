import { describe, expect, it } from 'vitest'
import { bodies } from './data/bodies'
import { projects } from './data/projects'
import { posts } from './content/posts'
import { pathFor, selectionFromPath } from './routes'

describe('sky routes', () => {
  it('round-trips every body and project', () => {
    for (const { id } of [...bodies, ...projects]) expect(selectionFromPath(pathFor(id))).toBe(id)
    for (const { slug } of posts) expect(selectionFromPath(pathFor(`post:${slug}`))).toBe(`post:${slug}`)
  })

  it('treats the root and trailing slashes as home', () => {
    expect(selectionFromPath('/')).toBeNull()
    expect(selectionFromPath('/about/')).toBe('about')
  })

  it('rejects unknown paths', () => {
    expect(selectionFromPath('/projects/nope')).toBeUndefined()
    expect(selectionFromPath('/rankit')).toBeUndefined()
  })
})
