<script setup lang="ts">
import dayjs from 'dayjs'
import { storeToRefs } from 'pinia'
import useAmount from '~/components/amount/useAmount'
import { useAppNav } from '~/components/app/useAppNav'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useFilterStore } from '~/components/filter/useFilterStore'
import { useTrnForm } from '~/components/trnForm/useTrnForm'
import type { TrnId } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = withDefaults(defineProps<{
  limit?: number
  size?: number
  trnsIds: TrnId[] | false

  isShowFilter?: boolean
  isFilterByDay?: boolean
  isShowGroupDate?: boolean
  uiCat?: boolean
  uiHistory?: boolean
  isShowGroupSum?: boolean
}>(), {
  isShowFilter: false,
  isShowGroupDate: true,
  limit: 0,
  size: 30,
  uiHistory: false,
})
const emit = defineEmits(['onClickEdit'])
const { activeTabStat } = storeToRefs(useAppNav())
const { getTotalOfTrnsIds } = useAmount()
const filterStore = useFilterStore()
const { trnFormEdit } = useTrnForm()
const currenciesStore = useCurrenciesStore()
const trnsStore = useTrnsStore()

const pageNumber = ref(1)
const isShowTrnsWithDesc = ref(false)

const isTrnsWithDescription = computed(() =>
  props.trnsIds.some(id => trnsStore.items[id].description))

const trnsIdsWithLimit = computed(() => {
  const trnsItems = trnsStore.items

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
  const trnsItems = trnsStore.items
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
      if (!useTrnsStore.isShownModal) {
        trnsStore.showTrnModal()
        trnsStore.setTrnModalId(trnItem.id)
      }
    },

    onOpenEdit: (event) => {
      event.stopPropagation()
      trnFormEdit(trnItem.id)
    },

    onSetFilter: (event) => {
      event.stopPropagation()
      filterStore.setCategoryId(trnItem.categoryId)
      filterStore.setDateNow()
      trnsStore.hideTrnModal()
      trnsStore.setTrnModalId(null)
      activeTabStat.value = 'summary'
    },
  }
}
</script>

<template lang="pug">
.grid(
  v-if="trnsIds && trnsIds.length > 0"
  :class="{ 'gap-2': uiHistory }"
)
  .pb-2(v-if="isShowFilter && isTrnsWithDescription")
    UiCheckbox(
      :checkboxValue="isShowTrnsWithDesc"
      :title="$t('trns.filter.showTrnsWithDesc')"
      showCheckbox
      @onClick="toggleTrnsWithDesc"
    )

  div(
    v-for="(trnsIds, date) in groupedTrns"
    :key="date"
  )
    div(
      class="flex items-center pt-4 pb-2 px-2 sm_px-1.5"
      v-if="isShowGroupDate"
      @click="isFilterByDay ? filterStore.setDayDate(date) : null"
    )
      DateTrnsDay(:date="+date").grow

      .flex.items-center.gap-2.text-sm(v-if="isShowGroupSum")
        Amount(
          v-if="getTotalOfTrnsIds(trnsIds).incomeTransactions !== 0"
          :amount="getTotalOfTrnsIds(trnsIds).incomeTransactions"
          :currencyCode="currenciesStore.base"
          :isShowBaseRate="false"
          :type="1"
          colorize="income"
        )
        Amount(
          v-if="getTotalOfTrnsIds(trnsIds).expenseTransactions !== 0"
          :amount="getTotalOfTrnsIds(trnsIds).expenseTransactions"
          :currencyCode="currenciesStore.base"
          :isShowBaseRate="false"
          :type="0"
        )

    div
      TrnsItemBase(
        v-if="uiHistory"
        v-for="trnId in trnsIds"
        :key="trnId"
        :trnId="trnId"
        @onClickEdit="emit('onClickEdit')"
      )
      TrnsItemWithoutCat(
        v-if="uiCat"
        v-for="trnId in trnsIds"
        :actions="actions"
        :key="trnId"
        :trnId="trnId"
      )

  .py-4.pb-6.px-2(v-if="!isShowedAllTrns")
    .grow.px-5.flex-center.rounded-lg.text-sm.bg-item-5.hocus_bg-item-6.text-secondary(
      class="py-2.5"
      @click="showMoreTrns"
    ) {{ $t('trns.more') }}
</template>
