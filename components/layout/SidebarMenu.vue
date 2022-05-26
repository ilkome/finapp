<script lang="ts">
import useMenuData from '~/components/menu/useMenuData'

export default defineComponent({
  setup() {
    const { items, onClick, checkIsActive, checkIsShow } = useMenuData()

    return {
      items,
      onClick,
      checkIsActive,
      checkIsShow,
    }
  },
})
</script>

<template lang="pug">
div
  .flex.items-center.py-3.px-6.space-x-5.cursor-pointer(
    v-for="(item, menuId) in items"
    v-if="checkIsShow(item)"
    :key="menuId"
    :class="['hocus_bg-gray-200 dark_hocus_bg-neutral-800', { 'text-slate-900 dark_text-neutral-100': checkIsActive(menuId) }, { 'text-slate-600 dark_text-neutral-400': !checkIsActive(menuId) }]"
    @click="onClick(menuId)"
  )
    Component.w-6.h-6(
      v-if="item.component"
      :is="item.component"
    )
    .text-xl(
      v-else
      :class="item.icon"
    )

    .text-sm {{ item.name }}
    .text-2xs.text-slate-600.dark_text-neutral-400(
      v-if="item.isBeta"
      class="-ml-2 -mt-2"
    ) Beta
</template>
