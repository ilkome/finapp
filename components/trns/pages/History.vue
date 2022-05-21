<script setup lang="ts">
import { getCategoriesIds } from '~/components/categories/getCategories'
import { getTrnsIds } from '~/components/trns/getTrns'
import useStatPage from '~/components/stat/useStatPage'

const { $store } = useNuxtApp()
const { statPage } = useStatPage()
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

<script lang="ts">
export default defineComponent({
  head() {
    return {
      title: this.$t('trns.history'),
    }
  },
})
</script>

<template lang="pug">
.h-full.overflow.overflow-x-auto
  .py-6.px-3.font-nunito.text-neutral-800.dark_text-white.text-2xl.leading-none.font-semibold
    | {{ $t('trns.history') }}

  .px-3
    .pb-8(v-if="statPage.filter.isShow")
      LazyStatFilter

    //- History
    TrnsHistory(
      :trnsIds="trnsIds"
      :trnType="filterTrnType"
      @setFilterTrnType="value => filterTrnType = value"
    )
</template>
