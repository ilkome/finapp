<script setup lang="ts">
import useMenuData from '~/components/layout/useMenuData'

const { itemsBottom } = useMenuData()
</script>

<template>
  <div
    class="sm:bottom-inherit bg-foreground-3/80 absolute bottom-0 left-0 z-20 mx-auto flex w-full items-stretch backdrop-blur sm:hidden lg:hidden"
  >
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
