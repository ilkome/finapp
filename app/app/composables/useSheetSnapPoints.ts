export function useSheetSnapPoints() {
  // Touch: keep the drag-to-expand detent. Mouse (no gesture): open a full,
  // scrollable sheet - `undefined` disables the detent.
  const isTouch = useMediaQuery('(pointer: coarse)')
  return computed(() => isTouch.value ? [500, 0.98] : undefined)
}
