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
