<script setup lang="ts">
import { getCatsIds } from '~/components/categories/getCategories'
import { getTrnsIds } from '~/components/trns/getTrns'
import useStatPage from '~/components/stat/useStatPage'

const { $store } = useNuxtApp()
const { statPage } = useStatPage()
const catsItems = computed(() => $store.state.categories.items)
const trnsItems = computed(() => $store.state.trns.items)
const storeFilter = computed(() => $store.state.filter)
const filterTrnType = ref(null)

const trnsIds = computed(() => {
  const categoriesIds = storeFilter.value.catsIds.length > 0 ? getCatsIds(storeFilter.value.catsIds, catsItems.value) : null
  const walletsIds = storeFilter.value.walletsIds.length > 0 ? storeFilter.value.walletsIds : null

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
