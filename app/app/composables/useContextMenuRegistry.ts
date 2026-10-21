// Shared registry of open context-menu close handlers.
// Lets UiContextMenuMy auto-dismiss siblings and lets overlays
// (trnForm Sidebar etc.) force-close any open menu.
const closers = new Set<() => void>()

export function registerContextMenu(close: () => void): () => void {
  closers.add(close)
  return () => closers.delete(close)
}

export function closeOtherContextMenus(self: () => void): void {
  for (const close of closers) {
    if (close !== self)
      close()
  }
}

export function closeAllContextMenus(): void {
  for (const close of closers) close()
}

// The page behind an open context menu goes inert through an attribute on the root, not a
// `body:has(...)` rule: Chrome re-matches the whole document for `body:has()` on every
// `data-state` change, which was the bulk of the style work of each drawer open and close.
const openMenus = new Set<() => void>()

export function setContextMenuOpen(close: () => void, isOpen: boolean): void {
  if (isOpen)
    openMenus.add(close)
  else
    openMenus.delete(close)
  document.documentElement.toggleAttribute('data-context-menu-open', openMenus.size > 0)
}
