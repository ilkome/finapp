import colors from 'tailwindcss/colors'

import { omit } from '#ui/utils'

// Tailwind ships these next to the real palettes, but none of them is a usable accent.
const NON_PALETTE_COLORS = ['inherit', 'current', 'transparent', 'black', 'white']

// slate/gray/zinc/neutral/stone are Tailwind palettes; taupe/mauve/mist/olive are
// the extra neutrals @nuxt/ui's docs offer - their palettes live in `theme.css`.
const NEUTRAL_COLORS = ['slate', 'gray', 'zinc', 'neutral', 'stone', 'taupe', 'mauve', 'mist', 'olive']
const RADIUSES = [0, 0.25, 0.375, 0.5]

const PRIMARY_COLORS = Object.keys(
  omit(colors, [...NON_PALETTE_COLORS, ...NEUTRAL_COLORS] as (keyof typeof colors)[]),
)

/** Sentinel for the black accent, which is a theme flag rather than a palette entry. */
export const BLACK_PRIMARY = '__black__'

export function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/**
 * Nuxt UI rebinds `--color-neutral-*` to whichever palette is selected as the
 * semantic neutral, leaving the literal neutral palette only under `old-neutral`.
 * Swatches must map through this or the `neutral` option renders colourless.
 */
export function swatchPalette(color: string) {
  return color === 'neutral' ? 'old-neutral' : color
}

/**
 * Appearance options, mirroring @nuxt/ui's docs `useTheme`. radius and
 * black-as-primary are `useLocalStorage` refs (self-hydrating, no boot plugin);
 * primary/neutral live in appConfig (the module reads them to emit colour
 * classes) and are restored by `app/plugins/theme.ts` before first paint.
 * `style` is the head-injected CSS that applies radius and the black accent.
 */
export function useThemeOptions() {
  const appConfig = useAppConfig()

  const radius = useLocalStorage('nuxt-ui-radius', 0.375)
  const blackAsPrimary = useLocalStorage('nuxt-ui-black-as-primary', true)

  function setBlackAsPrimary(value: boolean) {
    blackAsPrimary.value = value
  }

  const primary = computed({
    get() {
      return appConfig.ui.colors.primary
    },
    set(option: string) {
      appConfig.ui.colors.primary = option
      window.localStorage.setItem('nuxt-ui-primary', option)
      setBlackAsPrimary(false)
    },
  })

  const neutral = computed({
    get() {
      return appConfig.ui.colors.neutral
    },
    set(option: string) {
      appConfig.ui.colors.neutral = option
      window.localStorage.setItem('nuxt-ui-neutral', option)
    },
  })

  const radiusStyle = computed(() => `:root { --ui-radius: ${radius.value}rem; }`)
  const blackAsPrimaryStyle = computed(() =>
    blackAsPrimary.value ? `:root { --ui-primary: black; } .dark { --ui-primary: #ededed; }` : ':root {}',
  )

  const style = [
    { id: 'nuxt-ui-radius', innerHTML: radiusStyle, tagPriority: -2 },
    { id: 'nuxt-ui-black-as-primary', innerHTML: blackAsPrimaryStyle, tagPriority: -2 },
  ]

  return {
    blackAsPrimary: computed(() => blackAsPrimary.value),
    neutral,
    neutralColors: NEUTRAL_COLORS,
    primary,
    primaryColors: PRIMARY_COLORS,
    radius,
    radiuses: RADIUSES,
    setBlackAsPrimary,
    style,
  }
}
