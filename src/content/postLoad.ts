import type { Post } from './types'

/** Loading a blog post body; the post only exists in `loaded`. */
export type PostLoad = { status: 'loading' } | { status: 'loaded'; post: Post } | { status: 'failed' }

export type PostLoadEvent = { type: 'START'; cached?: Post } | { type: 'RESOLVE'; post?: Post } | { type: 'FAIL' }

export const startPostLoad = (cached?: Post): PostLoad => (cached ? { status: 'loaded', post: cached } : { status: 'loading' })

/** START (a new slug) always restarts; RESOLVE and FAIL only apply while a load is showing. */
export function postLoadTransition(state: PostLoad, event: PostLoadEvent): PostLoad {
  switch (event.type) {
    case 'START':
      return startPostLoad(event.cached)
    case 'RESOLVE':
      if (state.status === 'failed') return state
      // A missing module means the post can't be shown, which must not leave the page stuck on "loading".
      return event.post ? { status: 'loaded', post: event.post } : { status: 'failed' }
    case 'FAIL':
      return state.status === 'loading' ? { status: 'failed' } : state
  }
}
