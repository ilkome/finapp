// @vitest-environment happy-dom
import type { Router } from 'vue-router'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// The module is a singleton (module-level stack + one popstate listener). Each
// test re-imports it fresh and captures the popstate handler instead of
// dispatching on window, so listeners never accumulate across tests.
type Mod = typeof import('./useSheetHistory')

let popstate: ((e: PopStateEvent) => void) | undefined

function fakeRouter() {
  return { beforeEach: vi.fn(), push: vi.fn() } as unknown as Router
}

async function load(): Promise<Mod> {
  vi.resetModules()
  popstate = undefined
  vi.spyOn(window, 'addEventListener').mockImplementation((type, fn) => {
    if ((type as string) === 'popstate')
      popstate = fn as (e: PopStateEvent) => void
  })
  const mod = await import('./useSheetHistory')
  mod.installSheetHistory(fakeRouter())
  return mod
}

function back() {
  popstate?.(new PopStateEvent('popstate'))
}

beforeEach(() => {
  vi.spyOn(window.history, 'pushState').mockImplementation(() => {})
  vi.spyOn(window.history, 'go').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useSheetHistory', () => {
  it('pushes a synthetic entry when a sheet registers', async () => {
    const mod = await load()
    mod.registerSheet(vi.fn())
    expect(window.history.pushState).toHaveBeenCalledTimes(1)
  })

  it('closes sheets in LIFO order on Back', async () => {
    const mod = await load()
    const closeA = vi.fn()
    const closeB = vi.fn()
    mod.registerSheet(closeA)
    mod.registerSheet(closeB)

    back()
    expect(closeB).toHaveBeenCalledTimes(1)
    expect(closeA).not.toHaveBeenCalled()

    back()
    expect(closeA).toHaveBeenCalledTimes(1)
  })

  it('consumes the synthetic entry when closed by a non-Back path', async () => {
    const mod = await load()
    const unregister = mod.registerSheet(vi.fn())
    unregister()
    expect(window.history.go).toHaveBeenCalledWith(-1)
  })

  it('does not double-consume history when Back already closed the sheet', async () => {
    const mod = await load()
    const close = vi.fn()
    const unregister = mod.registerSheet(close)

    back()
    expect(close).toHaveBeenCalledTimes(1)

    vi.mocked(window.history.go).mockClear()
    unregister()
    expect(window.history.go).not.toHaveBeenCalled()
  })

  it('swallows the popstate caused by its own history.go', async () => {
    const mod = await load()
    const closeA = vi.fn()
    const closeB = vi.fn()
    mod.registerSheet(closeA)
    const unregisterB = mod.registerSheet(closeB)

    unregisterB() // sets poppingSelf, history.go is mocked (no real popstate)
    back() // simulate the popstate that history.go would emit
    expect(closeA).not.toHaveBeenCalled() // swallowed, did not close the sheet below
  })

  it('does nothing on Back when no sheet is open', async () => {
    await load()
    expect(() => back()).not.toThrow()
  })
})
