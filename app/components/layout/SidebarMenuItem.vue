<script setup lang="ts">
import useMenuData, { type MenuItem } from '~/components/layout/useMenuData'
import { getStyles } from '~/components/ui/getStyles'

const props = withDefaults(defineProps<{
  isShowText?: boolean
  item: MenuItem
  menuId: string
  position?: 'bottom'
}>(), {
  isShowText: true,
})

const { checkIsActive, onClick } = useMenuData()
</script>

<template>
  <div
    :class="[
      getStyles('item', ['center', 'link', 'minh2', 'rounded', 'padding1']),
      {
        '!text-accent-1/90': checkIsActive(props.menuId),
        'gap-3': props.isShowText,
      },
    ]"
    class="group min-h-[44px] text-2 md:min-h-[38px]"
    @click="onClick(props.menuId)"
  >
    <div class="flex min-w-8 items-center justify-center">
      <Icon
        :name="props.item.icon"
        :size="position === 'bottom' ? '26' : '22'"
        class="text-lg leading-none"
      />
    </div>

    <div
      v-if="props.isShowText"
      class="text-sm font-medium"
    >
      {{ item.name }}
    </div>
  </div>
</template>
