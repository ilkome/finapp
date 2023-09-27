<script setup lang="ts">
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import type { CategoryId } from '~~/components/trns/types'

const { $store } = useNuxtApp()
const $trnForm = useTrnFormStore()

const childSelected = ref(false)

const id = computed(() => $store.state.trnForm.showModalCategoryId)
const category = computed(() => $store.state.categories.items[id.value])
const childCategoriesIds = computed(() => $store.getters['categories/getChildCategoriesIds'](id.value))

function handleCategoryClick(categoryId: CategoryId, close: any) {
  childSelected.value = true
  $trnForm.values.categoryId = categoryId
  close()
}

function afterClose() {
  if (childSelected.value)
    $store.commit('trnForm/closeTrnFormModal', 'categories')

  $store.commit('trnForm/closeTrnFormModal', 'categoriesChild')
  $store.commit('trnForm/setTrnFormModalCategoryId', null)
}
</script>

<template lang="pug">
TrnFormModal(@closed="afterClose")
  template(#header)
    template {{ $t('categories.title') }}

  template(#default="{ close }")
    template(v-if="id && category")
      .pb-3.px-3
        CategoriesList(
          :ids="childCategoriesIds"
          class="!gap-x-1"
          @click="catId => handleCategoryClick(catId, close)"
        )
</template>
