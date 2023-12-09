<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'

const { $store } = useNuxtApp()
const route = useRoute()
const router = useRouter()

// TODO: Is category is not exist?
const catsIds = computed(() =>
  (Array.isArray(route.query.cats)
    ? route.query.cats
    : [route.query.cats])
    .filter(id => !!$store.state.categories.items[id]),
)

function hasParent(id: CategoryId) {
  // if ($store.state.categories.items[id].parentId)
  // cats = catsIds.value.filter(i => i !== id)
}

function addStatCategory(id: CategoryId) {
  router.push({
    path: 'stat',
    query: { cats: [...catsIds.value.filter(i => i !== id), id] },
  })
}

function onRemoveCategory(id: CategoryId) {
  router.push({
    path: 'stat',
    query: { cats: [...catsIds.value.filter(i => i !== id)] },
  })
}

const isShowCategorySelector = ref(false)
</script>

<template lang="pug">
.p-3
  FilterRow
    template(#add)
      FilterAddItem(
        :isShowText="catsIds.length === 0"
        @click="isShowCategorySelector = true"
      )
    template(#content)
      FilterCategoryItem(
        v-for="categoryId in catsIds"
        :key="categoryId"
        :categoryId="categoryId"
        @click="onRemoveCategory"
      )

  CategoriesSelector(
    :isShow="isShowCategorySelector"
    isAllowSelectParentCategory
    @show="value => isShowCategorySelector = value"
    @onSelected="addStatCategory"
  )
</template>
