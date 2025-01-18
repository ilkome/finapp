<script setup lang="ts">
import useMenuData from '~/components/layout/useMenuData'

const { itemsBottom } = useMenuData()
</script>

<template>
  <div
    class="sm:bottom-inherit sticky bottom-0 left-0 z-20 mx-auto flex w-full items-stretch bg-item-2/80 backdrop-blur sm:hidden lg:hidden"
    style="padding-bottom: calc(env(safe-area-inset-bottom) - 16px)"
  >
    <LayoutSidebarMenuItem
      v-for="(item, menuId) in itemsBottom"
      :key="menuId"
      :isShowText="false"
      :item
      :menuId
      class="flex-center is-bigger grow"
      position="bottom"
    />
  </div>
</template>
