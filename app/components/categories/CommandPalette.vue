<script setup lang="ts">
import type { CategoryId, CategoryItemWithId } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

const props = defineProps<{
  activeItemId?: CategoryId
  hide?: () => null
}>()

const emit = defineEmits<{
  clickParent: [id: CategoryId]
  close: []
  filter: [id: CategoryId]
  selected: [id: CategoryId]
}>()

const { t } = useI18n()
const categoriesStore = useCategoriesStore()

const cats = computed(() => {
  const adjustmentCategory = categoriesStore.items.adjustment
  const adjustmentGroup = {
    ...adjustmentCategory,
    childIds: undefined,
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

    const items = category?.childIds?.length
      ? categoriesStore.getChildsIds(id).map(childId => ({
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
      childIds: undefined,
      id,
      items,
      slot: 'category',
    }
  })

  return [adjustmentGroup, ...rootGroups]
})

function onSelect(item: CategoryItemWithId) {
  emit('selected', item.id)
  emit('close')
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
            :alt="item.alt"
            :category="item"
          />
        </div>
      </UiElement>
    </template>
  </UCommandPalette>
</template>
