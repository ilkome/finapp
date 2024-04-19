<script setup lang="ts">
import useMenuData from '~/components/menu/useMenuData'

withDefaults(defineProps<{
  isShowTitle?: boolean
}>(), {
  isShowTitle: true,
})

const { items } = useMenuData()
</script>

<template>
  <div>
    <LayoutMenuSidebarItem
      v-for="(item, menuId) in items"
      :key="menuId"
      :item
      :menuId
      :isShowTitle
    />
  </div>
</template>
