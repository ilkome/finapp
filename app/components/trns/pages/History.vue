<script setup lang="ts">
import { useFilter } from '~/components/filter/useFilter'

const { t } = useI18n()
const filter = useFilter()

useHead({
  title: t('trns.history'),
})

const trnsIds = computed(() => filter.getTrnsIdsWithFilter())

provide('filter', filter)
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
