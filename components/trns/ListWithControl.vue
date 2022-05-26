<script setup lang="ts">
import type { TrnID, TrnItem, TrnType } from '~/components/trns/types'
import useTrns from '~/components/trns/useTrns'
import useStatPage from '~/components/stat/useStatPage'

const props = withDefaults(defineProps<{
  trnsIds: TrnID[]
  trnsClassNames?: string
  defaultFilterTrnsPeriod?: string
  isFilterByDay?: boolean
}>(), {
  trnsClassNames: ' grid md_grid-cols-2 md_gap-x-20',
})
const emit = defineEmits(['onClickEdit'])

const { $store } = useNuxtApp()
const filterTrnsType = ref<TrnType>(null)
const filterTrnsPeriod = ref(props.defaultFilterTrnsPeriod)
const { allTrnsIdsWithFilter } = useTrns()
const { statPage } = useStatPage()

// Return to filter 'period', when global filter params changed
watch(statPage.filter, () => filterTrnsPeriod.value = 'period')

const filteredTrnsIds = computed(() => {
  const trnsIds = props.defaultFilterTrnsPeriod && filterTrnsPeriod.value === 'all'
    ? allTrnsIdsWithFilter.value
    : props.trnsIds

  if (filterTrnsType.value === null)
    return trnsIds

  const trnsItems: Record<TrnID, TrnItem> = $store.state.trns.items
  return trnsIds.filter(id => trnsItems[id].type === filterTrnsType.value)
})

const trnsCount = computed(() => filteredTrnsIds.value.length)

function setFilterTrnsType(type: TrnType) {
  filterTrnsType.value = type
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

    .div(v-if="defaultFilterTrnsPeriod")
      UiTabs
        UiTabsItem(
          :isActive="filterTrnsPeriod === 'period'"
          @click="filterTrnsPeriod = 'period'"
        ) {{ $t('dates.period') }}
        UiTabsItem(
          :isActive="filterTrnsPeriod === 'all'"
          @click="filterTrnsPeriod = 'all'"
        ) {{ $t('common.all') }}

  //- TypeSelector
  .pb-2(v-if="trnsIds.length > 0")
    UiTabs
      UiTabsItem(
        :isActive="filterTrnsType === null"
        @click="setFilterTrnsType(null)"
      ) {{ $t('common.all') }}

      UiTabsItem(
        :isActive="filterTrnsType === 0"
        @click="setFilterTrnsType(0)"
      ) {{ $t('money.expense') }}

      UiTabsItem(
        :isActive="filterTrnsType === 1"
        @click="setFilterTrnsType(1)"
      ) {{ $t('money.income') }}

      UiTabsItem(
        :isActive="filterTrnsType === 2"
        @click="setFilterTrnsType(2)"
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
        :isFilterByDay="isFilterByDay"
        isShowFilter
        uiHistory
        @onClickEdit="onClickEdit"
      )
</template>
