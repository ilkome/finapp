<script setup lang="ts">
import type { MenuItem } from '~/components/layout/useMenuData'

import { useMenuData } from '~/components/layout/useMenuData'

const { isShowText = true, item, menuId, position } = defineProps<{
  isShowText?: boolean
  item: MenuItem
  menuId: string
  position?: 'bottom'
}>()

const { checkIsActive, onClick } = useMenuData()
</script>

<template>
  <div
    :class="cn('group interactive flex min-h-[44px] items-center rounded-sm px-2 py-1.5 md:min-h-[38px]',
               checkIsActive(menuId) ? 'text-primary' : 'text-muted',
               isShowText && 'gap-3',
    )"
    @click="onClick(menuId)"
  >
    <div class="flex min-w-8 items-center justify-center">
      <Icon
        :name="item.icon"
        :size="position === 'bottom' ? '26' : '22'"
        class="text-lg leading-none"
      />
    </div>

    <div
      v-if="isShowText"
      class="text-sm font-medium"
    >
      {{ item.name }}
    </div>
  </div>
</template>
