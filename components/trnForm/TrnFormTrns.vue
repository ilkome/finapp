<script lang="ts">
export default defineComponent({
  props: {
    categoryId: { type: String, default: null },
    limit: { type: Number, default: 0 },
    size: { type: Number, required: false, default: 10 },
    slider: { type: Object, required: true }
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
    }
  }
})
</script>

<template lang="pug">
.contentWrap
  .contentWrap__box.trnsListScroll.scrollerBlock
    .containerWrap(v-if="trnsIds.length === 0") No transactions

    .scrollBlock
      .m-3.overflow-hidden.rounded-md.bg-dark4(
        v-for="(trnsIds, date) in groupedTrns"
        :key="date"
      )
        .pt-4
          .pb-2.px-3
            TrnsListDate(:date="date")

          .overflow-hidden.rounded-md
            TrnsItemHistory.py-3.px-2.rounded-md(
              v-for="trnId in trnsIds"
              :key="trnId"
              :slider="slider"
              :trnId="trnId"
            )

      .pages(v-if="!isShowedAllTrns")
        .button(@click="showMoreTrns") {{ $t('trns.more') }}

  .pt-2.pb-5.px-3.justify-center.flex
    .overflow-hidden.bg-dark4.rounded-md.justify-center.items-center.flex
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

.pages
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
</style>
