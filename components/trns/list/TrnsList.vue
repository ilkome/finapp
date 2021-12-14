<script>
export default {
  props: {
    categoryId: { type: String, default: null },
    expenses: { type: Boolean, default: false },
    incomes: { type: Boolean, default: false },
    isShowFilter: { type: Boolean, default: false },
    limit: { type: Number, default: 0 },
    size: { type: Number, required: false, default: 30 },
    ui: { type: String, default: 'history' },
    classNames: { type: String, default: 'md:grid-cols-2 md:gap-6 lg:grid-cols-3' }
  },

  data () {
    return {
      pageNumber: 1,
      isShowTrnsWithDesc: false
    }
  },

  computed: {
    trnsIds () {
      const trns = this.$store.state.trns.items
      let trnsIds = this.$store.getters['trns/selectedTrnsIdsWithDate']

      // from category
      if (this.categoryId)
        trnsIds = trnsIds.filter(trnId => trns[trnId].categoryId === this.categoryId)

      // filter type
      if (this.incomes) trnsIds = trnsIds.filter(id => trns[id].type === 1)
      if (this.expenses) trnsIds = trnsIds.filter(id => trns[id].type === 0)

      return trnsIds
    },

    isShowedAllTrns () {
      return this.paginatedTrnsIds.length === this.trnsIdsWithLimit.length
    },

    isTrnsWithDescription () {
      const trns = this.$store.state.trns.items
      return this.trnsIds.filter(id => trns[id].description).length > 0
    },

    trnsIdsWithLimit () {
      const trns = this.$store.state.trns.items

      if (this.isShowFilter && this.isShowTrnsWithDesc && this.isTrnsWithDescription)
        return this.trnsIds.filter(id => trns[id].description)

      if (this.limit > 0)
        return this.trnsIds.slice(0, this.limit)

      return this.trnsIds
    },

    paginatedTrnsIds () {
      const end = this.pageNumber * this.size
      return this.trnsIdsWithLimit.slice(0, end)
    },

    groupedTrns () {
      const trns = this.$store.state.trns.items
      const trnsList = {}

      for (const trnId of this.paginatedTrnsIds) {
        const dayDate = this.$day(trns[trnId].date).startOf('day').valueOf()

        !trnsList[dayDate]
          ? trnsList[dayDate] = [trnId]
          : trnsList[dayDate].push(trnId)
      }

      return trnsList
    }
  },

  methods: {
    showMoreTrns () {
      this.pageNumber = this.pageNumber + 1
    },

    showTrnsWithDesc () {
      this.isShowTrnsWithDesc = !this.isShowTrnsWithDesc
    }
  }
}
</script>

<template lang="pug">
div
  .flex.pb-3(v-if="isShowFilter && isTrnsWithDescription")
    SharedContextMenuItem(
      :checkboxValue="isShowTrnsWithDesc"
      :grow="false"
      :title="$t('trns.filter.showTrnsWithDesc')"
      icon="mdi mdi-comment-text-outline"
      showCheckbox
      @onClick="isShowTrnsWithDesc = !isShowTrnsWithDesc"
    )

  div(v-if="trnsIds.length > 0")
    //- History view
    .grid.grid-cols-1.gap-2(
      v-if="ui === 'history'"
      :class="classNames"
    )
      .overflow-hidden.rounded-md.bg-4(
        v-for="(trnsIds, date) in groupedTrns"
        :key="date"
      )
        .pt-4
          .pb-2.px-3
            TrnsListDate(:date="date")

          .overflow-hidden.rounded-md
            TrnsItemTrnItem(
              v-for="trnId in trnsIds"
              :category="$store.state.categories.items[$store.state.trns.items[trnId].categoryId]"
              :key="trnId"
              :trn="$store.state.trns.items[trnId]"
              :trnId="trnId"
              :wallet="$store.state.wallets.items[$store.state.trns.items[trnId].walletId]"
            )

    //- Stat view
    div(v-else)
      TrnsItemTrnItem(
        v-for="trnId of paginatedTrnsIds"
        :key="trnId"
        :category="$store.state.categories.items[$store.state.trns.items[trnId].categoryId]"
        :trn="$store.state.trns.items[trnId]"
        :trnId="trnId"
        :ui="ui"
        :wallet="$store.state.wallets.items[$store.state.trns.items[trnId].walletId]"
      )

  .py-4(v-if="!isShowedAllTrns")
    .button(@click="showMoreTrns") {{ $t('trns.more') }}
</template>

<style lang="stylus" scoped>
.button
  button-base-1()
</style>
