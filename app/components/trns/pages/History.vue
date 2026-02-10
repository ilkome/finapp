<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import type { CategoryId } from '~/components/categories/types'
import type { WalletId } from '~/components/wallets/types'

import { useFilter } from '~/components/stat/filter/useFilter'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const { t } = useI18n()
const filter = useFilter()
const trnsStore = useTrnsStore()
provide('filter', filter)

useHead({
  title: t('trns.history'),
})

const trnsIds = computed(() => trnsStore.getStoreTrnsIds({
  categoriesIds: filter.categoriesIds.value,
  walletsIds: filter.walletsIds.value,
}, {
  includesChildCategories: true,
}))

const lastFilter = useStorage<{
  categoriesIds: CategoryId[]
  walletsIds: WalletId[]
}>('finapp.history.lastFilter2', {
  categoriesIds: [],
  walletsIds: [],
}, localStorage, {
  mergeDefaults: true,
})

onMounted(() => {
  filter.setCategories(lastFilter.value.categoriesIds ?? [])
  filter.setWallets(lastFilter.value.walletsIds ?? [])
})

watch([filter.categoriesIds, filter.walletsIds], () => {
  lastFilter.value.categoriesIds = filter.categoriesIds.value
  lastFilter.value.walletsIds = filter.walletsIds.value
})
</script>

<template>
  <UiPage>
    <UiHeader>
      <UiHeaderTitle>{{ t('trns.history') }}</UiHeaderTitle>
      <template #actions>
        <StatFilterSelector
          class="flex gap-1"
          isShowCategories
          isShowWallets
        />
      </template>

      <template v-if="filter.isShow.value" #selected>
        <StatFilterSelected
          class="pb-2"
          isShowCategories
          isShowWallets
        />
      </template>
    </UiHeader>

    <div class="pageWrapper bg-default mb-4 rounded-xl pt-1 pb-4">
      <div class="grid gap-3 @3xl/main:max-w-md">
        <TrnsList
          :trnsIds
          isShowDates
          isShowExpense
          isShowFilterByDesc
          isShowFilterByType
          isShowGroupSum
          isShowIncome
          isShowTransfers
        />
      </div>
    </div>
  </UiPage>
</template>
