<script lang="ts">
import { getTrnsIds } from '~/components/trns/getTrns'

export default defineComponent({
  props: {
    categoryId: { type: String, default: null },
    limit: { type: Number, default: 0 },
    size: { type: Number, required: false, default: 10 },
    slider: { type: Object, required: true },
  },

  data() {
    return {
      pageNumber: 1,
      sortByEditDate: false,
      filterBy: 'wallet',
    }
  },

  computed: {
    isShowedAllTrns() {
      return this.paginatedTrnsIds.length === this.trnsIds.length
    },

    paginatedTrnsIds() {
      const end = this.pageNumber * this.size
      return this.trnsIds.slice(0, end)
    },

    trnsIds() {
      const trnsItems = this.$store.state.trns.items

      const filter = {
        walletsIds: null,
        categoriesIds: null,
      }

      if (this.filterBy === 'wallet') {
        filter.walletsIds = [this.$store.state.trnForm.values.walletId]
      }
      else if (this.filterBy === 'walletAndCategory') {
        const catId = this.$store.state.trnForm.values.categoryId
        const category = this.$store.state.categories.items[catId]

        filter.walletsIds = [this.$store.state.trnForm.values.walletId]
        filter.categoriesIds = category?.childIds ? category?.childIds : [catId]
      }

      const trnsIds = getTrnsIds({ ...filter, trnsItems })

      // limit
      if (this.limit > 0) return trnsIds.slice(0, this.limit)
      return trnsIds
    },

    groupedTrns() {
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
    },
  },

  methods: {
    showMoreTrns() {
      this.pageNumber = this.pageNumber + 1
      setTimeout(() => {
        this.slider.update()
        this.slider.slideTo(0, 0)
      }, 100)
    },

    changeFilter(filterBy) {
      const trnForm = document.querySelector('.trnForm')
      const trnsListScroll = trnForm.querySelector('.trnsListScroll')
      trnsListScroll.scrollTop = 0

      this.filterBy = filterBy
      this.pageNumber = 1
      setTimeout(() => {
        this.slider.slideTo(0, 0)
      }, 100)
    },
  },
})
</script>

<template lang="pug">
.contentWrap
  .contentWrap__box.trnsListScroll.scrollerBlock
    .containerWrap(v-if="trnsIds.length === 0") No transactions

    .scrollBlock
      .pt-5
        .subTitle.text-center.pb-1.text-xs {{ $t('trns.history') }}

      .overflow-hidden.mx-3.my-2.rounded-md.bg-gray-50.dark_bg-dark4(
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

      .py-4.pb-6.px-3.flex-center(v-if="!isShowedAllTrns")
        .cursor-pointer.grow.py-3.px-5.flex-center.rounded-full.text-sm.bg-skin-item-main-bg.hocus_bg-skin-item-main-hover(
          class="basis-1/2 max-w-[280px]"
          @click="showMoreTrns"
        ) {{ $t('trns.more') }}

  .pt-2.pb-5.px-3
    .overflow-hidden.rounded-md.items-center.flex.text-xs.text-center.bg-gray-50.dark_bg-dark4.dark_shadow
      .cursor-pointer.px-5.py-3.grow.hocus_bg-gray-200.dark_hocus_bg-neutral-800(
        :class="{ '_active cursor-default text-blue3 dark_text-blue1 bg-gray-100 dark_bg-232323': filterBy === 'wallet' }"
        @click="changeFilter('wallet')"
      ) {{ $t('trnForm.filterWallet') }}

      .cursor-pointer.px-5.py-3.grow.hocus_bg-gray-200.dark_hocus_bg-neutral-800(
        :class="{ '_active cursor-default text-blue3 dark_text-blue1 bg-gray-100 dark_bg-232323': filterBy === 'walletAndCategory' }"
        @click="changeFilter('walletAndCategory')"
      ) {{ $t('trnForm.filterWalletAndCategory') }}

      .cursor-pointer.px-5.py-3.grow.hocus_bg-gray-200.dark_hocus_bg-neutral-800(
        :class="{ '_active cursor-default text-blue3 dark_text-blue1 bg-gray-100 dark_bg-232323': filterBy === 'all' }"
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
  letter-spacing 0px
  font-weight 600
  text-transform uppercase
</style>
