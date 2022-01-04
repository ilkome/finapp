<script lang="ts">
import { useNuxtApp, defineComponent } from '#app'
import useCalculator from '~/components/trnForm/calculator/useCalculator'
import useFilter from '~/modules/filter/useFilter'

export default defineComponent({
  props: {
    isShowFilter: { type: Boolean, default: false },
    limit: { type: Number, default: 0 },
    size: { type: Number, required: false, default: 30 }
  },

  setup () {
    const { $store } = useNuxtApp()
    const { setExpression } = useCalculator()
    const { setCategoryFilter } = useFilter()

    const actions = trnItem => ({
      onOpenDetails: () => {
        if (!$store.state.trns.modal.show) {
          $store.commit('categories/hideCategoryModal')
          $store.commit('trns/showTrnModal')
          $store.commit('trns/setTrnModalId', trnItem.id)
        }
      },

      onOpenEdit: (event) => {
        event.stopPropagation()
        setExpression(trnItem.amount)
        $store.dispatch('trnForm/openTrnForm', { action: 'edit', trnId: trnItem.id })
        $store.commit('stat/setCategoryModal', { id: null, type: null })
      },

      onSetFilter: (event) => {
        event.stopPropagation()
        setCategoryFilter(trnItem.categoryId)
        $store.commit('filter/setFilterDateNow')
        $store.commit('trns/hideTrnModal')
        $store.commit('trns/setTrnModalId', null)
        $store.commit('stat/setCategoryModal', { id: null, type: null })
        $store.dispatch('ui/setActiveTabStat', 'details')
      }
    })

    return { actions }
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
      .overflow-hidden.rounded-md.bg-4(
        v-for="(trnsIds, date) in groupedTrns"
        :key="date"
      )
        .pt-4
          .pb-2.px-3
            TrnsListDate(:date="date")

          .overflow-hidden.rounded-md
            TrnsItemHistory.py-3.px-3.cursor-pointer(
              v-for="trnId in trnsIds"
              :key="trnId"
              :actions="actions"
              :trnId="trnId"
            )

  .py-4(v-if="!isShowedAllTrns")
    .button(@click="showMoreTrns") {{ $t('trns.more') }}
</template>

<style lang="stylus" scoped>
.button
  button-base-1()
</style>
