<script setup lang="ts">
import { useUserMenuData } from '~/components/layout/useUserMenuData'
import { BLACK_PRIMARY, swatchPalette } from '~/components/theme/useThemeOptions'

const { collapsed = false } = defineProps<{ collapsed?: boolean }>()

const { t } = useI18n()
const { dropdownItems, triggerAvatar, triggerLabel } = useUserMenuData()
</script>

<template>
  <UDropdownMenu
    :content="{ align: 'center', collisionPadding: 12 }"
    :items="dropdownItems"
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
      class="pointer-events-auto min-h-12 bg-transparent backdrop-blur transition-colors hover:bg-elevated/50! active:bg-elevated/50! data-[state=open]:bg-elevated/50!"
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
