// A touch-first mobile UI and a mouse-driven desktop one diverge at 766px, but only with a
// mouse: a wide touchscreen (tablet) should still get the mobile layout.
export function useIsLaptop() {
  return useMediaQuery('(min-width: 766px) and (pointer: fine)')
}
