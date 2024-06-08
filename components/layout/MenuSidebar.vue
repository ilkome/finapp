<script setup lang="ts">
import useMenuData from '~/components/layout/useMenuData'

withDefaults(defineProps<{
  isShowTitle?: boolean
}>(), {
  isShowTitle: true,
})

const { items } = useMenuData()
</script>

<template>
  <div class="pb-6 pt-2 px-2">
    <LayoutMenuSidebarItem
      v-for="(item, menuId) in items"
      :key="menuId"
      :item
      :menuId
      :isShowTitle
    />
  </div>
</template>
