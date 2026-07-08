import type { Router } from 'vue-router'

/**
 * Maps the browser Back gesture (Android hardware back, iOS edge-swipe, desktop
 * Back button) onto "close the top bottom sheet", so nested sheets feel native.
 *
 * Invariant: sheet *visibility* is owned by each sheet's own state. This module
 * is only a Back-catcher - a LIFO stack of synthetic history entries, one per
 * open sheet. We never derive open state from history, so a Forward into a
 * consumed entry is inert (nothing re-opens). Closing by Back calls the same
 * animated `requestClose` the swipe uses, so both dismiss paths look identical.
 *
 * The synthetic entries are pushed with `history.pushState` at the *current*
 * URL (no navigation), which vue-router tolerates: it only reacts to popstate,
 * and a same-URL popstate resolves to the same route. We spread the existing
 * `history.state` so vue-router's own fields survive on the entry.
 */

type SheetEntry = { requestClose: () => void }

const stack: SheetEntry[] = []

// Set while WE call history.back()/go() to consume our own entries, so the
// resulting popstate is swallowed instead of being treated as a user Back.
let poppingSelf = false

// A route navigation requested while sheets were open, deferred until their
// synthetic entries are unwound (see installSheetHistory's beforeEach).
let pendingNav: string | null = null

let router: Router | null = null
let installed = false

function pushEntry() {
  window.history.pushState({ ...window.history.state, __sheet: true }, '')
}

function onPopState() {
  if (poppingSelf) {
    poppingSelf = false
    if (pendingNav) {
      const to = pendingNav
      pendingNav = null
      router?.push(to)
    }
    return
  }

  // Genuine user Back/Forward. Back with a sheet open: the browser already
  // dropped our top entry, so just animate-close that sheet. Forward or an
  // empty stack: inert - let the router own it.
  const top = stack.pop()
  top?.requestClose()
}

/**
 * Register an open sheet. Returns an unregister fn to call when it closes by a
 * non-Back path (swipe/X/overlay/Esc) - that consumes the synthetic entry so
 * history returns to exactly the pre-sheet state.
 */
export function registerSheet(requestClose: () => void): () => void {
  const entry: SheetEntry = { requestClose }
  stack.push(entry)
  pushEntry()

  return () => {
    const i = stack.indexOf(entry)
    if (i === -1)
      return // already removed by a Back that consumed the entry

    // Normally the top; splice covers the defensive case of a lower sheet
    // closing first (its children, if any, close with it).
    const removed = stack.splice(i)
    for (let k = removed.length - 1; k >= 1; k--)
      removed[k]!.requestClose()

    poppingSelf = true
    window.history.go(-removed.length)
  }
}

/** Install the single global popstate listener + navigation guards. Idempotent. */
export function installSheetHistory(r: Router): void {
  if (installed)
    return
  installed = true
  router = r

  window.addEventListener('popstate', onPopState)

  // A reload while a sheet was open lands on a synthetic entry. Sheets boot
  // closed, so strip the stale marker to keep history clean.
  if (window.history.state?.__sheet)
    window.history.replaceState({ ...window.history.state, __sheet: undefined }, '')

  // Navigating to another page while sheets are open (rare - the sheet overlay
  // blocks in-app links, but guards programmatic pushes) would strand the
  // synthetic entries mid-stack. Unwind them first, then reissue the nav.
  r.beforeEach((to, from) => {
    if (stack.length === 0 || to.fullPath === from.fullPath)
      return true

    const removed = stack.splice(0)
    for (let k = removed.length - 1; k >= 0; k--)
      removed[k]!.requestClose()

    pendingNav = to.fullPath
    poppingSelf = true
    window.history.go(-removed.length)
    return false
  })
}
