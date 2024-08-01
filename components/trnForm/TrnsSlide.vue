<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import type { CategoryId } from '~/components/categories/types'
import type { WalletId } from '~/components/wallets/types'
import { getDates } from '~/components/date/format'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = defineProps<{
  slider?: {
    slideTo: object | null
  }
}>()

const { $i18n } = useNuxtApp()
const trnFormStore = useTrnFormStore()
const categoriesStore = useCategoriesStore()
const trnsStore = useTrnsStore()

const filterBy = useStorage('filterBy', 'wallet')
const periodGrouped = useStorage('trnForm', 'all')

const trnsIds = computed(() => {
  const walletsIds: WalletId[] = []
  let categoriesIds: CategoryId[] = []
  const dates = getDates('day', trnFormStore.values.date)

  if (filterBy.value === 'wallet' && trnFormStore.values.walletId)
    walletsIds.push(trnFormStore.values.walletId)

  if (filterBy.value === 'walletAndCategory') {
    if (trnFormStore.values.walletId)
      walletsIds.push(trnFormStore.values.walletId)

    categoriesIds = categoriesStore.getChildsIdsOrParent(trnFormStore.values.categoryId!)
  }

  return trnsStore.getStoreTrnsIds({
    categoriesIds,
    dates,
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
    id: 'all',
    name: $i18n.t('trnForm.filterAll'),
  },
  {
    id: 'wallet',
    name: $i18n.t('trnForm.filterWallet'),
  },
  {
    id: 'walletAndCategory',
    name: $i18n.t('trnForm.filterWalletAndCategory'),
  },
])
</script>

<template>
  <div class="grid gap-2 sm:max-w-sm h-full grid-rows-[1fr,auto] overflow-hidden">
    <TrnsList
      :defaultFilterTrnsPeriod="periodGrouped"
      :trnsIds="trnsIds"
      isShowGroupSum
      isHideDates
      isShowFilterByDesc
      @onClickEdit="onClickEdit"
    >
      <template #contentBefore>
        <TrnFormDate />
        <UiTabs>
          <UiTabsItem
            v-for="tab in tabs"
            :key="tab.id"
            :isActive="tab.id === filterBy"
            @click="changeFilter(tab.id)"
          >
            {{ tab.name }}
          </UiTabsItem>
        </UiTabs>
      </template>
    </TrnsList>
  </div>
</template>
