<script setup lang="ts">
import useMenuData from '~/components/layout/useMenuData'

const { itemsBottom } = useMenuData()
</script>

<template>
  <div class="mx-auto flex items-stretch">
    <LayoutMenuSidebarItem
      v-for="(item, menuId) in itemsBottom"
      :key="menuId"
      :isShowTitle="false"
      :item
      :menuId
      class="flex-center is-bigger grow"
      position="bottom"
    />
  </div>
</template>
