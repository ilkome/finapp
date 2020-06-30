<script>
import dayjs from 'dayjs'

import Button from '~/components/shared/button/Button'
import TrnItem from '~/components/trns/item/TrnItem'
import TrnsListDate from '~/components/trns/list/TrnsListDate'

export default {
  components: {
    Button,
    TrnItem,
    TrnsListDate
  },

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
      required: false,
      default: 30
    }
  },

  data () {
    return {
      pageNumber: 1,
      sortByEditDate: false
    }
  },

  computed: {
    isShowAllTrns () {
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
          ? dayDate = dayjs(trns[trnId].editDate).startOf('day').valueOf()
          : dayDate = dayjs(trns[trnId].date).startOf('day').valueOf()

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
  //- div(@click="sortByEditDate = !sortByEditDate" style="padding-bottom: 20px")
  //-   template(v-if="sortByEditDate") Sort by transaction date
  //-   template(v-else) Sort by edit date

  .trnsList__content
    template(v-if="trnsIds.length > 0")
      //- history view
      template(v-if="ui === 'history'")
        .trnsList__grid
          .trnsList__day(v-for="(trnsIds, date) in groupedTrns")
            .trnsList__header: TrnsListDate(:date="date")
            .trnsList__trns
              TrnItem(
                v-for="trnId in trnsIds"
                :category="$store.state.categories.items[$store.state.trns.items[trnId].categoryId]"
                :key="trnId"
                :trn="$store.state.trns.items[trnId]"
                :trnId="trnId"
                :wallet="$store.state.wallets.items[$store.state.trns.items[trnId].walletId]")

      //- stat view
      template(v-else)
        template(v-for="trnId of paginatedTrnsIds")
          TrnItem(
            :category="$store.state.categories.items[$store.state.trns.items[trnId].categoryId]"
            :key="trnId"
            :trn="$store.state.trns.items[trnId]"
            :trnId="trnId"
            :ui="ui"
            :wallet="$store.state.wallets.items[$store.state.trns.items[trnId].walletId]")

  .trnsList__pages(v-if="!isShowAllTrns")
    Button(
      :class="['_text-center _border _inline']"
      :title="$lang.trns.more"
      @onClick="showMoreTrns")
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables"

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
    padding 8px
    padding-bottom 0

    +media-laptop()
      grid-column-gap 20px
      grid-row-gap 20px
      grid-template-columns repeat(3, 1fr)
      padding 0

  &__day
    overflow hidden
    background var(--c-bg-3)
    border 1px solid var(--c-bg-1)
    border-radius 16px

    +media-laptop()
      margin 0

    &:first-child
      border-top 0

  &__header
    display flex
    align-items center
    justify-content space-between
    padding 12px 12px
    background var(--c-bg-4)
    border-bottom 1px solid var(--c-bg-2)

  &__pages
    padding 16px 8px

    +media-laptop()
      padding 0
      padding-top 20px

.statItem
  .trnsList__pages
    padding-top 10px
    padding-left 68px
    padding-bottom 20px
    +media-laptop()
      padding-left 62px
</style>
