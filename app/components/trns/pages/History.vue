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
      <template #actions>
        <FilterSelector
          class="flex gap-1"
          isShowCategories
          isShowWallets
        />
      </template>

      <template v-if="filter.isShow.value" #selected>
        <FilterSelected
          class="bg-foreground-3 sticky top-[40px] z-20"
          isShowCategories
          isShowWallets
        />
      </template>
    </UiHeader>

    <div class="pageWrapper pt-3">
      <div class="grid gap-3">
        <TrnsList
          :trnsIds
          isShowDates
          isShowExpense
          isShowFilterByDesc
          isShowFilterByType
          isShowGroupSum
          isShowHeader
          isShowIncome
          isShowTransfers
        />
      </div>
    </div>
  </UiPage>
</template>
