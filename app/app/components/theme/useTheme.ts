import type { Theme } from '~/components/theme/types'

export function useTheme() {
  const { t } = useI18n()
  const colorMode = useColorMode()
  const isDark = computed(() => colorMode.value === 'dark')

  const options: {
    label: string
    value: Theme
  }[] = [{
    label: t('theme.system'),
    value: 'system',
  }, {
    label: t('theme.dark'),
    value: 'dark',
  }, {
    label: t('theme.light'),
    value: 'light',
  }] as const

  function setTheme(theme: Theme) {
    colorMode.preference = theme
  }

  function toggleTheme() {
    setTheme(isDark.value ? 'light' : 'dark')
  }

  return {
    isDark,
    options,
    preference: computed(() => colorMode.preference),
    setTheme,
    toggleTheme,
  }
}
