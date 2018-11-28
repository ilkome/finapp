<script>
import moment from 'moment'

import TrnItem from '@/components/trns/item/TrnItem'
import TrnsListDate from '@/components/trns/list/TrnsListDate'

export default {
  components: {
    TrnItem,
    TrnsListDate
  },

  props: {
    ui: {
      type: String,
      default: 'group'
    },
    limit: {
      type: Number,
      default: 0
    },
    expenses: {
      type: Boolean,
      default: false
    },
    incomes: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    trnsIds () {
      const trns = this.$store.state.trns.items
      let trnsIds = this.$store.getters.selectedTrnsIdsWithDate.slice(0, 100) // slice

      if (this.incomes) trnsIds = trnsIds.filter(id => trns[id].type === 1)
      if (this.expenses) trnsIds = trnsIds.filter(id => trns[id].type === 0)

      if (this.limit > 0) {
        return trnsIds.slice(0, this.limit)
      }
      return trnsIds
    },

    groupedTrns () {
      const trns = this.$store.state.trns.items
      const trnsIds = this.trnsIds
      const trnsList = {}

      for (const trnId of trnsIds) {
        const dayDate = moment(trns[trnId].date).startOf('day').valueOf()
        if (!trnsList[dayDate]) {
          trnsList[dayDate] = [trnId]
        } else {
          trnsList[dayDate].push(trnId)
        }
      }
      return trnsList
    }
  }
}
</script>

<template lang="pug">
.trnsList
  template(v-if="trnsIds.length > 0")
    //- simple
    //------------------------------------------------
    template(v-if="ui === 'simple'")
      .trnsList__trns
        TrnItem(
          v-for="trnId of trns"
          :category="$store.state.categories.items[$store.state.trns.items[trnId].categoryId]"
          :key="trnId"
          :showDate="true"
          :trn="$store.state.trns.items[trnId]"
          :trnId="trnId"
          :wallet="$store.state.wallets.items[$store.state.trns.items[trnId].accountId]")

    //- group
    //------------------------------------------------
    template(v-if="ui === 'group'")
      .trnsList__day(
        v-for="(trnsIds, date) in groupedTrns")
        .trnsList__header: TrnsListDate(:date="date")
        .trnsList__trns
          TrnItem(
            v-for="trnId in trnsIds"
            :category="$store.state.categories.items[$store.state.trns.items[trnId].categoryId]"
            :key="trnId"
            :trn="$store.state.trns.items[trnId]"
            :trnId="trnId"
            :wallet="$store.state.wallets.items[$store.state.trns.items[trnId].accountId]")
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/media"

.trnsList
  &__day
    border-top 1px solid var(--c-bg-1)

    &:first-child
      border-top 0

    @media $media-laptop
      border 1px solid var(--c-bg-1)
      background var(--c-bg-3)

  &__header
    display flex
    align-items center
    justify-content space-between
    padding $m7 $m7
    background var(--c-bg-5)
    border-bottom 1px solid var(--c-bg-1)
</style>
