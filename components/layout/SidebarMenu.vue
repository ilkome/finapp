<script>
import { defineComponent } from '@nuxtjs/composition-api'
import useMenuData from '~/modules/menu/useMenuData'

export default defineComponent({
  setup () {
    const { items, onClick, getClassNames, checkIsShow } = useMenuData()

    return {
      items,
      onClick,
      getClassNames,
      checkIsShow
    }
  }
})
</script>

<template lang="pug">
div
  .flex.items-center.py-2.px-4.space-x-5(
    v-for="(item, menuId) in items"
    :key="menuId"
    v-if="checkIsShow(item)"
    :class="getClassNames(menuId)"
    @click="onClick(menuId)"
  )
    .text-xl.text-neutral-400(:class="item.icon")
    .text-sm.text-neutral-400 {{ item.name }}
</template>
