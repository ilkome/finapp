<script lang="ts">
import { defineComponent } from '#app'

export default defineComponent({
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
})
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

  template(v-if="trnsIds.length > 0")
    .grid.grid-cols-1.gap-2(
      class="md:grid-cols-2 md:gap-6 lg:grid-cols-3"
    )
      .overflow-hidden.rounded-md.bg-white2(
        v-for="(trnsIds, date) in groupedTrns"
        :key="date"
        class="dark:bg-dark4"
      )
        .pt-4
          .pb-2.px-3
            TrnsListDate(:date="date")

          .overflow-hidden.rounded-md
            TrnsItemHistory.py-3.px-3.cursor-pointer(
              v-for="trnId in trnsIds"
              :key="trnId"
              :trnId="trnId"
            )

  .py-4(v-if="!isShowedAllTrns")
    .button(@click="showMoreTrns") {{ $t('trns.more') }}
</template>

<style lang="stylus" scoped>
.button
  button-base-1()
</style>
