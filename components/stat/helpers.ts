export function getWidthPercent(value: number, biggest: number): string {
  return `${Math.abs(value) / Math.abs(biggest) * 100}%`
}
