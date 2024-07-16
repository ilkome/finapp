<script setup lang="ts">
import useMenuData from '~/components/layout/useMenuData'
import { getStyles } from '~/components/ui/getStyles'

const props = withDefaults(defineProps<{
  isShowTitle?: boolean
  item: unknown
  menuId: unknown
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
        '!text-prima bg-item-5': checkIsActive(props.menuId),
        'mb-3': props.menuId === 'trnForm',
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
        group-[.is-bigger]:!size-6
        group-[.is-trnForm]:!size-7
      "
    />

    <Icon
      v-else
      :name="props.item?.icon"
      size="22"
      class="text-lg group-[.is-bigger]:!text-2xl leading-none"
    />

    <div
      v-if="props.isShowTitle"
      class="text-sm"
    >
      {{ item.name }}
    </div>
  </div>
</template>
