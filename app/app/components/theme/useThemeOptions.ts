import colors from 'tailwindcss/colors'

import { omit } from '#ui/utils'

// Tailwind ships these next to the real palettes, but none of them is a usable accent.
const NON_PALETTE_COLORS = ['inherit', 'current', 'transparent', 'black', 'white']

const NEUTRAL_COLORS = ['slate', 'gray', 'zinc', 'neutral', 'stone']
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
 * Appearance options backed by appConfig, persisted under the `nuxt-ui-*` keys
 * that `app/plugins/theme.ts` reads back on boot.
 */
export function useThemeOptions() {
  const appConfig = useAppConfig()

  function setBlackAsPrimary(value: boolean) {
    appConfig.theme.blackAsPrimary = value
    window.localStorage.setItem('nuxt-ui-black-as-primary', String(value))
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

  const radius = computed({
    get() {
      return appConfig.theme.radius
    },
    set(option: number) {
      appConfig.theme.radius = option
      window.localStorage.setItem('nuxt-ui-radius', String(option))
    },
  })

  return {
    blackAsPrimary: computed(() => appConfig.theme.blackAsPrimary),
    neutral,
    neutralColors: NEUTRAL_COLORS,
    primary,
    primaryColors: PRIMARY_COLORS,
    radius,
    radiuses: RADIUSES,
    setBlackAsPrimary,
  }
}
