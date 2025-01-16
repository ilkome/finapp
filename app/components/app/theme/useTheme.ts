import type { Theme } from '~/components/app/theme/types'

export function useTheme() {
  const { t } = useI18n()
  const colorMode = useColorMode()

  const options: {
    label: string
    value: Theme
  }[] = [{
    label: t('theme.system'),
    value: 'system',
  }, {
    label: t('theme.dark-pink'),
    value: 'dark-pink',
  }, {
    label: t('theme.dark-blue'),
    value: 'dark-blue',
  }, {
    label: t('theme.light-pink'),
    value: 'light-pink',
  }, {
    label: t('theme.light-blue'),
    value: 'light-blue',
  }] as const

  function setTheme(theme: Theme) {
    colorMode.preference = theme
  }

  return {
    options,
    preference: computed(() => colorMode.preference),
    setTheme,
  }
}
