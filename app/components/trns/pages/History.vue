<script setup lang="ts">
import { useFilter } from '~/components/filter/useFilter'
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
</script>

<template>
  <UiPage>
    <UiHeader>
      <UiHeaderTitle>{{ t("trns.history") }}</UiHeaderTitle>
    </UiHeader>

    <div class="pageWrapper">
      <div class="grid gap-3">
        <FilterSelector
          class="flex gap-1"
          isShowCategories
          isShowWallets
        />
        <FilterSelected
          isShowCategories
          isShowWallets
        />

        <TrnsList
          :trnsIds
          isShowHeader
          isShowGroupSum
          isShowIncome
          isShowExpense
          isShowFilterByType
          isShowFilterByDesc
          isShowTransfers
        />
      </div>
    </div>
  </UiPage>
</template>
