<script setup lang="ts">
import useMenuData from '~/components/menu/useMenuData'
import { getStyles } from '~/components/ui/classes'

const props = defineProps<{
  variant: 'modal' | 'sidebar'
}>()

const { items, onClick, checkIsActive } = useMenuData()

function getClasses(menuId: string) {
  const items
    = props.variant === 'modal' ? ['rounded', 'menuModal'] : ['menuSidebar']

  const cls = getStyles('item', ['link', 'menu', ...items])

  return [
    cls,
    { '!text-primary': checkIsActive(menuId) },
  ]
}
</script>

<template>
  <div>
    <div
      v-for="(item, menuId) in items"
      :key="menuId"
      :class="getClasses(menuId)"
      @click="onClick(menuId)"
    >
      <Component :is="item.component" v-if="item.component" class="h-6 w-6" />
      <div v-else class="text-xl" :class="item.icon" />
      <div class="text-sm">
        {{ item.name }}
      </div>
    </div>
  </div>
</template>
