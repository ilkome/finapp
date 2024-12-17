<script setup lang="ts">
import useMenuData, { type MenuItem } from '~/components/layout/useMenuData'
import { getStyles } from '~/components/ui/getStyles'

const props = withDefaults(defineProps<{
  isShowTitle?: boolean
  item: MenuItem
  menuId: string
  position?: 'bottom'
}>(), {
  isShowTitle: true,
})

const { checkIsActive, onClick } = useMenuData()
</script>

<template>
  <div
    :class="[
      getStyles('item', ['center', 'link', 'minh2', 'rounded', 'padding1']),
      {
        '!text-1': checkIsActive(props.menuId),
        'gap-3': props.isShowTitle,
      },
    ]"
    class="group"
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
      v-if="props.isShowTitle"
      class="text-sm"
    >
      {{ item.name }}
    </div>
  </div>
</template>
