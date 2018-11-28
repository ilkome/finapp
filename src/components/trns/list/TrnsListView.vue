<script>
import moment from 'moment'
import TrnItem from '@/components/trns/item/TrnItem'

export default {
  components: {
    TrnItem
  },

  props: {
    categoryId: {
      type: String,
      required: true
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
    },

    grouped: {
      type: Boolean,
      default: true
    }
  },

  computed: {
    trnsIds () {
      const categories = this.$store.state.categories.items
      const categoriesIds = Object.keys(categories)
      const trns = this.$store.state.trns.items
      let trnsIds = this.$store.getters.selectedTrnsIdsWithDate

      const categoryId = this.categoryId

      const childCategoriesIds = categoriesIds.filter(id => categories[id].parentId === categoryId)
      if (childCategoriesIds.length) {
        trnsIds = trnsIds.filter(trnId => {
          const trnCategoryId = trns[trnId].categoryId
          for (const categoryId of childCategoriesIds) {
            if (trnCategoryId === categoryId) return true
          }
        })
      } else {
        trnsIds = trnsIds.filter(trnId => trns[trnId].categoryId === categoryId)
      }

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

      const today = moment().startOf('day').valueOf()
      const yestarday = moment().subtract(1, 'day').startOf('day').valueOf()

      for (const trnId of trnsIds) {
        const dayDate = moment(trns[trnId].date).startOf('day').valueOf()

        switch (dayDate) {
          case today:
            !trnsList['today']
              ? trnsList['today'] = [trnId]
              : trnsList['today'].push(trnId)
            break
          case yestarday:
            !trnsList['yestarday']
              ? trnsList['yestarday'] = [trnId]
              : trnsList['yestarday'].push(trnId)
            break
          default:
            !trnsList['more']
              ? trnsList['more'] = [trnId]
              : trnsList['more'].push(trnId)
            break
        }
      }

      return trnsList
    }
  }
}
</script>

<template lang="pug">
.trnListView
  template(v-for="(trnsIds, date) in groupedTrns")
    .trnsGroup
      template(v-if="$store.state.filter.period !== 'day' && grouped")
        .trnsGroup__date(v-if="groupedTrns['today'] || groupedTrns['yestarday']") {{ date }}
      .trnsGroup__trns
        template(v-for="trnId of trnsIds")
          TrnItem(
            :category="$store.state.categories.items[$store.state.trns.items[trnId].categoryId]"
            :key="trnId"
            :simple="true"
            :insideStatCategory="true"
            :trn="$store.state.trns.items[trnId]"
            :trnId="trnId"
            :wallet="$store.state.wallets.items[$store.state.trns.items[trnId].accountId]")
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/media"

.trnsGroup
  &__date
    padding-bottom $m6
    text-transform capitalize
    color var(--c-font-4)
</style>

<style lang="stylus">
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/media"

.list
  .trnItem
    color var(--c-font-4)

    @media $media-laptop
      padding-left $mb2

  .trnItem__date
    color var(--c-font-2)

  .trnItem__line
    margin-bottom $m6
    padding-bottom $m6
</style>
