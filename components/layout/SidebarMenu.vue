<script>
import { defineComponent } from '@nuxtjs/composition-api'
import useMenuData from '~/modules/menu/useMenuData'

export default defineComponent({
  setup () {
    const { items, onClick, checkIsActive, checkIsShow } = useMenuData()

    return {
      items,
      onClick,
      checkIsActive,
      checkIsShow
    }
  }
})
</script>

<template lang="pug">
div
  .flex.items-center.py-2.px-6.space-x-5(
    v-for="(item, menuId) in items"
    v-if="checkIsShow(item)"
    :key="menuId"
    :class="['hocus:bg-neutral-800', { 'border-r-2 border-neutral-600': checkIsActive(menuId) }]"
    @click="onClick(menuId)"
  )
    .text-xl.text-neutral-400(:class="[item.icon, { 'text-neutral-200': checkIsActive(menuId) }]")
    .text-sm.text-neutral-400(:class="{'text-neutral-200': checkIsActive(menuId)}") {{ item.name }}
</template>
