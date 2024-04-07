<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategories'

defineProps<{
  isShow: boolean
  isAllowSelectParentCategory?: boolean
}>()

const emit = defineEmits<{
  onSelected: [id: CategoryId]
  onClose: []
}>()

const categoriesStore = useCategoriesStore()

const categorySelector = ref<{
  parentId: CategoryId | null
  select: (id: CategoryId, isForce: boolean) => void
  closeChild: () => void
}>({
      parentId: null,
      select: (id: CategoryId, isForce: boolean) => {
        if (!isForce && categoriesStore.isCategoryHasChildren(id)) {
          categorySelector.value.parentId = id
          return
        }

        emit('onSelected', id)
        categorySelector.value.closeChild()
        emit('onClose')
      },
      closeChild: () => {
        categorySelector.value.parentId = null
      },
    })

function onSelectCategory(id: CategoryId) {
  console.log('onSelectCategory', id)
  emit('onSelected', id)
  emit('onClose')
}
</script>

<template lang="pug">
div
  //- Root Categories
  TrnFormModal(
    v-if="isShow"
    @closed="emit('onClose')"
  )
    template(#header)
      div {{ $t('categories.title') }}

    .pb-3.px-3
      CategoriesList(
        :ids="categoriesStore.categoriesRootIds"
        class="!gap-x-1"
        @click="categorySelector.select"
        @onClickIcon="onSelectCategory"
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
