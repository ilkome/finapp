<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import type { CategoryId } from '~/components/categories/types'
import type { WalletId } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useDateFormats } from '~/components/date/useDateFormats'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = defineProps<{
  mainSlideIdx: number
  slider?: {
    slideTo: object | null
  }
}>()

const { t } = useI18n()
const { getDates } = useDateFormats()
const trnsFormStore = useTrnsFormStore()
const categoriesStore = useCategoriesStore()
const trnsStore = useTrnsStore()

type FilterBy = 'wallet' | 'all' | 'walletAndCategory'
const filterBy = useStorage<FilterBy>('filterBy', 'wallet')

const trnsIds = computed(() => {
  const walletsIds: WalletId[] = []
  let categoriesIds: CategoryId[] = []
  const dates = getDates('day', trnsFormStore.values.date)

  if (filterBy.value === 'wallet' && trnsFormStore.values.walletId)
    walletsIds.push(trnsFormStore.values.walletId)

  if (filterBy.value === 'walletAndCategory') {
    if (trnsFormStore.values.walletId)
      walletsIds.push(trnsFormStore.values.walletId)

    categoriesIds = categoriesStore.getChildsIdsOrParent(trnsFormStore.values.categoryId!)
  }

  return trnsStore.getStoreTrnsIds({
    categoriesIds,
    dates,
    walletsIds,
  })
})

function changeFilter(value: FilterBy) {
  filterBy.value = value
}

function onClickTransaction() {
  props.slider?.slideTo(props.mainSlideIdx)
}

const tabs = computed<{ id: FilterBy, name: string }[]>(() => [
  {
    id: 'all',
    name: t('trnForm.filterAll'),
  },
  {
    id: 'wallet',
    name: t('trnForm.filterWallet'),
  },
  {
    id: 'walletAndCategory',
    name: t('trnForm.filterWalletAndCategory'),
  },
])
</script>

<template>
  <div class="grid-rows-[1fr_auto] gap-2">
    <TrnsList
      :trnsIds="trnsIds"
      isHideDates
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

        <UiTabs1 class="mb-4">
          <UiTabsItem1
            v-for="tab in tabs"
            :key="tab.id"
            class="text-xs whitespace-nowrap"
            :isActive="tab.id === filterBy"
            @click="changeFilter(tab.id)"
          >
            {{ tab.name }}
          </UiTabsItem1>
        </UiTabs1>
      </template>
    </TrnsList>
  </div>
</template>
