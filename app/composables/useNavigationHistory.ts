import { readonly, ref } from 'vue'

type NavigationApiEntry = { index: number, key: string, url: string }
type NavigationApi = {
  addEventListener: (type: string, fn: () => void) => void
  back: () => unknown
  canGoBack: boolean
  currentEntry: NavigationApiEntry | null
  entries: () => NavigationApiEntry[]
  traverseTo: (key: string) => unknown
}

type RouterLike = {
  back: () => unknown
  push: (to: string) => unknown
  replace: (to: string) => unknown
}

const navigation: NavigationApi | null = typeof window === 'undefined'
  ? null
  : ((window as unknown as { navigation?: NavigationApi }).navigation ?? null)

function getEntryPathname(entry: NavigationApiEntry): string {
  return new URL(entry.url, window.location.origin).pathname
}

const _canGoBack = ref(false)

if (navigation) {
  const sync = () => {
    _canGoBack.value = navigation.canGoBack
  }
  sync()
  navigation.addEventListener('currententrychange', sync)
}

export const canGoBack = readonly(_canGoBack)

function previousEntryUrl(): string | null {
  const idx = navigation?.currentEntry?.index ?? 0
  const prev = navigation?.entries()[idx - 1]
  return prev ? getEntryPathname(prev) : null
}

function findEarlierEntry(matcher: (pathname: string) => boolean): NavigationApiEntry | null {
  if (!navigation?.currentEntry)
    return null

  const entries = navigation.entries()
  for (let i = navigation.currentEntry.index - 1; i >= 0; i--) {
    const entry = entries[i]
    if (entry && matcher(getEntryPathname(entry)))
      return entry
  }

  return null
}

function matchesPath(pathname: string, pattern: RegExp) {
  pattern.lastIndex = 0
  return pattern.test(pathname)
}

/** Use back() if target is the previous entry to avoid duplicating it on top. */
export function navigateAfterSave(router: RouterLike, target: string) {
  if (previousEntryUrl() === target)
    router.back()
  else
    router.replace(target)
}

/** Traverse to target if already in history; push otherwise — avoids cycles. */
export function navigateToAncestor(router: RouterLike, target: string) {
  const entry = findEarlierEntry(pathname => pathname === target)
  if (entry) {
    navigation?.traverseTo(entry.key)
    return
  }
  router.push(target)
}

/**
 * Skip sibling detail pages and return to the nearest earlier non-matching page.
 * Falls back to replace() when the stack only contains skipped entries.
 */
export function navigateBackSkipping(router: RouterLike, fallback: string, skipPattern: RegExp) {
  const entry = findEarlierEntry(pathname => pathname === fallback || !matchesPath(pathname, skipPattern))
  if (entry) {
    navigation?.traverseTo(entry.key)
    return
  }
  router.replace(fallback)
}
