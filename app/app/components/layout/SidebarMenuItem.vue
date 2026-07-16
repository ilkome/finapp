<script setup lang="ts">
import type { MenuItem } from '~/components/layout/useMenuData'

import { useMenuData } from '~/components/layout/useMenuData'

const { isShowText = true, item, menuId, position } = defineProps<{
  isShowText?: boolean
  item: MenuItem
  menuId: string
  position?: 'bottom'
}>()

const { t } = useI18n()
const { checkIsActive, onClick } = useMenuData()

const badgeLabel = computed(() => (item.badge ?? 0) > 9 ? '9+' : String(item.badge))
</script>

<template>
  <div
    :class="cn('group interactive flex min-h-11 items-center rounded-md px-2 py-1.5 md:min-h-9.5',
               checkIsActive(menuId) ? 'text-primary' : 'text-muted',
               isShowText && 'gap-3',
    )"
    @click="onClick(menuId)"
  >
    <div class="relative flex min-w-8 items-center justify-center">
      <Icon
        :name="item.icon"
        :size="position === 'bottom' ? '26' : '22'"
        class="text-lg leading-none"
      />
      <span
        v-if="item.badge && !isShowText"
        class="bg-expense-1 absolute top-0 right-1 size-1.5 rounded-full"
      />
    </div>

    <div
      v-if="isShowText"
      class="text-sm font-medium"
    >
      {{ item.name }}
    </div>

    <span
      v-if="isShowText && item.badge"
      :title="t('recurrences.pending.title')"
      class="bg-expense-1/15 text-expense-1 text-2xs rounded-full px-1.5 py-0.5 font-medium tabular-nums"
    >
      {{ badgeLabel }}
    </span>
  </div>
</template>
