<script setup lang="ts">
import { useMenuData } from '~/components/layout/useMenuData'

const { hideKeys, isShowText = true, source = 'items' } = defineProps<{
  hideKeys?: string[]
  isShowText?: boolean
  source?: 'items' | 'itemsModal'
}>()

const { items, itemsModal } = useMenuData()
const menuItems = computed(() => {
  const source_ = source === 'itemsModal' ? itemsModal.value : items.value
  return hideKeys?.length
    ? Object.fromEntries(Object.entries(source_).filter(([key]) => !hideKeys.includes(key)))
    : source_
})
</script>

<template>
  <div>
    <UTooltip
      v-for="(item, menuId) in menuItems"
      :key="menuId"
      :disabled="isShowText && !item.tooltip"
      :text="item.tooltip?.text ?? item.name"
      :kbds="item.tooltip?.kbds"
    >
      <LayoutSidebarMenuItem
        :item
        :menuId
        :isShowText
        :tone="source === 'itemsModal' ? 'toned' : 'muted'"
      />
    </UTooltip>
  </div>
</template>
