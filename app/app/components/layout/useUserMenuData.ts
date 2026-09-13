import type { LocaleSlug } from '~/components/locale/types'

import { useTheme } from '~/components/theme/useTheme'
import { useThemeOptions } from '~/components/theme/useThemeOptions'
import { useUserStore } from '~/components/user/useUserStore'

export type UserMenuPanel = 'appearance' | 'locale' | 'neutral' | 'primary' | 'radius' | 'theme'

export const USER_MENU_GITHUB_URL = 'https://github.com/ilkome/finapp'
export const USER_MENU_DOCS_URL = 'https://finapp-docs.ilko.me/'

export const USER_MENU_THEME_ICONS: Record<string, string> = {
  dark: 'i-lucide-moon',
  light: 'i-lucide-sun',
  system: 'i-lucide-monitor',
}

export const USER_MENU_PANEL_CHILDREN: Partial<Record<'root' | UserMenuPanel, UserMenuPanel[]>> = {
  appearance: ['theme', 'primary', 'neutral', 'radius'],
  root: ['locale', 'appearance'],
}

export function useUserMenuData() {
  const { locale, t } = useI18n()
  const userStore = useUserStore()
  const {
    isDark,
    options: themeOptions,
    preference: themePreference,
    setTheme,
    toggleTheme,
  } = useTheme()
  const {
    blackAsPrimary,
    neutral,
    neutralColors,
    primary,
    primaryColors,
    radius,
    radiuses,
    setBlackAsPrimary,
  } = useThemeOptions()

  const user = computed(() => userStore.currentUser)

  const triggerLabel = computed(() =>
    user.value?.displayName ?? user.value?.email ?? t('login.menu.title'),
  )

  const triggerAvatar = computed(() => ({
    alt: user.value?.displayName ?? undefined,
    icon: user.value?.photoURL ? undefined : 'i-lucide-user',
    src: user.value?.photoURL ?? undefined,
  }))

  const localeOptions = computed(() => [
    { label: t('locale.ru'), value: 'ru' as LocaleSlug },
    { label: t('locale.en'), value: 'en' as LocaleSlug },
  ])

  const localeLabel = computed(() => t(`locale.${locale.value}`))
  const themeLabel = computed(() => themeOptions.find(o => o.value === themePreference.value)?.label ?? '')
  const primaryLabel = computed(() => blackAsPrimary.value ? 'Black' : primary.value)

  const panelMeta = computed<Record<UserMenuPanel, { icon?: string, title: string, value?: string }>>(() => ({
    appearance: {
      icon: 'i-lucide-paintbrush',
      title: t('theme.title'),
    },
    locale: {
      icon: 'lucide:languages',
      title: t('locale.title'),
      value: localeLabel.value,
    },
    neutral: {
      icon: 'i-lucide-swatch-book',
      title: t('theme.picker.neutral'),
      value: neutral.value,
    },
    primary: {
      icon: 'i-lucide-palette',
      title: t('theme.picker.primary'),
      value: primaryLabel.value,
    },
    radius: {
      icon: 'i-lucide-square-round-corner',
      title: t('theme.picker.radius'),
      value: String(radius.value),
    },
    theme: {
      icon: USER_MENU_THEME_ICONS[themePreference.value],
      title: t('theme.picker.theme'),
      value: themeLabel.value,
    },
  }))

  return {
    blackAsPrimary,
    isDark,
    locale,
    localeOptions,
    neutral,
    neutralColors,
    panelMeta,
    primary,
    primaryColors,
    radius,
    radiuses,
    setBlackAsPrimary,
    setTheme,
    themeOptions,
    themePreference,
    toggleTheme,
    triggerAvatar,
    triggerLabel,
    userStore,
  }
}
