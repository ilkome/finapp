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
  <div class="grid gap-[2px]">
    <LayoutMenuSidebarItem
      v-for="(item, menuId) in items"
      :key="menuId"
      :item
      :menuId
      :isShowTitle
    />
  </div>
</template>
