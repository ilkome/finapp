import type { LocaleSlug } from '~/components/locale/types'

import { useTheme } from '~/components/theme/useTheme'
import { BLACK_PRIMARY, colorLabel, useThemeOptions } from '~/components/theme/useThemeOptions'
import { useUserStore } from '~/components/user/useUserStore'

export type UserMenuPanel = 'appearance' | 'color' | 'locale' | 'neutral' | 'primary' | 'radius' | 'theme'

export const USER_MENU_THEME_ICONS: Record<string, string> = {
  dark: 'i-lucide-moon',
  light: 'i-lucide-sun',
  system: 'i-lucide-monitor',
}

export const USER_MENU_PANEL_CHILDREN: Partial<Record<'root' | UserMenuPanel, UserMenuPanel[]>> = {
  appearance: ['theme', 'primary', 'neutral', 'radius'],
  root: ['locale', 'appearance'],
}

// The phone sheet folds primary + neutral into one swatch panel.
export const USER_MENU_PANEL_CHILDREN_PHONE: typeof USER_MENU_PANEL_CHILDREN = {
  ...USER_MENU_PANEL_CHILDREN,
  appearance: ['theme', 'color', 'radius'],
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
  const primaryLabel = computed(() => colorLabel(t, blackAsPrimary.value ? BLACK_PRIMARY : primary.value))

  const panelMeta = computed<Record<UserMenuPanel, { icon?: string, title: string, value?: string }>>(() => ({
    appearance: {
      icon: 'i-lucide-paintbrush',
      title: t('theme.title'),
    },
    color: {
      icon: 'i-lucide-palette',
      title: t('theme.picker.color'),
      value: primaryLabel.value,
    },
    locale: {
      icon: 'lucide:languages',
      title: t('locale.title'),
      value: localeLabel.value,
    },
    neutral: {
      icon: 'i-lucide-swatch-book',
      title: t('theme.picker.neutral'),
      value: colorLabel(t, neutral.value),
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

export type UserMenuOption = { checked: boolean, chip?: string, icon?: string, key: string, label: string, radius?: number, select: () => void }
export type UserMenuGroup = { options: UserMenuOption[], title?: string }

// The "pick one of N" groups of every leaf panel; both the phone sheet and the laptop dropdown render them.
export function useUserMenuGroups() {
  const { locale, t } = useI18n()
  const {
    blackAsPrimary,
    localeOptions,
    neutral,
    neutralColors,
    primary,
    primaryColors,
    radius,
    radiuses,
    setBlackAsPrimary,
    setTheme,
    themeOptions,
    themePreference,
    userStore,
  } = useUserMenuData()

  const primaryOptions = computed<UserMenuOption[]>(() => [
    { checked: blackAsPrimary.value, chip: BLACK_PRIMARY, key: BLACK_PRIMARY, label: colorLabel(t, BLACK_PRIMARY), select: () => setBlackAsPrimary(true) },
    ...primaryColors.map(c => ({ checked: !blackAsPrimary.value && primary.value === c, chip: c, key: c, label: colorLabel(t, c), select: () => primary.value = c })),
  ])
  const neutralOptions = computed<UserMenuOption[]>(() =>
    neutralColors.map(c => ({ checked: neutral.value === c, chip: c, key: c, label: colorLabel(t, c), select: () => neutral.value = c })),
  )

  function groupsFor(panel: 'root' | UserMenuPanel): UserMenuGroup[] {
    switch (panel) {
      case 'locale':
        return [{ options: localeOptions.value.map(o => ({ checked: locale.value === o.value, key: o.value, label: o.label, select: () => userStore.saveUserLocale(o.value) })) }]
      case 'theme':
        return [{ options: themeOptions.map(o => ({ checked: themePreference.value === o.value, icon: USER_MENU_THEME_ICONS[o.value], key: o.value, label: o.label, select: () => setTheme(o.value) })) }]
      case 'primary':
        return [{ options: primaryOptions.value }]
      case 'neutral':
        return [{ options: neutralOptions.value }]
      case 'color':
        return [
          { options: primaryOptions.value, title: t('theme.picker.primary') },
          { options: neutralOptions.value, title: t('theme.picker.neutral') },
        ]
      case 'radius':
        return [{ options: radiuses.map(r => ({ checked: radius.value === r, key: String(r), label: String(r), radius: r, select: () => radius.value = r })) }]
      default:
        return []
    }
  }

  return { groupsFor }
}
