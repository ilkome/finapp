import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

type Entry = { index: number, key: string, url: string }

function createNavigation(entries: Entry[], currentIndex: number) {
  const listeners = new Map<string, Array<() => void>>()
  return {
    _emit(type: string) {
      listeners.get(type)?.forEach(fn => fn())
    },
    addEventListener: (type: string, fn: () => void) => {
      const arr = listeners.get(type) ?? []
      arr.push(fn)
      listeners.set(type, arr)
    },
    back: vi.fn(),
    get canGoBack() { return currentIndex > 0 },
    get currentEntry() { return entries[currentIndex] ?? null },
    entries: () => entries,
    traverseTo: vi.fn(),
  }
}

function stubNavigation(entries: Entry[], currentIndex: number, extra?: Record<string, unknown>) {
  vi.stubGlobal('window', {
    location: { origin: 'http://localhost' },
    navigation: { ...createNavigation(entries, currentIndex), ...extra },
  })
  vi.resetModules()
}

function stubNoNavigation() {
  vi.stubGlobal('window', { location: { origin: 'http://localhost' } })
  vi.resetModules()
}

const defaultEntries: Entry[] = [
  { index: 0, key: 'k0', url: 'http://localhost/categories' },
  { index: 1, key: 'k1', url: 'http://localhost/categories/abc' },
  { index: 2, key: 'k2', url: 'http://localhost/categories/abc/edit' },
]

describe('useNavigationHistory', () => {
  beforeEach(() => {
    stubNavigation(defaultEntries, 2)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('canGoBack reflects navigation.canGoBack on import', async () => {
    const { canGoBack } = await import('~/composables/useNavigationHistory')
    expect(canGoBack.value).toBe(true)
  })

  it('canGoBack is false at the first entry', async () => {
    stubNavigation([{ index: 0, key: 'k0', url: 'http://localhost/x' }], 0)
    const { canGoBack } = await import('~/composables/useNavigationHistory')
    expect(canGoBack.value).toBe(false)
  })

  it('navigateAfterSave calls router.back when previous entry equals target', async () => {
    const { navigateAfterSave } = await import('~/composables/useNavigationHistory')
    const router = { back: vi.fn(), replace: vi.fn() }
    navigateAfterSave(router, '/categories/abc')
    expect(router.back).toHaveBeenCalledOnce()
    expect(router.replace).not.toHaveBeenCalled()
  })

  it('navigateAfterSave calls router.replace when previous entry differs', async () => {
    const { navigateAfterSave } = await import('~/composables/useNavigationHistory')
    const router = { back: vi.fn(), replace: vi.fn() }
    navigateAfterSave(router, '/somewhere/else')
    expect(router.replace).toHaveBeenCalledWith('/somewhere/else')
    expect(router.back).not.toHaveBeenCalled()
  })

  it('navigateAfterSave calls router.replace at the first entry (no prev)', async () => {
    stubNavigation([{ index: 0, key: 'k0', url: 'http://localhost/edit' }], 0)
    const { navigateAfterSave } = await import('~/composables/useNavigationHistory')
    const router = { back: vi.fn(), replace: vi.fn() }
    navigateAfterSave(router, '/detail')
    expect(router.replace).toHaveBeenCalledWith('/detail')
  })

  it('navigateToAncestor traverses to an existing earlier entry', async () => {
    const traverseTo = vi.fn()
    stubNavigation([
      { index: 0, key: 'k0', url: 'http://localhost/categories' },
      { index: 1, key: 'k1', url: 'http://localhost/categories/parent' },
      { index: 2, key: 'k2', url: 'http://localhost/categories/child' },
    ], 2, { traverseTo })
    const { navigateToAncestor } = await import('~/composables/useNavigationHistory')
    const router = { back: vi.fn(), push: vi.fn(), replace: vi.fn() }
    navigateToAncestor(router, '/categories/parent')
    expect(traverseTo).toHaveBeenCalledWith('k1')
    expect(router.push).not.toHaveBeenCalled()
  })

  it('navigateToAncestor pushes when target is not in history', async () => {
    const { navigateToAncestor } = await import('~/composables/useNavigationHistory')
    const router = { back: vi.fn(), push: vi.fn(), replace: vi.fn() }
    navigateToAncestor(router, '/categories/never-visited')
    expect(router.push).toHaveBeenCalledWith('/categories/never-visited')
  })

  it('navigateToAncestor pushes when Navigation API unavailable', async () => {
    stubNoNavigation()
    const { navigateToAncestor } = await import('~/composables/useNavigationHistory')
    const router = { back: vi.fn(), push: vi.fn(), replace: vi.fn() }
    navigateToAncestor(router, '/x')
    expect(router.push).toHaveBeenCalledWith('/x')
  })

  it('navigateBackSkipping traverses to the nearest earlier entry outside the skipped wallet pages', async () => {
    const traverseTo = vi.fn()
    stubNavigation([
      { index: 0, key: 'k0', url: 'http://localhost/dashboard' },
      { index: 1, key: 'k1', url: 'http://localhost/wallets/first' },
      { index: 2, key: 'k2', url: 'http://localhost/wallets/second' },
      { index: 3, key: 'k3', url: 'http://localhost/wallets/third' },
    ], 3, { traverseTo })
    const { navigateBackSkipping } = await import('~/composables/useNavigationHistory')
    const router = { back: vi.fn(), push: vi.fn(), replace: vi.fn() }
    navigateBackSkipping(router, '/wallets', /^\/wallets\/[^/]+$/)
    expect(traverseTo).toHaveBeenCalledWith('k0')
    expect(router.replace).not.toHaveBeenCalled()
  })

  it('navigateBackSkipping replaces with the fallback when history contains only skipped pages', async () => {
    stubNavigation([
      { index: 0, key: 'k0', url: 'http://localhost/wallets/first' },
      { index: 1, key: 'k1', url: 'http://localhost/wallets/second' },
    ], 1)
    const { navigateBackSkipping } = await import('~/composables/useNavigationHistory')
    const router = { back: vi.fn(), push: vi.fn(), replace: vi.fn() }
    navigateBackSkipping(router, '/wallets', /^\/wallets\/[^/]+$/)
    expect(router.replace).toHaveBeenCalledWith('/wallets')
  })

  it('navigateBackSkipping traverses to an earlier fallback even when it matches the skipped pattern', async () => {
    const traverseTo = vi.fn()
    stubNavigation([
      { index: 0, key: 'k0', url: 'http://localhost/dashboard' },
      { index: 1, key: 'k1', url: 'http://localhost/categories/parent' },
      { index: 2, key: 'k2', url: 'http://localhost/categories/child-a' },
      { index: 3, key: 'k3', url: 'http://localhost/categories/child-b' },
    ], 3, { traverseTo })
    const { navigateBackSkipping } = await import('~/composables/useNavigationHistory')
    const router = { back: vi.fn(), push: vi.fn(), replace: vi.fn() }
    navigateBackSkipping(router, '/categories/parent', /^\/categories\/[^/]+$/)
    expect(traverseTo).toHaveBeenCalledWith('k1')
    expect(router.replace).not.toHaveBeenCalled()
  })

  it('canGoBack stays false in environments without Navigation API', async () => {
    stubNoNavigation()
    const { canGoBack, navigateAfterSave } = await import('~/composables/useNavigationHistory')
    expect(canGoBack.value).toBe(false)
    const router = { back: vi.fn(), replace: vi.fn() }
    navigateAfterSave(router, '/anywhere')
    expect(router.replace).toHaveBeenCalledWith('/anywhere')
    expect(router.back).not.toHaveBeenCalled()
  })
})
