<script setup lang="ts">
import useMenuData from '~/components/menu/useMenuData'
import { getStyles } from '~/components/ui/classes'

const props = defineProps<{
  variant: 'modal' | 'sidebar'
}>()

const { items, onClick, checkIsActive, checkIsShow } = useMenuData()

function getClasses(menuId: string) {
  const items = props.variant === 'modal'
    ? ['rounded', 'menuModal']
    : ['menuSidebar']

  const cls = getStyles('item', ['link', 'menu', ...items])

  return [
    cls,
    { 'text-slate-900 dark_text-neutral-100': checkIsActive(menuId) },
    { 'text-slate-600 dark_text-neutral-400': !checkIsActive(menuId) },
  ]
}
</script>

<template lang="pug">
div
  div(
    v-for="(item, menuId) in items"
    v-if="checkIsShow(item)"
    :key="menuId"
    :class="getClasses(menuId)"
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
</template>
