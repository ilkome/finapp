<script>
import moment from 'moment'
import TrnItem from '@/components/trns/item/TrnItem'

export default {
  components: {
    TrnItem
  },

  props: {
    //
  },

  computed: {
    groupedTrns () {
      const trns = this.$store.state.trns.items
      const trnsIds = this.$store.getters.selectedTrnsIdsWithDate
      const trnsList = {}

      const today = moment().startOf('day').valueOf()
      const yesterday = moment().subtract(1, 'day').startOf('day').valueOf()

      for (const trnId of trnsIds) {
        const dayDate = moment(trns[trnId].date).startOf('day').valueOf()

        switch (dayDate) {
          case today:
            !trnsList['today']
              ? trnsList['today'] = [trnId]
              : trnsList['today'].push(trnId)
            break
          case yesterday:
            !trnsList['yesterday']
              ? trnsList['yesterday'] = [trnId]
              : trnsList['yesterday'].push(trnId)
            break
        }
      }

      return trnsList
    }
  }
}
</script>

<template lang="pug">
.trnListView(v-if="groupedTrns['today'] || groupedTrns['yesterday']")
  template(v-for="(trnsIds, date) in groupedTrns")
    .trnsGroup
      .trnsGroup__date(v-if="groupedTrns['today'] || groupedTrns['yesterday']") {{ date }}
      .trnsGroup__trns
        template(v-for="trnId of trnsIds")
          TrnItem(
            :category="$store.state.categories.items[$store.state.trns.items[trnId].categoryId]"
            :key="trnId"
            :trn="$store.state.trns.items[trnId]"
            :trnId="trnId"
            :wallet="$store.state.wallets.items[$store.state.trns.items[trnId].accountId]"
          )
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/media"

.trnListView
  padding $m7 0
  padding-bottom $m7
  border-bottom 1px solid var(--c-bg-1)

.trnsGroup
  padding-bottom $m8

  &:last-child
    padding-bottom 0

  &__date
    padding 0 $m7
    padding-bottom $m5
    text-transform capitalize
</style>

<style lang="stylus">
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/media"

.list
  .trnItem
    // padding-left $m7
    color var(--c-font-4)

    @media $media-laptop
      padding-left $mb2

  .trnItem__date
    color var(--c-font-2)

  .trnItem__categoryIcon
    // display none

  .trnItem__line
    margin-bottom $m6
    padding-bottom $m6
</style>
