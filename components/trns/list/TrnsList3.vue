<script>
export default {
  name: 'TrnsList3',

  props: {
    ui: {
      type: String,
      default: 'history'
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
    size: {
      type: Number,
      default: 30
    },
    showCategory: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      pageNumber: 1,
      sortByEditDate: false
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

    trnsIds () {
      const trns = this.$store.state.trns.items
      let trnsIds = this.$store.getters['trns/selectedTrnsIdsWithDate']

      // from category
      if (this.categoryId) {
        const categoriesIds = this.$store.getters['categories/categoriesIds']
        const categories = this.$store.state.categories.items
        const childCategoriesIds = categoriesIds.filter(id => categories[id].parentId === this.categoryId)
        if (childCategoriesIds.length) {
          trnsIds = trnsIds.filter((trnId) => {
            const trnCategoryId = trns[trnId].categoryId
            for (const categoryId of childCategoriesIds) {
              if (trnCategoryId === categoryId) { return true }
            }
            return false
          })
        }
        else {
          trnsIds = trnsIds.filter(trnId => trns[trnId].categoryId === this.categoryId)
        }
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
    }
  }
}
</script>

<template lang="pug">
.trnsList
  .trnsList__content
    template(v-if="trnsIds.length > 0")
      //- history view
      template(v-if="ui === 'history'")
        .trnsList__grid
          .trnsList__day(v-for="(trnsIds, date) in groupedTrns")
            .trnsList__header: TrnsListDate(:date="date")
            .trnsList__trns
              TrnsItemTrnItem.item(
                v-for="trnId in trnsIds"
                :category="$store.state.categories.items[$store.state.trns.items[trnId].categoryId]"
                :key="trnId"
                :trn="$store.state.trns.items[trnId]"
                :trnId="trnId"
                :wallet="$store.state.wallets.items[$store.state.trns.items[trnId].walletId]"
              )

      //- stat view
      template(v-else)
        template(v-for="trnId of paginatedTrnsIds")
          TrnsItemTrnItem.item(
            :category="$store.state.categories.items[$store.state.trns.items[trnId].categoryId]"
            :key="trnId"
            :trn="$store.state.trns.items[trnId]"
            :trnId="trnId"
            :ui="ui"
            :showCategory="showCategory"
            :wallet="$store.state.wallets.items[$store.state.trns.items[trnId].walletId]"
          )

  .trnsList__pages(v-if="!isShowedAllTrns")
    SharedButton(
      :class="['_text-center _border _inline']"
      :title="$t('trns.more')"
      @onClick="showMoreTrns"
    )
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.trnsList
  padding 0 $m6

  &__grid
    display grid
    grid-template-rows 1fr
    grid-template-columns 1fr

  &__day
    padding $m7 0

    &:first-child
      padding-top 0

    &:last-child
      padding-bottom 0
      border-bottom 0

  &__header
    z-index 9
    position sticky
    top 37px
    display flex
    align-items center
    justify-content space-between
    padding-bottom $m6

  &__pages
    padding 16px 8px

    +media-laptop()
      padding 0
      padding-top 20px

  .item._history
    margin-right - ($m6 + $m3)
    margin-left - ($m6 + $m3)
    padding-right ($m6 + $m3)
    padding-left ($m6 + $m3)
  </style>
