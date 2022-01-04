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
  .flex.items-center.py-3.px-6.space-x-5(
    v-for="(item, menuId) in items"
    :key="menuId"
    v-if="checkIsShow(item)"
    class="hocus:bg-neutral-800"
    @click="onClick(menuId)"
  )
    .text-xl.text-neutral-400(:class="[item.icon, { 'text-neutral-200': checkIsActive(menuId) }]")
    .text-sm.text-neutral-400(:class="{'text-neutral-200': checkIsActive(menuId)}") {{ item.name }}

  .flex.items-center.py-3.px-6.space-x-5(
    class="hocus:bg-neutral-800"
    @click="$store.dispatch('ui/changeTheme')"
  )
    .text-xl.text-neutral-400.mdi.mdi-palette
    .text-sm.text-neutral-400 {{ $t('theme.change') }}
</template>
