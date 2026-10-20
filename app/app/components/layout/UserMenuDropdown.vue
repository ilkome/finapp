<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

import type { UserMenuGroup, UserMenuPanel } from '~/components/layout/useUserMenuData'

import { useDemo } from '~/components/demo/useDemo'
import { useUserMenuData, useUserMenuGroups } from '~/components/layout/useUserMenuData'
import { BLACK_PRIMARY, swatchPalette } from '~/components/theme/useThemeOptions'
import { showSuccessToast } from '~/composables/useStoreSync'

// The laptop user menu: Nuxt UI's nested dropdown, so submenus open beside the parent on hover
// with reka's own pointer-intent handling. The phone sheet is UserMenuPanels.
// Session actions (enable demo / sign out) only make sense for a signed-in user; the login page
// renders the menu without them.
const { align = 'center', contentClass, sessionActions = false } = defineProps<{
  align?: 'center' | 'end' | 'start'
  contentClass?: string
  sessionActions?: boolean
}>()

const open = defineModel<boolean>('open', { default: false })

const { locale, t } = useI18n()
const router = useRouter()
const { generateDemoData, isDemo } = useDemo()
const { isDark, panelMeta, toggleTheme, userStore } = useUserMenuData()
const { groupsFor } = useUserMenuGroups()

async function updateDemo() {
  await generateDemoData(locale.value)
  showSuccessToast('demo.updated')
}

async function enableDemo() {
  isDemo.value = 'true'
  await generateDemoData(locale.value)
  router.push('/dashboard')
}

// Nuxt UI passes extra fields through to the item slots.
type UserMenuItem = DropdownMenuItem & { chip?: string, radius?: number, value?: string }

function optionItems(groups: UserMenuGroup[]): DropdownMenuItem[][] {
  return groups.map(group => group.options.map(option => ({
    checked: option.checked,
    chip: option.chip,
    icon: option.icon,
    label: option.label,
    // Picking a value leaves the menu open so the effect is visible right away.
    onSelect: (event: Event) => {
      event.preventDefault()
      option.select()
    },
    radius: option.radius,
    slot: option.chip || option.radius != null ? 'swatch' : undefined,
    type: 'checkbox',
  }) as DropdownMenuItem))
}

function panelItem(panel: UserMenuPanel, children: DropdownMenuItem[][]): DropdownMenuItem {
  const meta = panelMeta.value[panel]
  return { children, icon: meta.icon, label: meta.title, slot: 'sub', value: meta.value } as DropdownMenuItem
}

const items = computed<DropdownMenuItem[][]>(() => {
  const account: DropdownMenuItem[] = isDemo.value
    ? [
        { icon: 'lucide:refresh-cw', label: t('demo.update'), onSelect: updateDemo },
        { icon: 'i-lucide-log-out', label: t('demo.exit'), onSelect: () => userStore.signOut() },
      ]
    : userStore.currentUser
      ? [{ onSelect: (event: Event) => event.preventDefault(), slot: 'account' }]
      : []

  return [
    account,
    [
      panelItem('locale', optionItems(groupsFor('locale'))),
      panelItem('appearance', [
        [
          panelItem('theme', optionItems(groupsFor('theme'))),
          panelItem('primary', optionItems(groupsFor('primary'))),
          panelItem('neutral', optionItems(groupsFor('neutral'))),
          panelItem('radius', optionItems(groupsFor('radius'))),
        ],
      ]),
      { icon: 'hugeicons:settings-01', label: t('settings.title'), to: '/settings' },
    ],
    ...(sessionActions && !isDemo.value
      ? [[
          { icon: 'mdi:play-box-outline', label: t('login.openDemo'), onSelect: enableDemo },
          { icon: 'i-lucide-log-out', label: t('user.logout'), onSelect: () => userStore.signOut() },
        ]]
      : []),
  ].filter(group => group.length)
})
</script>

<template>
  <UDropdownMenu
    v-model:open="open"
    :content="{ align }"
    :items

    :ui="{ content: contentClass }"
  >
    <slot />

    <template #account>
      <div class="flex w-full items-center gap-2">
        <div class="min-w-0 grow">
          <UserViewLogout compact hideEmail />
        </div>
        <UiActionButton
          :ariaLabel="t(isDark ? 'theme.light' : 'theme.dark')"
          class="shrink-0"
          @click.stop="toggleTheme"
        >
          <Icon :name="isDark ? 'i-lucide-sun' : 'i-lucide-moon'" size="20" />
        </UiActionButton>
      </div>
    </template>

    <template #sub-trailing="{ item }">
      <span class="text-xs font-normal text-dimmed capitalize">{{ (item as UserMenuItem).value }}</span>
      <UIcon name="lucide:chevron-right" class="size-4 shrink-0 text-muted" />
    </template>

    <template #swatch-leading="{ item }">
      <span class="flex size-5 shrink-0 justify-center">
        <span v-if="(item as UserMenuItem).chip === BLACK_PRIMARY" class="size-5 shrink-0 rounded-full bg-black dark:bg-white" />
        <span
          v-else-if="(item as UserMenuItem).chip"
          class="size-5 shrink-0 rounded-full bg-(--chip-light) dark:bg-(--chip-dark)"
          :style="{
            '--chip-light': `var(--color-${swatchPalette((item as UserMenuItem).chip!)}-500)`,
            '--chip-dark': `var(--color-${swatchPalette((item as UserMenuItem).chip!)}-400)`,
          }"
        />
        <span
          v-else
          class="size-5 shrink-0 bg-elevated ring-1 ring-accented"
          :style="{ borderRadius: `${(item as UserMenuItem).radius}rem` }"
        />
      </span>
    </template>
  </UDropdownMenu>
</template>
