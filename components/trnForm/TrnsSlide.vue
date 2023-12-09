<script setup lang="ts">
import { getTrnsIds } from '~/components/trns/getTrns'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import type { WalletId } from '~/components/wallets/types'

const props = defineProps<{
  slider: {
    slideTo: object
  }
}>()

const { $store, nuxt2Context: { i18n } } = useNuxtApp()
const $trnForm = useTrnFormStore()
const filterBy = ref('wallet')

const trnsIds = computed(() => {
  const trnsItems = $store.state.trns.items
  const walletsIds: WalletId[] = []
  if ($trnForm.values.walletId)
    walletsIds.push($trnForm.values.walletId)

  if (filterBy.value === 'wallet')
    return getTrnsIds({ walletsIds, trnsItems })

  if (filterBy.value === 'walletAndCategory') {
    const categoryId = $trnForm.values.categoryId
    const childIds = $store.getters['categories/getChildCategoriesIds'](categoryId)
    const categoriesIds = childIds.length > 0 ? childIds : [categoryId]

    return getTrnsIds({ walletsIds, categoriesIds, trnsItems })
  }

  return getTrnsIds({ trnsItems })
})

function changeFilter(value) {
  const trnForm = document.querySelector('.trnForm')
  const trnsListScroll = trnForm?.querySelector('.trnsListScroll')
  if (trnsListScroll?.scrollTop)
    trnsListScroll.scrollTop = 0

  filterBy.value = value
}

function onClickEdit() {
  props.slider?.slideTo(1)
}

const tabs = computed(() => [{
  id: 'wallet',
  name: i18n.t('trnForm.filterWallet'),
}, {
  id: 'walletAndCategory',
  name: i18n.t('trnForm.filterWalletAndCategory'),
}, {
  id: 'all',
  name: i18n.t('trnForm.filterAll'),
}])
</script>

<template lang="pug">
.h-full.overflow-hidden.grid.trnsListScroll.pt-4(
  class="grid-rows-[1fr_auto]"
)
  TrnsListWithControl(
    :trnsIds="trnsIds"
    trnsClassNames=""
    @onClickEdit="onClickEdit"
  )

  .pt-2.pb-2.px-2(v-if="trnsIds.length > 0")
    UiTabs
      UiTabsItem(
        v-for="tab in tabs"
        :key="tab.id"
        :isActive="tab.id === filterBy"
        @click="changeFilter(tab.id)"
      ) {{ tab.name }}
</template>

<style lang="stylus">
.scroll
  scrollbar()
</style>
