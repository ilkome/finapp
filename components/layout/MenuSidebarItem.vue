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
      ...getStyles('item', ['link', 'rounded', 'padding1', 'menu']),
      {
        '!text-prima': checkIsActive(props.menuId),
      },
    ]"
    class="group"
    @click="onClick(props.menuId)"
  >
    <Component
      :is="props.item?.component"
      v-if="props.item?.component"
      class="
        size-5
        group-[.is-bigger]:!size-6 my-1
      "
    />

    <Icon
      v-else
      :name="props.item?.icon"
      :size="position === 'bottom' ? 26 : 22"
      class="text-lg leading-none"
    />

    <div
      v-if="props.isShowTitle"
      class="text-sm"
    >
      {{ item.name }}
    </div>
  </div>
</template>
