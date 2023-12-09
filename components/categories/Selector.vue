<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'

interface CategorySelector {
  parentId: CategoryId | null
  select: (id: CategoryId, isForce: boolean) => void
  closeRoot: () => void
  closeChild: () => void
}

defineProps<{
  isShow: boolean
  isAllowSelectParentCategory: boolean
}>()

const emit = defineEmits<{
  (e: 'onSelected', id: CategoryId): void
  (e: 'show', value: boolean): void
}>()

const { $store } = useNuxtApp()

const categorySelector = ref<CategorySelector>({
  parentId: null,
  select: (id: CategoryId, isForce: boolean) => {
    if (!isForce && $store.getters['categories/isCategoryHasChildren'](id)) {
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
      template {{ $t('categories.title') }}

    template(#default="{ close }")
      .pb-3.px-3
        CategoriesList(
          :ids="$store.getters['categories/categoriesRootIds']"
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
          :background="$store.state.categories.items[categorySelector.parentId].color"
          :icon="$store.state.categories.items[categorySelector.parentId].icon"
          big
          round
        )
        div {{ $store.state.categories.items[categorySelector.parentId].name }}

    template(#default="{ close }")
      .px-3.flex-center.pb-5(v-if="isAllowSelectParentCategory")
        UiButtonGrey.max-w-xs(
          @click="categorySelector.select(categorySelector.parentId, true)"
        ) {{ $t('chart.view.add') }}

      .pb-3.px-3
        CategoriesList(
          :ids="$store.getters['categories/getChildCategoriesIds'](categorySelector.parentId)"
          class="!gap-x-1"
          @click="categorySelector.select"
        )
</template>
