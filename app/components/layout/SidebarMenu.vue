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
    <UTooltip
      v-for="(item, menuId) in items"
      :key="menuId"
      :disabled="!item.tooltip"
      :text="item.tooltip?.text"
      :kbds="item.tooltip?.kbds"
    >
      <LayoutSidebarMenuItem
        :item
        :menuId
        :isShowText
      />
    </UTooltip>
  </div>
</template>
