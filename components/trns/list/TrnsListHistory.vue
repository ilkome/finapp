<script>
export default {
  name: 'TrnsList',

  props: {
    isShowFilter: { type: Boolean, default: false },
    limit: { type: Number, default: 0 },
    size: { type: Number, required: false, default: 30 }
  },

  data () {
    return {
      pageNumber: 1,
      sortByEditDate: false,
      isShowTrnsWithDesc: false
    }
  },

  computed: {
    trnsIds () {
      return this.$store.getters['trns/selectedTrnsIds']
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
        let dayDate
        this.sortByEditDate
          ? dayDate = this.$day(trns[trnId].edited).startOf('day').valueOf()
          : dayDate = this.$day(trns[trnId].date).startOf('day').valueOf()

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
.trnsList
  template(v-if="isShowFilter && isTrnsWithDescription")
    .filter
      SharedContextMenuItem(
        :checkboxValue="isShowTrnsWithDesc"
        :grow="false"
        :title="$t('trns.filter.showTrnsWithDesc')"
        icon="mdi mdi-comment-text-outline"
        showCheckbox
        @onClick="isShowTrnsWithDesc = !isShowTrnsWithDesc"
      )

  .trnsList__content
    template(v-if="trnsIds.length > 0")
      .trnsList__grid
        .trnsList__day(v-for="(trnsIds, date) in groupedTrns")
          .trnsList__header: TrnsListDate(:date="date")
          .trnsList__trns
            TrnsItemTrnItem(
              v-for="trnId in trnsIds"
              :category="$store.state.categories.items[$store.state.trns.items[trnId].categoryId]"
              :key="trnId"
              :trn="$store.state.trns.items[trnId]"
              :trnId="trnId"
              :wallet="$store.state.wallets.items[$store.state.trns.items[trnId].walletId]"
            )

  .trnsList__pages(v-if="!isShowedAllTrns")
    .button(@click="showMoreTrns") {{ $t('trns.more') }}
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.filter
  display flex
  padding-bottom $m6

.button
  button-base-1()
  margin-top $m7

.trnsList
  max-width 400px
  padding-bottom 8px

  &:last-child
    padding-bottom 0

  +media(600px)
    max-width 100%
    padding 0

  &__grid
    display grid
    grid-template-rows 1fr
    grid-template-columns 1fr
    grid-column-gap 8px
    grid-row-gap 8px
    padding 8px
    padding-bottom 0

    +media(600px)
      grid-column-gap 20px
      grid-row-gap 20px
      grid-template-columns repeat(auto-fill, minmax(260px, 1fr))
      padding 0

  &__day
    overflow hidden
    margin-bottom 16px
    padding-bottom 16px

    +media(600px)
      margin 0
      padding 16px 0px
      background var(--c-bg-4)
      border-bottom 1px solid var(--c-bg-2)
      border-radius 12px

    &:first-child
      margin-top $m9
      border-top 0

      +media(600px)
        margin 0

  &__header
    display flex
    align-items center
    justify-content space-between
    padding 0 12px
    padding-bottom 12px

  &__pages
    padding 16px 8px

    +media(600px)
      padding 0
      padding-top 20px

  &__sort
    padding 0
    padding-bottom $m8

    +media-laptop('less')
      padding $m7
      padding-bottom $m6
</style>
