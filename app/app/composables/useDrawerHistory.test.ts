// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

type Mod = typeof import('./useDrawerHistory')
type Guard = (to: { fullPath: string }, from: { fullPath: string }) => boolean | void

let popstate: ((e: PopStateEvent) => void) | undefined
let guard: Guard | undefined
let push: ReturnType<typeof vi.fn>
let replace: ReturnType<typeof vi.fn>

const flush = () => new Promise<void>(r => setTimeout(r, 0))

async function load(): Promise<Mod> {
  vi.resetModules()
  popstate = undefined
  guard = undefined
  push = vi.fn()
  replace = vi.fn()
  vi.spyOn(window, 'addEventListener').mockImplementation((type, fn) => {
    if ((type as string) === 'popstate')
      popstate = fn as (e: PopStateEvent) => void
  })
  const mod = await import('./useDrawerHistory')
  mod.installDrawerHistory({
    beforeEach: (fn: Guard) => { guard = fn },
    push,
    replace,
  } as never)
  return mod
}

function back() {
  const event = new PopStateEvent('popstate')
  const stop = vi.spyOn(event, 'stopImmediatePropagation')
  popstate?.(event)
  return stop
}

beforeEach(() => {
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    callback(0)
    return 1
  })
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  vi.spyOn(window.history, 'pushState').mockImplementation(() => {})
  vi.spyOn(window.history, 'go').mockImplementation(() => {})
  vi.spyOn(window.history, 'back').mockImplementation(() => {})
  vi.spyOn(window.history, 'replaceState').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useDrawerHistory', () => {
  it('defers the synthetic push to a microtask, then pushes once per open sheet', async () => {
    const mod = await load()
    mod.registerDrawer(vi.fn())
    mod.registerDrawer(vi.fn())
    expect(window.history.pushState).not.toHaveBeenCalled()
    await flush()
    expect(window.history.pushState).toHaveBeenCalledTimes(2)
  })

  it('stores the page position before pushing a sheet history entry', async () => {
    const mod = await load()
    const scrollingElement = {
      scrollLeft: 12,
      scrollTop: 840,
    } as HTMLElement
    vi.spyOn(document, 'scrollingElement', 'get').mockReturnValue(scrollingElement)

    mod.registerDrawer(vi.fn())
    scrollingElement.scrollTop = 0
    await flush()

    expect(window.history.replaceState).toHaveBeenCalledWith(
      expect.objectContaining({ scroll: { left: 12, top: 840 } }),
      '',
    )
    expect(window.history.pushState).toHaveBeenCalledWith(
      expect.objectContaining({ __drawer: true, scroll: null }),
      '',
    )
  })

  it('consumes the synthetic entry when a sheet closes', async () => {
    const mod = await load()
    vi.spyOn(document, 'scrollingElement', 'get').mockReturnValue({
      scrollLeft: 12,
      scrollTop: 840,
    } as HTMLElement)
    const unregister = mod.registerDrawer(vi.fn())
    await flush()
    unregister()
    await flush()
    expect(window.history.go).toHaveBeenCalledWith(-1)
    expect(window.scrollTo).not.toHaveBeenCalled()

    expect(back()).toHaveBeenCalled()
    expect(window.scrollTo).toHaveBeenCalledWith({ left: 12, top: 840 })
  })

  it('restores the opening position after Back finishes closing the sheet', async () => {
    const mod = await load()
    vi.spyOn(document, 'scrollingElement', 'get').mockReturnValue({
      scrollLeft: 0,
      scrollTop: 720,
    } as HTMLElement)
    const close = vi.fn()
    const unregister = mod.registerDrawer(close)
    await flush()

    back()
    expect(close).toHaveBeenCalledTimes(1)
    unregister()

    expect(window.scrollTo).toHaveBeenCalledWith({ left: 0, top: 720 })
  })

  it('leaves history untouched when one sheet closes as another opens', async () => {
    const mod = await load()
    const unregisterA = mod.registerDrawer(vi.fn())
    await flush()
    vi.mocked(window.history.pushState).mockClear()
    vi.mocked(window.history.go).mockClear()

    unregisterA()
    mod.registerDrawer(vi.fn())
    await flush()

    expect(window.history.pushState).not.toHaveBeenCalled()
    expect(window.history.go).not.toHaveBeenCalled()
  })

  it('closes sheets in LIFO order on Back', async () => {
    const mod = await load()
    const closeA = vi.fn()
    const closeB = vi.fn()
    mod.registerDrawer(closeA)
    mod.registerDrawer(closeB)
    await flush()

    expect(back()).toHaveBeenCalled()
    expect(closeB).toHaveBeenCalledTimes(1)
    expect(closeA).not.toHaveBeenCalled()

    back()
    expect(closeA).toHaveBeenCalledTimes(1)
  })

  it('closes sheets and replaces the synthetic entry on route change (no history.go)', async () => {
    const mod = await load()
    const close = vi.fn()
    const unregister = mod.registerDrawer(close)
    await flush()

    const result = guard!({ fullPath: '/x' }, { fullPath: '/y' })
    expect(close).toHaveBeenCalledTimes(1)
    expect(result).toBe(false)
    expect(window.history.go).not.toHaveBeenCalled()
    unregister()
    expect(window.scrollTo).not.toHaveBeenCalled()

    await flush() // deferred router.replace
    expect(replace).toHaveBeenCalledWith('/x')

    // the replace re-enters the guard and must be let through
    expect(guard!({ fullPath: '/x' }, { fullPath: '/y' })).toBe(true)
  })

  it('allows navigation without touching history when no synthetic entry exists yet', async () => {
    const mod = await load()
    const close = vi.fn()
    mod.registerDrawer(close) // registered but reconcile microtask not flushed

    const result = guard!({ fullPath: '/x' }, { fullPath: '/y' })
    expect(close).toHaveBeenCalledTimes(1)
    expect(result).toBe(true)
    expect(window.history.go).not.toHaveBeenCalled()
    expect(replace).not.toHaveBeenCalled()
  })

  it('leaves a real Back to the router', async () => {
    await load()
    expect(back()).not.toHaveBeenCalled()
  })

  it('bounces a Forward into a consumed synthetic entry', async () => {
    await load()
    vi.spyOn(window.history, 'state', 'get').mockReturnValue({ __drawer: true })
    back()
    expect(window.history.back).toHaveBeenCalled()
  })

  it('strips a stale synthetic marker left by a reload', async () => {
    vi.resetModules()
    push = vi.fn()
    vi.spyOn(window, 'addEventListener').mockImplementation(() => {})
    vi.spyOn(window.history, 'state', 'get').mockReturnValue({ __drawer: true })
    const mod = await import('./useDrawerHistory')
    mod.installDrawerHistory({ beforeEach: () => {}, push } as never)
    expect(window.history.replaceState).toHaveBeenCalled()
  })
})
