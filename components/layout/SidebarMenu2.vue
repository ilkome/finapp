<script setup lang="ts">
import useMenuData from '~/components/menu/useMenuData'
import { getStyles } from '~/components/ui/classes'

const { items, onClick, checkIsActive } = useMenuData()
</script>

<template>
  <div class="grid gap-3 pt-2 pl-1">
    <div
      v-for="(item, menuId) in items"
      :key="menuId"
      :class="[
        ...getStyles('item', ['link', 'bg', 'rounded', 'padding1']),
        {
          '!text-primary': checkIsActive(menuId),
        }]"
      @click="onClick(menuId)"
    >
      <Component :is="item.component" v-if="item.component" class="h-5 w-5" />
      <div v-else class="text-lg leading-none" :class="item.icon" />
    </div>
  </div>
</template>
