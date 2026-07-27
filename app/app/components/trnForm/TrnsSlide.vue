<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

import { useStorage } from '@vueuse/core'
import { getEndOf, getStartOf } from '~~/utils/date/period'

import type { CategoryId } from '~/components/categories/types'
import type { WalletId } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = defineProps<{
  mainSlideIdx: number
  slider?: {
    slideTo: (index: number, speed?: number) => void
  } | null
}>()

const { t } = useI18n()
const trnsFormStore = useTrnsFormStore()
const categoriesStore = useCategoriesStore()
const trnsStore = useTrnsStore()

type FilterBy = 'wallet' | 'all' | 'walletAndCategory'
const filterBy = useStorage<FilterBy>('filterBy', 'wallet')

const trnsIds = computed(() => {
  const walletsIds: WalletId[] = []
  let categoriesIds: CategoryId[] = []
  const filterDate = new Date(trnsFormStore.values.date)
  const dates = { end: getEndOf(filterDate, 'day').getTime(), start: getStartOf(filterDate, 'day').getTime() }

  if (filterBy.value === 'wallet' && trnsFormStore.values.walletId)
    walletsIds.push(trnsFormStore.values.walletId)

  if (filterBy.value === 'walletAndCategory') {
    if (trnsFormStore.values.walletId)
      walletsIds.push(trnsFormStore.values.walletId)

    if (trnsFormStore.values.categoryId)
      categoriesIds = categoriesStore.getChildrenIdsOrParent(trnsFormStore.values.categoryId)
  }

  return trnsStore.getStoreTrnsIds({
    categoriesIds,
    dates,
    sort: true,
    walletsIds,
  })
})

function changeFilter(value: FilterBy) {
  filterBy.value = value
}

function onClickTransaction() {
  props.slider?.slideTo(props.mainSlideIdx, 0)
}

const tabItems = computed<TabsItem[]>(() => [
  { label: t('trnForm.filterAll'), value: 'all' },
  { label: t('trnForm.filterWallet'), value: 'wallet' },
  { label: t('trnForm.filterWalletAndCategory'), value: 'walletAndCategory' },
])
</script>

<template>
  <div class="grid-rows-[1fr_auto] gap-2">
    <TrnsList
      :trnsIds="trnsIds"
      isShowDates
      isShowExpense
      isShowFilterByDesc
      isShowGroupSum
      isShowIncome
      isShowTransfers
      @click="onClickTransaction"
    >
      <template #contentBefore>
        <div class="pb-2">
          <TrnFormDate />
        </div>

        <UTabs

          :content="false"
          class="mb-4"
          :items="tabItems"
          :modelValue="filterBy"
          @update:modelValue="(v) => changeFilter(v as FilterBy)"
        />
      </template>
    </TrnsList>
  </div>
</template>
