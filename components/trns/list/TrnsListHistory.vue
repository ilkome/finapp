<script setup lang="ts">
import useCalculator from '~/components/trnForm/calculator/useCalculator'
import useFilter from '~/modules/filter/useFilter'

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
</script>

<script lang="ts">
export default defineComponent({
  props: {
    trnsIds: { type: Array, required: true },
    isShowFilter: { type: Boolean, default: false },
    isShowGroupDate: { type: Boolean, default: true },
    uiHistory: { type: Boolean, default: true },
    uiCat: { type: Boolean, default: false },
    limit: { type: Number, default: 0 },
    size: { type: Number, required: false, default: 30 },
  },

  data() {
    return {
      pageNumber: 1,
      sortByEditDate: false,
      isShowTrnsWithDesc: false,
    }
  },

  computed: {
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
        let dayDate
        this.sortByEditDate
          ? dayDate = this.$day(trns[trnId].edited).startOf('day').valueOf()
          : dayDate = this.$day(trns[trnId].date).startOf('day').valueOf()

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
  .pb-3(v-if="isShowFilter && isTrnsWithDescription")
    SharedContextMenuItem(
      :checkboxValue="isShowTrnsWithDesc"
      :grow="false"
      :title="$t('trns.filter.showTrnsWithDesc')"
      icon="mdi mdi-comment-text-outline"
      showCheckbox
      @onClick="isShowTrnsWithDesc = !isShowTrnsWithDesc"
    )

  template(v-if="trnsIds.length > 0")
    .grid.gap-2
      .overflow-hidden.rounded-md.bg-white2(
        v-for="(trnsIds, date) in groupedTrns"
        :key="date"
        class="dark_bg-dark4"
      )
        .pt-4.pb-2.px-3(v-if="isShowGroupDate")
          TrnsListDate(:date="date")

        .overflow-hidden.rounded-md
          TrnsItemHistory.py-3.px-3.cursor-pointer(
            v-if="uiHistory"
            v-for="trnId in trnsIds"
            :key="trnId"
            :trnId="trnId"
          )
          TrnsItemWithoutCat.py-3.px-3.cursor-pointer(
            v-if="uiCat"
            v-for="trnId in trnsIds"
            :actions="actions"
            :key="trnId"
            :trnId="trnId"
          )

  .py-4.pb-6.px-3.flex-center(v-if="!isShowedAllTrns")
    .cursor-pointer.grow.py-3.px-5.flex-center.rounded-full.text-sm.bg-skin-item-main-bg.hocus_bg-skin-item-main-hover(
      class="basis-1/2 max-w-[280px]"
      @click="showMoreTrns"
    ) {{ $t('trns.more') }}
</template>
