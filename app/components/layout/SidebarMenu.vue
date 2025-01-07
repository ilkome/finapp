<script setup lang="ts">
import useMenuData from '~/components/layout/useMenuData'

withDefaults(defineProps<{
  isShowText?: boolean
}>(), {
  isShowText: true,
})

const { items } = useMenuData()
</script>

<template>
  <div>
    <LayoutSidebarMenuItem
      v-for="(item, menuId) in items"
      :key="menuId"
      :item
      :menuId
      :isShowText
    />
  </div>
</template>
