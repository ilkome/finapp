<script setup lang="ts">
import { useMenuData } from '~/components/layout/useMenuData'

const { isShowText = true, source = 'items' } = defineProps<{
  isShowText?: boolean
  source?: 'items' | 'itemsModal'
}>()

const { items, itemsModal } = useMenuData()
const menuItems = computed(() => source === 'itemsModal' ? itemsModal.value : items.value)
</script>

<template>
  <div>
    <UTooltip
      v-for="(item, menuId) in menuItems"
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
