import type { DropdownMenuItem } from '@nuxt/ui'

import type { LocaleSlug } from '~/components/locale/types'

import { useDemo } from '~/components/demo/useDemo'
import { useTheme } from '~/components/theme/useTheme'
import { BLACK_PRIMARY, capitalize, useThemeOptions } from '~/components/theme/useThemeOptions'
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

export function useUserMenuData(options: { sessionActions?: boolean } = {}) {
  const { sessionActions = true } = options
  const { locale, t } = useI18n()
  const userStore = useUserStore()
  const { isDemo } = useDemo()
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

  const activePrimary = computed(() => blackAsPrimary.value ? BLACK_PRIMARY : primary.value)

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

  // Checkbox items would close the menu on select; preventDefault keeps it open so
  // several appearance tweaks can be made in one visit.
  function pick(apply: () => void) {
    return (e: Event) => {
      e.preventDefault()
      apply()
    }
  }

  const localeItems = computed<DropdownMenuItem[]>(() =>
    localeOptions.value.map(option => ({
      checked: locale.value === option.value,
      label: option.label,
      onSelect: pick(() => userStore.saveUserLocale(option.value)),
      type: 'checkbox' as const,
    })),
  )

  const themeItems = computed<DropdownMenuItem[]>(() =>
    themeOptions.map(option => ({
      checked: themePreference.value === option.value,
      icon: USER_MENU_THEME_ICONS[option.value],
      label: option.label,
      onSelect: pick(() => setTheme(option.value)),
      type: 'checkbox' as const,
    })),
  )

  const primaryItems = computed<DropdownMenuItem[]>(() => [
    {
      checked: blackAsPrimary.value,
      chip: BLACK_PRIMARY,
      label: 'Black',
      onSelect: pick(() => setBlackAsPrimary(true)),
      slot: 'chip' as const,
      type: 'checkbox' as const,
    },
    ...primaryColors.map(color => ({
      checked: !blackAsPrimary.value && primary.value === color,
      chip: color,
      label: capitalize(color),
      onSelect: pick(() => primary.value = color),
      slot: 'chip' as const,
      type: 'checkbox' as const,
    })),
  ])

  const neutralItems = computed<DropdownMenuItem[]>(() =>
    neutralColors.map(color => ({
      checked: neutral.value === color,
      chip: color,
      label: capitalize(color),
      onSelect: pick(() => neutral.value = color),
      slot: 'chip' as const,
      type: 'checkbox' as const,
    })),
  )

  const radiusItems = computed<DropdownMenuItem[]>(() =>
    radiuses.map(value => ({
      checked: radius.value === value,
      label: String(value),
      onSelect: pick(() => radius.value = value),
      radius: value,
      slot: 'radius' as const,
      type: 'checkbox' as const,
    })),
  )

  const dropdownItems = computed<DropdownMenuItem[][]>(() => [
    ...(user.value
      ? [[{
          avatar: triggerAvatar.value,
          label: triggerLabel.value,
          type: 'label' as const,
        }]]
      : []),

    [
      {
        children: localeItems.value,
        icon: 'lucide:languages',
        label: t('locale.title'),
      },
      {
        children: [
          {
            children: themeItems.value,
            icon: USER_MENU_THEME_ICONS[themePreference.value],
            label: t('theme.picker.theme'),
          },
          {
            children: primaryItems.value,
            chip: activePrimary.value,
            label: t('theme.picker.primary'),
            slot: 'chip' as const,
          },
          {
            children: neutralItems.value,
            chip: neutral.value,
            label: t('theme.picker.neutral'),
            slot: 'chip' as const,
          },
          {
            children: radiusItems.value,
            label: t('theme.picker.radius'),
            radius: radius.value,
            slot: 'radius' as const,
          },
        ],
        icon: 'i-lucide-paintbrush',
        label: t('theme.title'),
      },
    ],
    ...(sessionActions
      ? [[{
          icon: 'i-lucide-log-out',
          label: isDemo.value ? t('demo.exit') : t('user.logout'),
          onSelect: () => userStore.signOut(),
        }]]
      : []),

    [
      {
        icon: 'mdi:github',
        label: 'GitHub',
        target: '_blank',
        to: USER_MENU_GITHUB_URL,
      },
      {
        icon: 'lucide:book-open',
        label: t('login.menu.documentation'),
        target: '_blank',
        to: USER_MENU_DOCS_URL,
      },
    ],
  ])

  return {
    blackAsPrimary,
    dropdownItems,
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
