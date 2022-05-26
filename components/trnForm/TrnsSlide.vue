<script setup lang="ts">
import { getTrnsIds } from '~/components/trns/getTrns'

const props = defineProps<{
  slider: object
}>()
const emit = defineEmits(['onClickEdit'])

const { $store } = useNuxtApp()

const filterBy = ref('wallet')

const filteredTrnsIds = computed(() => {
  const trnsItems = $store.state.trns.items

  const filter = {
    walletsIds: null,
    categoriesIds: null,
  }

  if (filterBy.value === 'wallet') {
    filter.walletsIds = [$store.state.trnForm.values.walletId]
  }
  else if (filterBy.value === 'walletAndCategory') {
    const catId = $store.state.trnForm.values.categoryId
    const category = $store.state.categories.items[catId]

    filter.walletsIds = [$store.state.trnForm.values.walletId]
    filter.categoriesIds = category?.childIds ?? [catId]
  }

  return getTrnsIds({ ...filter, trnsItems })
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
</script>

<template lang="pug">
.contentWrap
  template(v-if="filteredTrnsIds.length === 0")
    .contentWrap__box.trnsListScroll.scrollerBlock
      .containerWrap No transactions

  template(v-if="filteredTrnsIds.length > 0")
    .contentWrap__box.trnsListScroll.scrollerBlock
      .scrollBlock
        .pt-5
          .subTitle.text-center.pb-1.text-xs {{ $t('trns.history') }}

        .px-3
          TrnsListWithControl(
            :trnsIds="filteredTrnsIds"
            trnsClassNames=""
            @onClickEdit="onClickEdit"
          )

    .pt-2.pb-6.px-3
      UiTabs
        UiTabsItem(
          :isActive="filterBy === 'wallet'"
          @click="changeFilter('wallet')"
        ) {{ $t('trnForm.filterWallet') }}

        UiTabsItem(
          :isActive="filterBy === 'walletAndCategory'"
          @click="changeFilter('walletAndCategory')"
        ) {{ $t('trnForm.filterWalletAndCategory') }}

        UiTabsItem(
          :isActive="filterBy === 'all'"
          @click="changeFilter('all')"
        ) {{ $t('trnForm.filterAll') }}
</template>

<style lang="stylus" scoped>
.containerWrap
  display flex
  align-items center
  justify-content center
  height 100%
  min-height 100%
  padding $m10 $m7
  color var(--c-font-3)
  font-size 26px
  font-weight 700
  text-align center
  fontFamilyNunito()

.contentWrap
  position relative
  display grid
  grid-template-rows 1fr auto
  height 100%

  &__box
    overflow hidden
    overflow-y auto
    scrollbar()

.subTitle
  color var(--c-font-4)
  letter-spacing 0
  font-weight 600
  text-transform uppercase
</style>
