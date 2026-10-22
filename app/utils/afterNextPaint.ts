/** Runs `fn` after the next frame is painted: rAF runs just before the paint, the timeout after it. */
export function afterNextPaint(fn: () => void): void {
  requestAnimationFrame(() => setTimeout(fn))
}
