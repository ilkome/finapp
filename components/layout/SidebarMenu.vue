<script>
import { defineComponent } from '#app'
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
    :class="['hocus:bg-zinc-100 dark:hocus:bg-neutral-800', { 'text-slate-900 dark:text-neutral-100': checkIsActive(menuId) }, { 'text-slate-600 dark:text-neutral-400': !checkIsActive(menuId) }]"
    @click="onClick(menuId)"
  )
    .text-xl(:class="item.icon")
    .text-sm {{ item.name }}
</template>
