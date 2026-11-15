import { describe, expect, it } from 'vitest'
import { postLoadTransition, startPostLoad, type PostLoad } from './postLoad'
import type { Post } from './types'

const meta = { title: 'Post', date: '2026-01-01', summary: '', tags: [], readingMinutes: 1, draft: false }
const post: Post = { ...meta, slug: 'a', html: '<p>a</p>', toc: [] }
const other: Post = { ...meta, slug: 'b', html: '<p>b</p>', toc: [] }
const loading: PostLoad = { status: 'loading' }
const loaded: PostLoad = { status: 'loaded', post }
const failed: PostLoad = { status: 'failed' }

describe('postLoadTransition', () => {
  it('starts loaded from the cache, or loading without it', () => {
    expect(startPostLoad(post)).toEqual(loaded)
    expect(startPostLoad()).toEqual(loading)
  })

  it('restarts on START from any state', () => {
    expect(postLoadTransition(failed, { type: 'START' })).toEqual(loading)
    expect(postLoadTransition(loaded, { type: 'START', cached: other })).toEqual({ status: 'loaded', post: other })
  })

  it('goes from loading to loaded on RESOLVE', () => {
    expect(postLoadTransition(loading, { type: 'RESOLVE', post })).toEqual(loaded)
  })

  it('replaces a cached post with the fresh one', () => {
    expect(postLoadTransition(loaded, { type: 'RESOLVE', post: other })).toEqual({ status: 'loaded', post: other })
  })

  it('fails instead of hanging when RESOLVE has no post', () => {
    expect(postLoadTransition(loading, { type: 'RESOLVE' })).toEqual(failed)
  })

  it('goes from loading to failed on FAIL', () => {
    expect(postLoadTransition(loading, { type: 'FAIL' })).toEqual(failed)
  })

  it('rejects RESOLVE after a failure and FAIL once loaded', () => {
    expect(postLoadTransition(failed, { type: 'RESOLVE', post })).toBe(failed)
    expect(postLoadTransition(loaded, { type: 'FAIL' })).toBe(loaded)
  })
})
