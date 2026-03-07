<script setup lang="ts">
import type { CategoryId, CategoryItemWithId } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

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
  const adjustmentCategory = categoriesStore.items.adjustment
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

function onSelect(item: CategoryItemWithId) {
  emit('selected', item.id)
  if (props.hide)
    props.hide()
}
</script>

<template>
  <UCommandPalette
    :placeholder="t('categories.search.placeholder')"
    :groups="cats"
    labelKey="name"
    @update:modelValue="onSelect"
  >
    <template #category="{ item }">
      <UiElement
        :isActive="item.id === props.activeItemId"
        :lineWidth="1"
        class="w-full grow"
        insideClasses="min-h-[46px]"
      >
        <template #leftIcon>
          <UiIconBase
            :color="item.color"
            :name="item.icon"
            invert
          />
        </template>

        <div class="grid grow">
          <CategoriesName
            :category="item"
          />
        </div>
      </UiElement>
    </template>
  </UCommandPalette>
</template>
