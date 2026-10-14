<script setup lang="ts">
import type { UserMenuPanel } from '~/components/layout/useUserMenuData'

import {
  USER_MENU_PANEL_CHILDREN_PHONE,
  useUserMenuData,
  useUserMenuGroups,
} from '~/components/layout/useUserMenuData'
import { BLACK_PRIMARY, swatchPalette } from '~/components/theme/useThemeOptions'
import { useMenuLabelVisibility } from '~/composables/useMenuLabelVisibility'

// Child rows or pick-one options of one phone user-menu panel; a child row emits `open` for the slide panel.
// The laptop menu is UserMenuDropdown.
const { panel } = defineProps<{ panel: 'root' | UserMenuPanel }>()
const emit = defineEmits<{ open: [panel: UserMenuPanel] }>()

const { t } = useI18n()
const isShowMenuLabels = useMenuLabelVisibility()
const { panelMeta } = useUserMenuData()

const childRows = computed(() =>
  (USER_MENU_PANEL_CHILDREN_PHONE[panel] ?? []).map(id => ({ id, ...panelMeta.value[id] })),
)

const { groupsFor } = useUserMenuGroups()
const groups = computed(() => groupsFor(panel))

// Phone colour/radius panels collapse into swatch strips so the page behind the sheet stays visible.
const isCompact = computed(() => ['color', 'radius'].includes(panel))

const rowClass = 'flex min-h-10.5 w-full items-center gap-3 rounded-sm interactive py-1.5 pr-2 pl-3 text-left text-sm leading-none font-medium tracking-wide text-toned'
const iconSlotClass = 'flex shrink-0 justify-center'
const compactClass = 'flex shrink-0 flex-col items-center gap-1 rounded-md p-2 text-xs text-muted interactive data-checked:bg-elevated data-checked:text-default'
</script>

<template>
  <div v-if="childRows.length" class="grid gap-0.5">
    <button v-for="row in childRows" :key="row.id" :class="rowClass" type="button" @click="emit('open', row.id)">
      <span :class="iconSlotClass">
        <UIcon :name="row.icon" class="size-5 text-muted" />
      </span>
      <span class="grow">{{ row.title }}</span>
      <span class="text-xs font-normal text-dimmed capitalize">{{ row.value }}</span>
      <UIcon name="lucide:chevron-right" class="size-4 shrink-0 text-muted" />
    </button>

    <!-- Bottom-nav labels only exist on the phone layout. -->
    <UiSwitchItem
      v-if="panel === 'appearance'"
      :checkboxValue="isShowMenuLabels"
      :title="t('settings.menuLabels')"
      class="mt-1"
      @toggle="isShowMenuLabels = !isShowMenuLabels"
    />
  </div>

  <div v-else class="grid gap-1">
    <template v-for="group in groups" :key="group.title ?? ''">
      <span v-if="group.title" class="px-2 pt-2 text-xs text-muted">{{ group.title }}</span>
      <div
        :class="isCompact ? 'flex gap-2 overflow-x-auto py-1' : 'grid gap-0.5'"
        :data-reka-swipe-ignore="isCompact ? '' : undefined"
      >
        <button
          v-for="option in group.options"
          :key="option.key"
          :class="isCompact ? compactClass : rowClass"
          :data-checked="isCompact && option.checked ? '' : undefined"
          type="button"
          @click="option.select"
        >
          <span v-if="option.icon || option.chip || option.radius != null" :class="iconSlotClass">
            <UIcon v-if="option.icon" :name="option.icon" class="size-5 text-muted" />
            <span v-else-if="option.chip === BLACK_PRIMARY" class="size-5 shrink-0 rounded-full bg-black dark:bg-white" />
            <span
              v-else-if="option.chip"
              class="size-5 shrink-0 rounded-full bg-(--chip-light) dark:bg-(--chip-dark)"
              :style="{
                '--chip-light': `var(--color-${swatchPalette(option.chip)}-500)`,
                '--chip-dark': `var(--color-${swatchPalette(option.chip)}-400)`,
              }"
            />
            <span
              v-else
              class="size-5 shrink-0 bg-elevated ring-1 ring-accented"
              :style="{ borderRadius: `${option.radius}rem` }"
            />
          </span>
          <span class="grow">{{ option.label }}</span>
          <UIcon v-if="option.checked && !isCompact" name="lucide:check" class="size-4 shrink-0 text-primary" />
        </button>
      </div>
    </template>
  </div>
</template>
