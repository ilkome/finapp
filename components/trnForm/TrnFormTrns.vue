<script>
import useCalculator from '~/components/trnForm/calculator/useCalculator'

export default {
  name: 'TrnFormTrns',

  props: {
    ui: {
      type: String,
      default: 'history'
    },
    onlyList: {
      type: Boolean,
      default: false
    },
    limit: {
      type: Number,
      default: 0
    },
    categoryId: {
      type: String,
      default: null
    },
    expenses: {
      type: Boolean,
      default: false
    },
    incomes: {
      type: Boolean,
      default: false
    },
    slider: {
      type: Object,
      required: true
    },
    size: {
      type: Number,
      required: false,
      default: 10
    }
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
      if (this.categoryId) {
        trnsIds = trnsIds.filter(trnId => trns[trnId].categoryId === this.categoryId)
      }

      // filter type
      if (this.incomes) { trnsIds = trnsIds.filter(id => trns[id].type === 1) }
      if (this.expenses) { trnsIds = trnsIds.filter(id => trns[id].type === 0) }

      // limit
      if (this.limit > 0) { return trnsIds.slice(0, this.limit) }
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

        if (!trnsList[dayDate]) {
          trnsList[dayDate] = [trnId]
        }
        else {
          trnsList[dayDate].push(trnId)
        }
      }
      return trnsList
    }
  },

  methods: {
    showMoreTrns () {
      this.pageNumber = this.pageNumber + 1
      setTimeout(() => {
        this.slider.update()
        this.slider.slideTo(1, 0)
      }, 100)
    },

    changeFilter (filterBy) {
      this.filterBy = filterBy
      this.pageNumber = 1
      setTimeout(() => {
        this.slider.update()
        this.slider.slideTo(1, 0)
      }, 100)
    },

    onClickEditTrn (id, amount) {
      const { setExpression } = useCalculator()
      setExpression(amount)
      this.slider.slideTo(0)
    }
  }
}
</script>

<template lang="pug">
.trnsList
  .switcherList
    .switcher
      .switcher__content
        .switcher__item._text(@click="changeFilter('wallet')" :class="{ _active: filterBy === 'wallet' }") {{ $t('trnForm.filterWallet') }}
        .switcher__item._text(@click="changeFilter('walletAndCategory')" :class="{ _active: filterBy === 'walletAndCategory' }") {{ $t('trnForm.filterWalletAndCategory') }}
        .switcher__item._text(@click="changeFilter('all')" :class="{ _active: filterBy === 'all' }") {{ $t('trnForm.filterAll') }}

  .container(v-if="trnsIds.length === 0") No transactions

  .trnsList__content
    .trnsList__grid(:class={ _onlyList: onlyList })
      .trnsList__day(v-for="(trnsIds, date) in groupedTrns")
        .trnsList__header: TrnsListDate(:date="date")
        .trnsList__trns
          TrnItem(
            v-for="trnId in trnsIds"
            :isActive="$store.state.trnForm.values.trnId === trnId"
            :category="$store.state.categories.items[$store.state.trns.items[trnId].categoryId]"
            :key="trnId"
            :trn="$store.state.trns.items[trnId]"
            :trnId="trnId"
            :wallet="$store.state.wallets.items[$store.state.trns.items[trnId].walletId]"
            @onClickEdit="(trnId) => onClickEditTrn(trnId, $store.state.trns.items[trnId].amount)"
          )

  .trnsList__pages(v-if="!isShowedAllTrns")
    Button(
      :class="['_text-center _border _inline']"
      :title="$t('trns.more')"
      @onClick="showMoreTrns"
    )
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.container
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

.switcherList
  display flex
  align-items center
  justify-content center
  margin $m7
  margin-bottom (- $m5)
  border-radius 12px

  +media-laptop()
    margin-bottom $m7

.switcher
  position relative
  position sticky
  top 0

  &__content
    display flex
    align-items stretch
    justify-content stretch

  &__item
    display flex
    align-items center
    justify-content center
    text-align center
    border-radius 12px

    +media-hover()
      background var(--c-bg-3)

    &._text
      opacity .6
      min-width 48px
      padding $m5 $m7
      font-size 12px
      border-radius 12px

      &._active
        opacity 1
        background var(--c-bg-1)

    &._icon
      opacity .6
      padding $m6 $m6
      font-size 22px
      border-radius 8px

      &._active
        opacity 1

.trnsList
  padding-bottom 8px

  +media-laptop()
    padding 0

  &__grid
    display grid
    grid-template-rows 1fr
    grid-template-columns 1fr
    grid-column-gap 8px
    grid-row-gap 8px

  &__day
    overflow hidden
    border-bottom 1px solid var(--c-bg-3)
    margin-bottom 16px
    padding-bottom 16px

    &:first-child
      margin-top $m9
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
</style>
