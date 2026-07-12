// Restores the page scroll position across keep-alive page swaps, so returning to a
// drilled-through page lands where you left it. Height differences between pages would
// otherwise clamp or lose the position.
//
// The scroll container differs by layout: on desktop the document scrolls, while the
// mobile shell scrolls #pageScroll. resolveScroller() picks whichever actually scrolls.
//
// The key is supplied by the caller (stable per keep-alive instance) rather than read
// from the global route inside the hooks, because on navigation the global route has
// already advanced to the incoming page by the time onDeactivated fires.
const scrollPositions = new Map<string, number>()

function resolveScroller(): HTMLElement | null {
  const pageScroll = document.getElementById('pageScroll')
  if (pageScroll) {
    const overflowY = getComputedStyle(pageScroll).overflowY
    if ((overflowY === 'auto' || overflowY === 'scroll') && pageScroll.scrollHeight > pageScroll.clientHeight + 4)
      return pageScroll
  }
  return (document.scrollingElement as HTMLElement | null) ?? document.documentElement
}

export function usePageScrollMemory(key: () => string) {
  onActivated(() => {
    const y = scrollPositions.get(key()) ?? 0
    requestAnimationFrame(() => {
      const el = resolveScroller()
      if (el)
        el.scrollTop = y
    })
  })

  onDeactivated(() => {
    const el = resolveScroller()
    if (el)
      scrollPositions.set(key(), el.scrollTop)
  })
}
