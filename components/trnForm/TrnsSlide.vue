<script setup lang="ts">
import { getTrnsIds } from '~/components/trns/getTrns'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const props = defineProps<{
  slider: {
    slideTo: Function
  }
}>()

const { $store, nuxt2Context: { i18n } } = useNuxtApp()
const $trnForm = useTrnFormStore()
const filterBy = ref('wallet')

const filteredTrnsIds = computed(() => {
  const trnsItems = $store.state.trns.items
  const walletsIds = [$trnForm.values.walletId]

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
  const trnsListScroll = trnForm.querySelector('.trnsListScroll')
  trnsListScroll.scrollTop = 0

  filterBy.value = value
  setTimeout(() => {
    props.slider.slideTo(0, 0)
  }, 100)
}

function onClickEdit() {
  props.slider.slideTo(1)
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
.h-full.overflow-hidden.grid.trnsListScroll(
  class="grid-rows-[1fr_auto]"
)
  .h-full.overflow-hidden
    .h-full.overflow-y-auto.pt-5.px-2.scroll.scrollerBlock(
      :class="{ 'grid items-center': filteredTrnsIds.length === 0, 'grid-rows-[1fr_auto]': filteredTrnsIds.length > 0 }"
    )
      TrnsListWithControl(
        :trnsIds="filteredTrnsIds"
        trnsClassNames=""
        @onClickEdit="onClickEdit"
      )

  .pt-2.pb-6.px-3(v-if="filteredTrnsIds.length > 0")
    UiTabs
      UiTabsItem(
        v-for="tab in tabs"
        :key="tab.id"
        :isActive="tab.id === filterBy"
        @click="changeFilter(tab.id)"
      ) {{ tab.name }}
</template>
