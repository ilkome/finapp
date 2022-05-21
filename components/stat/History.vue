<script setup lang="ts">
import { getCategoriesIds } from '~/components/categories/getCategories'
import { getTrnsIds } from '~/components/trns/getTrns'

const { $store } = useNuxtApp()
const categoriesItems = computed(() => $store.state.categories.items)
const trnsItems = computed(() => $store.state.trns.items)
const storeFilter = computed(() => $store.state.filter)
const filterTrnType = ref(null)

const trnsIds = computed(() => {
  // TODO: move it to a separate function getFilterParams
  const categoriesIds = storeFilter.value.catsIds.length > 0
    ? getCategoriesIds(storeFilter.value.catsIds, categoriesItems.value)
    : null
  const walletsIds = storeFilter.value.walletsIds.length > 0
    ? storeFilter.value.walletsIds
    : null

  return getTrnsIds({
    categoriesIds,
    walletsIds,
    trnType: filterTrnType.value,
    trnsItems: trnsItems.value,
  })
})
</script>

<template lang="pug">
.my-4.md_max-w-none(class="max-w-[420px]")
  TrnsHistory(
    :trnsIds="trnsIds"
    :trnType="filterTrnType"
    @setFilterTrnType="value => filterTrnType = value"
  )
</template>
