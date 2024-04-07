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
  setCategoryId: (id: CategoryId) => void
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

      setCategoryId: (id: CategoryId) => {
        emit('onSelected', id)
        emit('onClose')
      },
    })
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
        @click="categorySelector.select"
        @onClickIcon="categorySelector.setCategoryId"
      )

  //- Child Categories
  TrnFormModal(
    v-if="categorySelector.parentId"
    @closed="categorySelector.closeChild"
  )
    template(#header)
      .py-3.flex-center.gap-2
        .flex-center.gap-4
          Icon2(
            :categoryId="categorySelector.parentId"
            :color="categoriesStore.items[categorySelector.parentId].color"
            :icon="categoriesStore.items[categorySelector.parentId].icon"
            size="xl"
            @click="categorySelector.select(categorySelector.parentId, true)"
          )
          div {{ categoriesStore.items[categorySelector.parentId].name }}

      .grow.flex-center(v-if="isAllowSelectParentCategory")
        UiButtonGrey.max-w-xs(
          @click="categorySelector.select(categorySelector.parentId, true)"
        ) {{ $t('chart.view.add') }}

    .pb-3.px-3
      CategoriesList(
        :ids="categoriesStore.getChildCategoriesIds(categorySelector.parentId)"
        isHideParentCategory
        @click="categorySelector.select"
        @onClickIcon="categorySelector.setCategoryId"
      )
</template>
