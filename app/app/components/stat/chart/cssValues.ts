import { shallowRef } from 'vue'

const CSS_FUNCTION = /var\(|color-mix\(|oklch\(|oklab\(/

/**
 * A copy of an echarts option with every CSS value the canvas renderer cannot read (`var(--…)`,
 * `color-mix()`, `oklch()`) replaced by `resolve(value, key)`. Only plain objects and arrays are copied;
 * functions and class instances are kept as they are.
 */
export function resolveCssValues<T>(value: T, resolve: (css: string, key: string) => string, key = ''): T {
  if (typeof value === 'string')
    return (CSS_FUNCTION.test(value) ? resolve(value, key) : value) as T
  if (Array.isArray(value))
    return value.map(item => resolveCssValues(item, resolve, key)) as T
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    const result: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value))
      result[k] = resolveCssValues(v, resolve, k)
    return result as T
  }
  return value
}

// Values that change with the theme: when any of them resolves differently, every resolved value is stale.
const THEME_PROBES = ['var(--ui-bg)', 'var(--ui-primary)', 'var(--ui-text-dimmed)', 'var(--chart-line)', 'var(--color-expense-1)']

let probe: HTMLElement | undefined
let pixel: CanvasRenderingContext2D | undefined
const cache = new Map<string, string>()
const themeVersion = shallowRef(0)
let fingerprint = ''

function computedColor(css: string): string {
  probe!.style.color = css
  // The computed value can still be `oklch()` / `oklab()`; one painted pixel gives plain sRGB.
  const color = getComputedStyle(probe!).color
  pixel!.clearRect(0, 0, 1, 1)
  pixel!.fillStyle = color
  pixel!.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = pixel!.getImageData(0, 0, 1, 1).data
  return a === 255 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${+(a! / 255).toFixed(3)})`
}

function resolveOne(css: string, key: string): string {
  const cacheKey = `${key === 'fontFamily' ? 'font' : 'color'}:${css}`
  let resolved = cache.get(cacheKey)
  if (resolved === undefined) {
    if (key === 'fontFamily') {
      probe!.style.fontFamily = css
      resolved = getComputedStyle(probe!).fontFamily
    }
    else {
      resolved = computedColor(css)
    }
    cache.set(cacheKey, resolved)
  }
  return resolved
}

function setup() {
  if (probe)
    return
  probe = document.createElement('i')
  probe.style.display = 'none'
  document.body.append(probe)
  pixel = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!
  fingerprint = THEME_PROBES.map(computedColor).join()
  // Color mode, palette and the black accent change classes and styles on <html> and in <head>; checked
  // once per frame, since reading computed styles forces a style recalc.
  let frame = 0
  const check = () => {
    frame = 0
    const next = THEME_PROBES.map(computedColor).join()
    if (next === fingerprint)
      return
    fingerprint = next
    cache.clear()
    themeVersion.value++
  }
  const onChange = () => {
    frame ||= requestAnimationFrame(check)
  }
  new MutationObserver(onChange).observe(document.documentElement, { attributes: true })
  new MutationObserver(onChange).observe(document.head, { characterData: true, childList: true, subtree: true })
}

/** `option` with theme CSS values resolved for the canvas renderer; reactive to theme changes. */
export function resolveChartCss<T>(option: T): T {
  setup()
  void themeVersion.value
  return resolveCssValues(option, resolveOne)
}
