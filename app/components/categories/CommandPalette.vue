<script setup lang="ts">
import type { CommandPaletteItem } from '@nuxt/ui'

import type { CategoryId, CategoryItemWithId } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

type CategoryCommandPaletteItem = CommandPaletteItem & CategoryItemWithId

const props = defineProps<{
  activeItemId?: CategoryId
  hide?: () => void
}>()

const emit = defineEmits<{
  selected: [id: CategoryId]
}>()

const { t } = useI18n()
const categoriesStore = useCategoriesStore()

const cats = computed(() => {
  const adjustmentCategory = categoriesStore.items.adjustment!
  const adjustmentGroup = {
    ...adjustmentCategory,
    id: 'adjustment',
    items: [{
      id: 'adjustment',
      ...adjustmentCategory,
      suffix: adjustmentCategory.name,
    }],
    slot: 'category',
  }

  const rootGroups = categoriesStore.categoriesRootIds.map((id) => {
    const category = categoriesStore.items[id]!

    const children = categoriesStore.getChildrenIds(id)
    const items = children.length
      ? children.map(childId => ({
          id: childId,
          ...categoriesStore.items[childId],
          suffix: category.name,
        }))
      : [{
          id,
          ...category,
          suffix: category.name,
        }]

    return {
      ...category,
      id,
      items,
      slot: 'category',
    }
  })

  return [adjustmentGroup, ...rootGroups]
})

function onSelect(item: CategoryCommandPaletteItem) {
  emit('selected', item.id)
  if (props.hide)
    props.hide()
}
</script>

<template>
  <!-- @vue-ignore -->
  <UCommandPalette
    :placeholder="t('categories.search.placeholder')"
    :groups="cats"
    labelKey="name"
    @update:modelValue="onSelect"
  >
    <template #category="{ item: rawItem }">
      <div
        class="flex w-full items-center gap-3"
        :class="{ 'text-primary': (rawItem as CategoryCommandPaletteItem).id === props.activeItemId }"
      >
        <UiIconBase
          :color="(rawItem as CategoryCommandPaletteItem).color"
          :name="(rawItem as CategoryCommandPaletteItem).icon"
          invert
        />
        <CategoriesName
          :category="(rawItem as CategoryCommandPaletteItem)"
        />
      </div>
    </template>
  </UCommandPalette>
</template>
