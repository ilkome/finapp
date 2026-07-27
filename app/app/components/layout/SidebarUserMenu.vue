<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

import type { LocaleSlug } from '~/components/locale/types'

import { useDemo } from '~/components/demo/useDemo'
import { useTheme } from '~/components/theme/useTheme'
import { BLACK_PRIMARY, capitalize, swatchPalette, useThemeOptions } from '~/components/theme/useThemeOptions'
import { useUserStore } from '~/components/user/useUserStore'

const { collapsed = false } = defineProps<{ collapsed?: boolean }>()

const GITHUB_URL = 'https://github.com/ilkome/finapp'
const DOCS_URL = 'https://finapp-docs.ilko.me/'

const THEME_ICONS: Record<string, string> = {
  dark: 'i-lucide-moon',
  light: 'i-lucide-sun',
  system: 'i-lucide-monitor',
}

const { locale, t } = useI18n()
const userStore = useUserStore()
const { isDemo } = useDemo()
const { options: themeOptions, preference: themePreference, setTheme } = useTheme()
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

// Checkbox items would close the menu on select; preventDefault keeps it open so
// several appearance tweaks can be made in one visit.
function pick(apply: () => void) {
  return (e: Event) => {
    e.preventDefault()
    apply()
  }
}

const localeItems = computed<DropdownMenuItem[]>(() =>
  (['ru', 'en'] as LocaleSlug[]).map(value => ({
    checked: locale.value === value,
    label: t(`locale.${value}`),
    onSelect: pick(() => userStore.saveUserLocale(value)),
    type: 'checkbox' as const,
  })),
)

const themeItems = computed<DropdownMenuItem[]>(() =>
  themeOptions.map(option => ({
    checked: themePreference.value === option.value,
    icon: THEME_ICONS[option.value],
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

const items = computed<DropdownMenuItem[][]>(() => [
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
      children: themeItems.value,
      icon: THEME_ICONS[themePreference.value],
      label: t('theme.picker.theme'),
    },
    {
      children: [
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
  [{
    icon: 'i-lucide-log-out',
    label: isDemo.value ? t('demo.exit') : t('user.logout'),
    onSelect: () => userStore.signOut(),
  }],

  [
    {
      icon: 'mdi:github',
      label: 'GitHub',
      target: '_blank',
      to: GITHUB_URL,
    },
    {
      icon: 'lucide:book-open',
      label: t('login.menu.documentation'),
      target: '_blank',
      to: DOCS_URL,
    },
  ],
])
</script>

<template>
  <UDropdownMenu
    :content="{ align: 'center', collisionPadding: 12 }"
    :items="items"
    :ui="{ content: collapsed ? 'w-56' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      :aria-label="t('login.menu.title')"
      :avatar="triggerAvatar"
      :label="collapsed ? undefined : triggerLabel"
      :square="collapsed"
      :trailingIcon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
      :ui="{ trailingIcon: 'text-dimmed' }"
      block
      class="data-[state=open]:bg-elevated"
      color="neutral"
      variant="ghost"
    />

    <template #chip-leading="{ item }">
      <span
        v-if="(item as any).chip === BLACK_PRIMARY"
        class="size-5 shrink-0 rounded-full bg-black dark:bg-white"
      />
      <span
        v-else
        class="size-5 shrink-0 rounded-full bg-(--chip-light) dark:bg-(--chip-dark)"
        :style="{
          '--chip-light': `var(--color-${swatchPalette((item as any).chip)}-500)`,
          '--chip-dark': `var(--color-${swatchPalette((item as any).chip)}-400)`,
        }"
      />
    </template>

    <template #radius-leading="{ item }">
      <span
        class="size-5 shrink-0 bg-elevated ring-1 ring-accented"
        :style="{ borderRadius: `${(item as any).radius}rem` }"
      />
    </template>
  </UDropdownMenu>
</template>
