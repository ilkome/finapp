<script>
import useCalculator from '~/components/trnForm/calculator/useCalculator'

export default {
  name: 'TrnFormTrns',

  props: {
    categoryId: { type: String, default: null },
    expenses: { type: Boolean, default: false },
    incomes: { type: Boolean, default: false },
    limit: { type: Number, default: 0 },
    onlyList: { type: Boolean, default: false },
    size: { type: Number, required: false, default: 10 },
    slider: { type: Object, required: true },
    ui: { type: String, default: 'history' }
  },

  data () {
    return {
      pageNumber: 1,
      sortByEditDate: false,
      filterBy: 'wallet'
    }
  },

  computed: {
    isShowedAllTrns () {
      return this.paginatedTrnsIds.length === this.trnsIds.length
    },

    paginatedTrnsIds () {
      const end = this.pageNumber * this.size
      return this.trnsIds.slice(0, end)
    },

    filterTrns () {
      const filter = {}
      if (this.filterBy === 'wallet') {
        filter.walletId = this.$store.state.trnForm.values.walletId
      }
      else if (this.filterBy === 'walletAndCategory') {
        filter.walletId = this.$store.state.trnForm.values.walletId
        filter.categoryId = this.$store.state.trnForm.values.categoryId
      }
      return filter
    },

    trnsIds () {
      const trns = this.$store.state.trns.items
      let trnsIds = this.$store.getters['trns/getTrnsIds']({
        ...this.filterTrns
      })

      // from category
      if (this.categoryId)
        trnsIds = trnsIds.filter(trnId => trns[trnId].categoryId === this.categoryId)

      // filter type
      if (this.incomes) trnsIds = trnsIds.filter(id => trns[id].type === 1)
      if (this.expenses) trnsIds = trnsIds.filter(id => trns[id].type === 0)

      // limit
      if (this.limit > 0) return trnsIds.slice(0, this.limit)
      return trnsIds
    },

    groupedTrns () {
      const trns = this.$store.state.trns.items
      const trnsIds = this.paginatedTrnsIds
      const trnsList = {}

      for (const trnId of trnsIds) {
        let dayDate
        this.sortByEditDate
          ? dayDate = this.$day(trns[trnId].edited).startOf('day').valueOf()
          : dayDate = this.$day(trns[trnId].date).startOf('day').valueOf()

        if (!trnsList[dayDate])
          trnsList[dayDate] = [trnId]

        else
          trnsList[dayDate].push(trnId)
      }
      return trnsList
    }
  },

  methods: {
    showMoreTrns () {
      this.pageNumber = this.pageNumber + 1
      setTimeout(() => {
        this.slider.update()
        this.slider.slideTo(0, 0)
      }, 100)
    },

    changeFilter (filterBy) {
      const trnForm = document.querySelector('.trnForm')
      const trnsListScroll = trnForm.querySelector('.trnsListScroll')
      trnsListScroll.scrollTop = 0

      this.filterBy = filterBy
      this.pageNumber = 1
      setTimeout(() => {
        this.slider.slideTo(0, 0)
      }, 100)
    },

    onClickEditTrn (amount) {
      const { setExpression } = useCalculator()
      setExpression(amount)
      this.slider.slideTo(1)
    }
  }
}
</script>

<template lang="pug">
.contentWrap
  .contentWrap__box.trnsListScroll.scrollerBlock
    .containerWrap(v-if="trnsIds.length === 0") No transactions

    .scrollBlock
      .trnsList__content.pt-2
        .trnsList__day(v-for="(trnsIds, date) in groupedTrns")
          .trnsList__header: TrnsListDate(:date="date")
          .trnsList__trns
            TrnsItemTrnItem(
              v-for="trnId in trnsIds"
              :isActive="$store.state.trnForm.values.trnId === trnId"
              :category="$store.state.categories.items[$store.state.trns.items[trnId].categoryId]"
              :key="trnId"
              :trn="$store.state.trns.items[trnId]"
              :trnId="trnId"
              :wallet="$store.state.wallets.items[$store.state.trns.items[trnId].walletId]"
              @onClickEdit="onClickEditTrn($store.state.trns.items[trnId].amount)"
            )

      .trnsList__pages(v-if="!isShowedAllTrns")
        .button(@click="showMoreTrns") {{ $t('trns.more') }}

  .flex.items-center.justify-center.pt-2.pb-5.px-3
    .overflow-hidden.flex.items-center.bg-4.rounded
      .barItem.px-6.py-3.font5.text-xs(@click="changeFilter('wallet')" :class="{ _active: filterBy === 'wallet' }") {{ $t('trnForm.filterWallet') }}
      .barItem.px-6.py-3.font5.text-xs(@click="changeFilter('walletAndCategory')" :class="{ _active: filterBy === 'walletAndCategory' }") {{ $t('trnForm.filterWalletAndCategory') }}
      .barItem.px-6.py-3.font5.text-xs(@click="changeFilter('all')" :class="{ _active: filterBy === 'all' }") {{ $t('trnForm.filterAll') }}
</template>

<style lang="stylus" scoped>
.button
  button-base-1()

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

.trnsList
  &__day
    overflow hidden
    border-bottom 1px solid var(--c-bg-3)
    margin-bottom 16px
    padding-bottom 16px

    &:first-child
      border-top 0

      +media-laptop()
        margin 0

  &__header
    display flex
    align-items center
    justify-content space-between
    padding 0 $m7
    padding-bottom $m7

  &__trns
    padding 0 $m7

  &__pages
    padding 16px 8px
    padding-top 0

.contentWrap
  position relative
  display grid
  grid-template-rows auto 1fr
  height 100%

  &__box
    overflow hidden
    overflow-y auto
    scrollbar()

.scrollBlock
  padding-top $m6
  padding-bottom $m8

.switcherList
  display flex
  justify-content center
  width 100%
  padding $m6
  padding-top $m8
  background alpha(#171717, .9)

  /.light-mode &
    background var(--c-bg-3)

.menuItem
  cursor pointer
  margin 0 $m5
  padding $m6 $m8
  color var(--c-font-5)
  font-size 12px
  font-weight 500
  font-roboto()
  text-align center
  border 1px solid transparent
  anim()

  &._active
    cursor default
    color var(--c-blue-1)

  +media-hover()
    &:not(._active)
      color var(--c-font-2)
      background var(--c-bg-5)
      border-radius 50px
</style>
