export const EXPANDED_DETENT_EPSILON = 1
export const FLICK_MIN_DISTANCE = 8
export const FLICK_VELOCITY_THRESHOLD = 0.6
export const PERCENT_BASE = 100

export function hasDetents(points: number[] | undefined): points is number[] {
  return Array.isArray(points)
    && points.length >= 2
    && points.every(point => Number.isFinite(point) && point > 0)
}

export function resolveDetentFractions(points: number[] | undefined, viewportHeight: number): number[] {
  if (!hasDetents(points))
    return []

  const height = viewportHeight || 1
  return points
    .map(point => (point > 1 ? point / height : point))
    .map(fraction => Math.min(1, Math.max(0.05, fraction)))
    .sort((a, b) => a - b)
}

export function getRestingInitialY(
  fraction: number,
  expandedFraction: number,
  viewportHeight: number,
): number {
  return -((expandedFraction - fraction) * viewportHeight)
}

export function calcVisiblePercent(
  containerHeight: number,
  handlerHeight: number,
  dragDistance: number,
): number {
  if (containerHeight === 0)
    return 0

  return Math.round(
    (containerHeight + handlerHeight - dragDistance)
    / (containerHeight / PERCENT_BASE),
  )
}

export function calcOverlayOpacity(visiblePercent: number): number {
  return Math.min(1, Math.max(0, visiblePercent / PERCENT_BASE))
}

export function shouldCloseClassicSheet(
  dragDistance: number,
  threshold: number,
  direction: 'down' | 'up',
  velocity = 0,
): boolean {
  return direction === 'down'
    && (
      dragDistance >= threshold
      || (dragDistance > FLICK_MIN_DISTANCE && velocity > FLICK_VELOCITY_THRESHOLD)
    )
}

export type DetentReleaseDecision = 'close' | 'expand' | 'restore'

export function resolveDetentRelease(
  currentOffset: number,
  startOffset: number,
  velocity: number,
  threshold: number,
): DetentReleaseDecision {
  const delta = currentOffset - startOffset

  if (velocity > FLICK_VELOCITY_THRESHOLD || delta > threshold)
    return 'close'
  if (velocity < -FLICK_VELOCITY_THRESHOLD || delta < -threshold)
    return 'expand'
  return 'restore'
}
