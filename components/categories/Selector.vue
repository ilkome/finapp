<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategories'

interface CategorySelector {
  parentId: CategoryId | null
  select: (id: CategoryId, isForce: boolean) => void
  closeRoot: () => void
  closeChild: () => void
}

defineProps<{
  isShow: boolean
  isAllowSelectParentCategory?: boolean
}>()

const emit = defineEmits<{
  (e: 'onSelected', id: CategoryId): void
  (e: 'show', value: boolean): void
}>()

const categoriesStore = useCategoriesStore()

const categorySelector = ref<CategorySelector>({
  parentId: null,
  select: (id: CategoryId, isForce: boolean) => {
    if (!isForce && categoriesStore.isCategoryHasChildren(id)) {
      categorySelector.value.parentId = id
      return
    }

    emit('onSelected', id)
    categorySelector.value.closeRoot()
    categorySelector.value.closeChild()
  },
  closeRoot: () => {
    emit('show', false)
  },
  closeChild: () => {
    categorySelector.value.parentId = null
  },
})
</script>

<template lang="pug">
div
  //- Root Categories
  TrnFormModal(
    v-if="isShow"
    @closed="categorySelector.closeRoot"
  )
    template(#header)
      div {{ $t('categories.title') }}

    template(#default="{ close }")
      .pb-3.px-3
        CategoriesList(
          :ids="categoriesStore.categoriesRootIds"
          class="!gap-x-1"
          @click="categorySelector.select"
        )

  //- Child Categories
  TrnFormModal(
    v-if="categorySelector.parentId"
    @closed="categorySelector.closeChild"
  )
    template(#header)
      .pt-3.flex-col.flex-center.gap-2.text-center
        Icon(
          :background="categoriesStore.items[categorySelector.parentId].color"
          :icon="categoriesStore.items[categorySelector.parentId].icon"
          big
          round
        )
        div {{ categoriesStore.items[categorySelector.parentId].name }}

    template(#default="{ close }")
      .px-3.flex-center.pb-5(v-if="isAllowSelectParentCategory")
        UiButtonGrey.max-w-xs(
          @click="categorySelector.select(categorySelector.parentId, true)"
        ) {{ $t('chart.view.add') }}

      .pb-3.px-3
        CategoriesList(
          :ids="categoriesStore.getChildCategoriesIds(categorySelector.parentId)"
          class="!gap-x-1"
          @click="categorySelector.select"
        )
</template>
