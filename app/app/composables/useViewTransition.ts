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

  document.startViewTransition(async () => {
    update()
    await nextTick()
  })
}
