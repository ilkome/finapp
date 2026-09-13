/**
 * Runs a state change inside a browser view transition, so elements carrying a
 * `view-transition-name` morph between their old and new position instead of jumping.
 *
 * The update has to happen inside the callback: the browser snapshots the old frame before
 * calling it. Reacting to the change afterwards (a watcher) is too late - the DOM already
 * holds the new values by the time the snapshot is taken.
 */
export function runViewTransition(update: () => void): void {
  if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    update()
    return
  }

  const transition = document.startViewTransition(async () => {
    update()
    await nextTick()
  })
  // A transition skipped by a newer one (or a hidden tab) rejects these; the update itself
  // already ran, so there is nothing to handle.
  transition.ready.catch(() => {})
  transition.finished.catch(() => {})
}

/**
 * Nested-menu panel switch as a view transition: the element carrying
 * `view-transition-name: ui-panel` slides 8px in the direction of travel (see main.css).
 */
export function runPanelTransition(direction: 'back' | 'forward', update: () => void): void {
  document.documentElement.dataset.panelDirection = direction
  runViewTransition(update)
}
