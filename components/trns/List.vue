<script setup lang="ts">
import dayjs from 'dayjs'
import type { TrnId } from '~/components/trns/types'
import useFilter from '~/components/filter/useFilter'
import { useTrnForm } from '~/components/trnForm/useTrnForm'

const props = withDefaults(defineProps<{
  limit: number
  size: number
  trnsIds: TrnId[]

  isShowFilter?: boolean
  isFilterByDay?: boolean
  isShowGroupDate?: boolean
  uiCat?: boolean
  uiHistory?: boolean
}>(), {
  isShowFilter: false,
  isShowGroupDate: true,
  limit: 0,
  size: 30,
  uiHistory: false,
})
const emit = defineEmits(['onClickEdit'])

const { $store } = useNuxtApp()
const { setFilterCatsId, setDayDate } = useFilter()
const { trnFormEdit } = useTrnForm()

const pageNumber = ref(1)
const isShowTrnsWithDesc = ref(false)

const isTrnsWithDescription = computed(() =>
  props.trnsIds.some(id => $store.state.trns.items[id].description))

const trnsIdsWithLimit = computed(() => {
  const trnsItems = $store.state.trns.items

  if (props.isShowFilter && isShowTrnsWithDesc.value && isTrnsWithDescription.value)
    return props.trnsIds.filter(id => trnsItems[id].description)

  if (props.limit > 0)
    return props.trnsIds.slice(0, props.limit)

  return props.trnsIds
})

const paginatedTrnsIds = computed(() =>
  trnsIdsWithLimit.value.slice(0, pageNumber.value * props.size))

const isShowedAllTrns = computed(() =>
  paginatedTrnsIds.value.length === trnsIdsWithLimit.value.length)

// TODO: duplicate function
const groupedTrns = computed(() => {
  const trnsItems = $store.state.trns.items
  const trnsIds = paginatedTrnsIds.value

  return trnsIds.reduce((acc, trnId) => {
    const date = dayjs(trnsItems[trnId].date).startOf('day').valueOf()
    acc[date] ??= []
    acc[date].push(trnId)
    return acc
  }, {})
})

function showMoreTrns() {
  pageNumber.value += 1
}

function toggleTrnsWithDesc() {
  isShowTrnsWithDesc.value = !isShowTrnsWithDesc.value
}

function actions(trnItem) {
  return {
    onOpenDetails: () => {
      if (!$store.state.trns.modal.show) {
        $store.commit('trns/showTrnModal')
        $store.commit('trns/setTrnModalId', trnItem.id)
      }
    },

    onOpenEdit: (event) => {
      event.stopPropagation()
      trnFormEdit(trnItem.id)
    },

    // TODO: useFilter
    onSetFilter: (event) => {
      event.stopPropagation()
      setFilterCatsId(trnItem.categoryId)
      $store.commit('filter/setFilterDateNow')
      $store.commit('trns/hideTrnModal')
      $store.commit('trns/setTrnModalId', null)
      $store.dispatch('ui/setActiveTabStat', 'details')
    },
  }
}
</script>

<template lang="pug">
div(v-if="trnsIds && trnsIds.length > 0")
  .pb-2(v-if="isShowFilter && isTrnsWithDescription")
    SharedContextMenuItem(
      :checkboxValue="isShowTrnsWithDesc"
      :grow="false"
      :title="$t('trns.filter.showTrnsWithDesc')"
      icon="mdi mdi-comment-text-outline"
      showCheckbox
      @onClick="toggleTrnsWithDesc"
    )

  .grid(
    :class="{ 'gap-2': uiHistory }"
  )
    .overflow-hidden.rounded-md.bg-white2.dark_bg-dark4(
      v-for="(trnsIds, date) in groupedTrns"
      :key="date"
    )
      .pt-4.pb-2.px-3(
        v-if="isShowGroupDate"
        @click="isFilterByDay ? setDayDate(date) : null"
      )
        DateTrnsDay(:date="date")

      .overflow-hidden.rounded-md
        TrnsItemBase.py-3.px-3.cursor-pointer(
          v-if="uiHistory"
          v-for="trnId in trnsIds"
          :key="trnId"
          :trnId="trnId"
          @onClickEdit="$emit('onClickEdit')"
        )
        TrnsItemWithoutCat.py-3.px-3.cursor-pointer(
          v-if="uiCat"
          v-for="trnId in trnsIds"
          :actions="actions"
          :key="trnId"
          :trnId="trnId"
        )

  .py-4.pb-6.px-2.flex-center(v-if="!isShowedAllTrns")
    .cursor-pointer.grow.py-3.px-5.flex-center.rounded-full.text-sm.bg-skin-item-main-bg.hocus_bg-skin-item-main-hover(
      class="basis-1/2 max-w-[280px]"
      @click="showMoreTrns"
    ) {{ $t('trns.more') }}
</template>
