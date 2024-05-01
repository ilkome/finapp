<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import type { CategoryId } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { getDates } from '~/components/date/format'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import { getTrnsIds } from '~/components/trns/getTrns'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import type { WalletId } from '~/components/wallets/types'

const props = defineProps<{
  slider: {
    slideTo: object
  }
}>()

const { $i18n } = useNuxtApp()
const $trnForm = useTrnFormStore()
const categoriesStore = useCategoriesStore()
const trnsStore = useTrnsStore()

const filterBy = ref('wallet')
const periodGrouped = useStorage('trnForm', 'all')

const trnsIds = computed(() => {
  const trnsItems = trnsStore.items
  const walletsIds: WalletId[] = []
  let categoriesIds: CategoryId[] = []
  let dates = false

  if (periodGrouped.value === 'period')
    dates = getDates('day', $trnForm.values.date)

  if (filterBy.value === 'wallet' && $trnForm.values.walletId)
    walletsIds.push($trnForm.values.walletId)

  if (filterBy.value === 'walletAndCategory') {
    const categoryId = $trnForm.values.categoryId!
    const childIds = categoriesStore.getChildCategoriesIds(categoryId)
    categoriesIds = childIds.length > 0 ? childIds : [categoryId]
  }

  return getTrnsIds({
    categoriesIds,
    dates,
    trnsItems,
    walletsIds,
  })
})

function changeFilter(value) {
  const trnForm = document.querySelector('.trnForm')
  const trnsListScroll = trnForm?.querySelector('.js-scroll-trns')
  if (trnsListScroll?.scrollTop)
    trnsListScroll.scrollTop = 0

  filterBy.value = value
}

function onClickEdit() {
  props.slider?.slideTo(1)
}

const tabs = computed(() => [
  {
    id: 'wallet',
    name: $i18n.t('trnForm.filterWallet'),
  },
  {
    id: 'walletAndCategory',
    name: $i18n.t('trnForm.filterWalletAndCategory'),
  },
  {
    id: 'all',
    name: $i18n.t('trnForm.filterAll'),
  },
])
</script>

<template>
  <div class="grid h-full grid-rows-[1fr,auto] overflow-hidden">
    <TrnsListWithControl
      :defaultFilterTrnsPeriod="periodGrouped"
      :size="10"
      :trnsIds="trnsIds"
      class="grow"
      isFilterByDay
      isShowGroupSum
      @onChangePeriod="(v) => (periodGrouped = v)"
      @onClickEdit="onClickEdit"
    >
      <template #contentBefore>
        <TrnFormDate class="pb-0" />
      </template>
    </TrnsListWithControl>

    <div class="pb-2 pt-2">
      <UiTabs3>
        <UiTabsItem3
          v-for="tab in tabs"
          :key="tab.id"
          :isActive="tab.id === filterBy"
          @click="changeFilter(tab.id)"
        >
          {{ tab.name }}
        </UiTabsItem3>
      </UiTabs3>
    </div>
  </div>
</template>
