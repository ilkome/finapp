<script setup lang="ts">
import type { TrnID, TrnItem, TrnType } from '~/components/trns/types'
import useTrns from '~/components/trns/useTrns'

const props = withDefaults(defineProps<{
  trnsIds: TrnID[]
  trnsClassNames?: string
  defaultPeriod?: string
}>(), {
  trnsClassNames: ' grid md_grid-cols-2 md_gap-x-20',
})
const emit = defineEmits(['onClickEdit'])

const { $store } = useNuxtApp()
const filterType = ref<TrnType>(null)
const filterAll = ref(props.defaultPeriod)
const { allTrnsIdsWithFilter } = useTrns()

const filteredTrnsIds = computed(() => {
  const trnsIds = props.defaultPeriod && filterAll.value === 'all'
    ? allTrnsIdsWithFilter.value
    : props.trnsIds

  if (filterType.value === null)
    return trnsIds

  const trnsItems: Record<TrnID, TrnItem> = $store.state.trns.items
  return trnsIds.filter(id => trnsItems[id].type === filterType.value)
})

const trnsCount = computed(() => filteredTrnsIds.value.length)

function setTrnType(type: TrnType) {
  filterType.value = type
}

function onClickEdit(props) {
  emit('onClickEdit', props)
}
</script>

<template lang="pug">
div
  //- Title
  .pb-2.flex.items-center.justify-between.gap-2.text-lg.text-skin-item-base(
    v-if="trnsIds.length > 0"
    class="!pb-3"
  )
    .flex.gap-2.leading-none.font-nunito.font-semibold
      div {{ $t('trns.inPeriodTitle') }}:
      div {{ trnsCount }}

    .div(v-if="defaultPeriod")
      UiTabs
        UiTabsItem(
          :isActive="filterAll === 'period'"
          @click="filterAll = 'period'"
        ) {{ $t('dates.period') }}
        UiTabsItem(
          :isActive="filterAll === 'all'"
          @click="filterAll = 'all'"
        ) {{ $t('common.all') }}

  //- TypeSelector
  .pb-2(v-if="trnsIds.length > 0")
    UiTabs
      UiTabsItem(
        :isActive="filterType === null"
        @click="setTrnType(null)"
      ) {{ $t('common.all') }}

      UiTabsItem(
        :isActive="filterType === 0"
        @click="setTrnType(0)"
      ) {{ $t('money.expense') }}

      UiTabsItem(
        :isActive="filterType === 1"
        @click="setTrnType(1)"
      ) {{ $t('money.income') }}

      UiTabsItem(
        :isActive="filterType === 2"
        @click="setTrnType(2)"
      ) {{ $t('transfer.titleMany') }}

  //- Nothing
  .py-6.text-center(v-if="trnsCount === 0")
    .text-7xl.mdi.mdi-palm-tree
    .text-md No Transactions

  //- List
  .pb-10
    div(:class="trnsClassNames")
      TrnsList(
        :trnsIds="filteredTrnsIds"
        :size="50"
        isShowFilter
        uiHistory
        @onClickEdit="onClickEdit"
      )
</template>
