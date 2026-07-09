import type { Router } from 'vue-router'

/**
 * Browser Back closes the top bottom sheet instead of navigating the page, so
 * nested sheets dismiss like native iOS/Android sheets. Sheet visibility stays
 * owned by each sheet; this module mirrors the open-sheet stack onto synthetic
 * same-URL history entries and animate-closes the top sheet on Back.
 */

type SheetEntry = { requestClose: () => void }

const stack: SheetEntry[] = []

// Synthetic entries actually pushed, tracked apart from stack.length so a burst
// of open/close in one tick reconciles to a single net history change - closing
// one sheet while opening another (e.g. menu -> search) leaves history untouched
// instead of racing a pop against a push.
let syntheticDepth = 0

let poppingSelf = false
let unwinding = false
let reconcileScheduled = false
let router: Router | null = null
let installed = false

function pushEntry() {
  window.history.pushState({ ...window.history.state, __sheet: true }, '')
  syntheticDepth += 1
}

function popEntries(count: number) {
  poppingSelf = true
  syntheticDepth -= count
  window.history.go(-count)
}

function reconcile() {
  reconcileScheduled = false
  const diff = stack.length - syntheticDepth
  if (diff > 0) {
    for (let i = 0; i < diff; i++)
      pushEntry()
  }
  else if (diff < 0) {
    popEntries(-diff)
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

function onPopState() {
  if (poppingSelf) {
    poppingSelf = false
    return
  }

  if (stack.length === 0) {
    // Forward into an already-consumed synthetic entry: bounce back so it can
    // neither re-open a sheet nor strand a phantom entry.
    if (window.history.state?.__sheet) {
      poppingSelf = true
      window.history.back()
    }
    return
  }

  syntheticDepth -= 1
  stack.pop()?.requestClose()
}

export function registerSheet(requestClose: () => void): () => void {
  const entry: SheetEntry = { requestClose }
  stack.push(entry)
  scheduleReconcile()

  return () => {
    const i = stack.indexOf(entry)
    if (i === -1)
      return
    const removed = stack.splice(i)
    for (let k = removed.length - 1; k >= 1; k--)
      removed[k]!.requestClose()
    scheduleReconcile()
  }
}

export function installSheetHistory(r: Router): void {
  if (installed)
    return
  installed = true
  router = r

  window.addEventListener('popstate', onPopState)

  if (window.history.state?.__sheet)
    window.history.replaceState({ ...window.history.state, __sheet: undefined }, '')

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
    for (let k = removed.length - 1; k >= 0; k--)
      removed[k]!.requestClose()

    if (syntheticDepth > 0) {
      syntheticDepth = 0
      unwinding = true
      queueMicrotask(() => router?.replace(to.fullPath))
      return false
    }
    return true
  })
}
