<script setup lang="ts">
import useMenuData from '~/components/menu/useMenuData'

const { itemsMini } = useMenuData()
</script>

<template>
  <div class="mx-auto flex max-w-xl items-stretch">
    <LayoutMenuSidebarItem
      v-for="(item, menuId) in itemsMini"
      :key="menuId"
      :isShowTitle="false"
      :item
      :menuId
      class="flex-center is-bigger"
      :class="{
        'is-trnForm': menuId === 'trnForm',
      }"
    />
  </div>
</template>
