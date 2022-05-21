<script lang="ts">
import useCalculator from '~/components/trnForm/calculator/useCalculator'
import useFilter from '~/modules/filter/useFilter'

export default defineComponent({
  props: {
    categoryId: { type: String, default: null },
    expense: { type: Boolean, default: false },
    income: { type: Boolean, default: false },
    isShowFilter: { type: Boolean, default: false },
    limit: { type: Number, default: 0 },
    size: { type: Number, required: false, default: 30 },
    ui: { type: String, default: 'history' },
    classNames: { type: String, default: '' },
  },

  setup() {
    const { $store } = useNuxtApp()
    const { setExpression } = useCalculator()
    const { setFilterCatsId } = useFilter()

    const actions = trnItem => ({
      onOpenDetails: () => {
        if (!$store.state.trns.modal.show) {
          $store.commit('trns/showTrnModal')
          $store.commit('trns/setTrnModalId', trnItem.id)
        }
      },

      onOpenEdit: (event) => {
        event.stopPropagation()
        setExpression(trnItem.type === 2 && trnItem.incomeAmount ? trnItem.incomeAmount : trnItem.amount)
        $store.dispatch('trnForm/openTrnForm', { action: 'edit', trnId: trnItem.id })
      },

      onSetFilter: (event) => {
        event.stopPropagation()
        setFilterCatsId(trnItem.categoryId)
        $store.commit('filter/setFilterDateNow')
        $store.commit('trns/hideTrnModal')
        $store.commit('trns/setTrnModalId', null)
        $store.dispatch('ui/setActiveTabStat', 'details')
      },
    })

    return { actions }
  },

  data() {
    return {
      pageNumber: 1,
      isShowTrnsWithDesc: false,
    }
  },

  computed: {
    trnsIds() {
      const trns = this.$store.state.trns.items
      let trnsIds = this.$store.getters['trns/selectedTrnsIdsWithDate']

      // from category
      if (this.categoryId)
        trnsIds = trnsIds.filter(trnId => trns[trnId].categoryId === this.categoryId)

      // filter type
      if (this.income)
        trnsIds = trnsIds.filter(id => trns[id].type === 1)
      if (this.expense)
        trnsIds = trnsIds.filter(id => trns[id].type === 0)

      return trnsIds
    },

    isShowedAllTrns() {
      return this.paginatedTrnsIds.length === this.trnsIdsWithLimit.length
    },

    isTrnsWithDescription() {
      const trns = this.$store.state.trns.items
      return this.trnsIds.filter(id => trns[id].description).length > 0
    },

    trnsIdsWithLimit() {
      const trns = this.$store.state.trns.items

      if (this.isShowFilter && this.isShowTrnsWithDesc && this.isTrnsWithDescription)
        return this.trnsIds.filter(id => trns[id].description)

      if (this.limit > 0)
        return this.trnsIds.slice(0, this.limit)

      return this.trnsIds
    },

    paginatedTrnsIds() {
      const end = this.pageNumber * this.size
      return this.trnsIdsWithLimit.slice(0, end)
    },

    groupedTrns() {
      const trns = this.$store.state.trns.items
      const trnsList = {}

      for (const trnId of this.paginatedTrnsIds) {
        const dayDate = this.$day(trns[trnId].date).startOf('day').valueOf()

        !trnsList[dayDate]
          ? trnsList[dayDate] = [trnId]
          : trnsList[dayDate].push(trnId)
      }

      return trnsList
    },
  },

  methods: {
    showMoreTrns() {
      this.pageNumber = this.pageNumber + 1
    },

    showTrnsWithDesc() {
      this.isShowTrnsWithDesc = !this.isShowTrnsWithDesc
    },
  },
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

  div(v-if="trnsIds.length > 0")
    //- History view
    .grid.gap-y-2(
      v-if="ui === 'history'"
      :class="classNames"
    )
      .overflow-hidden.rounded-md.bg-white2.shadow-sm(
        v-for="(trnsIds, date) in groupedTrns"
        :key="date"
        class="dark_bg-dark4"
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

    //- Stat view
    div(v-if="ui !== 'history'")
      TrnsItemWithoutCat.py-3.px-3.cursor-pointer(
        v-for="trnId in paginatedTrnsIds"
        :key="trnId"
        :actions="actions"
        :trnId="trnId"
      )

  .py-4.pb-6.px-3.flex-center(v-if="!isShowedAllTrns")
    .cursor-pointer.grow.py-3.px-5.flex-center.rounded-full.text-sm.bg-skin-item-main-bg.hocus_bg-skin-item-main-hover(
      class="basis-1/2 max-w-[280px]"
      @click="showMoreTrns"
    ) {{ $t('trns.more') }}
</template>
