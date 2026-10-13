import type { Router } from 'vue-router'

/**
 * Browser Back closes the top bottom sheet instead of navigating the page, so
 * nested sheets dismiss like native iOS/Android sheets. Sheet visibility stays
 * owned by each sheet; this module mirrors the open-sheet stack onto synthetic
 * same-URL history entries and animate-closes the top sheet on Back.
 */

type ScrollPosition = { left: number, top: number }
type DrawerEntry = { requestClose: () => void, restoreScroll: boolean, scroll: ScrollPosition }

const stack: DrawerEntry[] = []

// Synthetic entries actually pushed, tracked apart from stack.length so a burst
// of open/close in one tick reconciles to a single net history change - closing
// one sheet while opening another (e.g. menu -> search) leaves history untouched
// instead of racing a pop against a push.
let syntheticDepth = 0

let poppingSelf = false
let pendingSelfPopRestore: ScrollPosition | null = null
let unwinding = false
let reconcileScheduled = false
let router: Router | null = null
let installed = false

function getScrollPosition(): ScrollPosition {
  return {
    left: document.scrollingElement?.scrollLeft ?? window.scrollX,
    top: document.scrollingElement?.scrollTop ?? window.scrollY,
  }
}

function pushEntry(scroll: ScrollPosition) {
  const currentState = { ...window.history.state, scroll }
  window.history.replaceState(currentState, '')
  window.history.pushState({ ...currentState, __drawer: true, scroll: null }, '')
  syntheticDepth += 1
}

function popEntries(count: number) {
  poppingSelf = true
  syntheticDepth -= count
  window.history.go(-count)
}

function restoreScrollAfterNavigation(scroll: ScrollPosition) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => window.scrollTo(scroll))
  })
}

function reconcile() {
  reconcileScheduled = false
  const diff = stack.length - syntheticDepth
  if (diff > 0) {
    pendingSelfPopRestore = null
    for (let i = syntheticDepth; i < stack.length; i++)
      pushEntry(stack[i]!.scroll)
  }
  else if (diff < 0) {
    popEntries(-diff)
  }
  else {
    pendingSelfPopRestore = null
  }
}

function scheduleReconcile() {
  if (reconcileScheduled)
    return
  reconcileScheduled = true
  // Macrotask, not microtask: a router navigation triggered in the same tick as
  // a sheet close (close-and-navigate) runs its guard in a microtask, which must
  // see the not-yet-shrunk syntheticDepth so it consumes the entry via replace().
  // A microtask reconcile could shrink first and fire history.go, which races the
  // navigation and wins as a Back.
  setTimeout(reconcile, 0)
}

// A pop between synthetic entries stays on the same URL, yet vue-router would still resolve it into a
// fresh route object, and everything reading the route re-renders under the closing sheet. The
// router never saw these entries, so its own history position stays consistent without the event.
function onPopState(event: PopStateEvent) {
  if (poppingSelf || stack.length > 0 || window.history.state?.__drawer)
    event.stopImmediatePropagation()

  if (poppingSelf) {
    poppingSelf = false
    if (pendingSelfPopRestore) {
      restoreScrollAfterNavigation(pendingSelfPopRestore)
      pendingSelfPopRestore = null
    }
    return
  }

  if (stack.length === 0) {
    // Forward into an already-consumed synthetic entry: bounce back so it can
    // neither re-open a sheet nor strand a phantom entry.
    if (window.history.state?.__drawer) {
      poppingSelf = true
      window.history.back()
    }
    return
  }

  syntheticDepth -= 1
  stack.pop()?.requestClose()
}

// Registered on import, not in installDrawerHistory: window runs popstate listeners in registration
// order, and this one has to come before the router's, which it creates while the plugins run.
if (typeof window !== 'undefined')
  window.addEventListener('popstate', onPopState)

export function registerDrawer(requestClose: () => void): () => void {
  const entry: DrawerEntry = { requestClose, restoreScroll: true, scroll: getScrollPosition() }
  let unregistered = false
  stack.push(entry)
  scheduleReconcile()

  return () => {
    if (unregistered)
      return
    unregistered = true

    const i = stack.indexOf(entry)
    if (i !== -1) {
      const removed = stack.splice(i)
      for (let k = removed.length - 1; k >= 1; k--)
        removed[k]!.requestClose()
      scheduleReconcile()
    }

    if (!entry.restoreScroll)
      return

    if (i === -1)
      restoreScrollAfterNavigation(entry.scroll)
    else
      pendingSelfPopRestore = entry.scroll
  }
}

export function installDrawerHistory(r: Router): void {
  if (installed)
    return
  installed = true
  router = r

  if (window.history.state?.__drawer)
    window.history.replaceState({ ...window.history.state, __drawer: undefined }, '')

  // Navigating away closes every open sheet. The topmost synthetic entry we sit
  // on is consumed by re-issuing the navigation as a replace(): this avoids the
  // history.go()+popstate dance, which vue-router would interpret as its own
  // Back navigation and race against the re-issue (leaving the user in place).
  // Deeper synthetic entries (rare - only with 2+ sheets open) are skipped by
  // the forward-bounce on a later Back.
  r.beforeEach((to, from) => {
    if (unwinding) {
      unwinding = false
      return true
    }
    if (to.fullPath === from.fullPath)
      return true
    if (stack.length === 0 && syntheticDepth === 0)
      return true

    const removed = stack.splice(0)
    pendingSelfPopRestore = null
    for (let k = removed.length - 1; k >= 0; k--) {
      removed[k]!.restoreScroll = false
      removed[k]!.requestClose()
    }

    if (syntheticDepth > 0) {
      syntheticDepth = 0
      unwinding = true
      queueMicrotask(() => router?.replace(to.fullPath))
      return false
    }
    return true
  })
}
