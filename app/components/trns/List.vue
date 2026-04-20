<script setup lang="ts">
import type { TrnId, TrnsViewType } from '~/components/trns/types'

import { useAmount } from '~/components/amount/useAmount'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useDateFormats } from '~/components/date/useDateFormats'
import { getStartOf } from '~/components/date/utils'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const {
  compact,
  isShowDates,
  isShowExpense,
  isShowFilterByDesc,
  isShowFilterByType,
  isShowGroupSum,
  isShowHeader,
  isShowIncome,
  isShowTransfers,
  size = 30,
  trnsIds = [],
} = defineProps<{
  compact?: boolean
  isShowDates?: boolean
  isShowExpense?: boolean
  isShowFilterByDesc?: boolean
  isShowFilterByType?: boolean
  isShowGroupSum?: boolean
  isShowHeader?: boolean
  isShowIncome?: boolean
  isShowTransfers?: boolean
  size?: number
  trnsIds?: TrnId[]
}>()

const emit = defineEmits<{
  click: []
}>()

const currenciesStore = useCurrenciesStore()
const trnsStore = useTrnsStore()
const trnsFormStore = useTrnsFormStore()

const { computeTotalForTrnsIds } = useAmount()
const { t } = useI18n()
const { formatDate } = useDateFormats()
const isShowWithDesc = ref(false)
const filterBy = ref<TrnsViewType>('all')
const pageNumber = ref(1)

type TypeFilter = {
  count: number
  isShow: boolean
  name: string
  slug: TrnsViewType | 'all'
  type: TrnType | undefined
}

const typeCounts = computed(() => {
  const counts = { adjustment: 0, expense: 0, income: 0, transfer: 0 }
  for (const id of trnsIds) {
    const trn = trnsStore.items?.[id]
    if (!trn)
      continue
    if (trn.categoryId === 'adjustment') {
      counts.adjustment++
      continue
    }
    if (trn.type === TrnType.Expense)
      counts.expense++
    else if (trn.type === TrnType.Income)
      counts.income++
    else if (trn.type === TrnType.Transfer)
      counts.transfer++
  }
  return counts
})

const realTypesCount = computed(() => {
  const c = typeCounts.value
  return (c.expense > 0 ? 1 : 0) + (c.income > 0 ? 1 : 0) + (c.transfer > 0 ? 1 : 0) + (c.adjustment > 0 ? 1 : 0)
})

const typeFilters = computed(() => {
  const counts = typeCounts.value
  const filters: TypeFilter[] = [
    { count: trnsIds.length, isShow: true, name: t('common.all'), slug: 'all', type: undefined },
    { count: counts.expense, isShow: !!isShowExpense && counts.expense > 0, name: t('money.expense'), slug: 'expense', type: TrnType.Expense },
    { count: counts.income, isShow: !!isShowIncome && counts.income > 0, name: t('money.income'), slug: 'income', type: TrnType.Income },
    { count: counts.transfer, isShow: !!isShowTransfers && counts.transfer > 0, name: t('transfer.titleMoney'), slug: 'transfer', type: TrnType.Transfer },
    { count: counts.adjustment, isShow: counts.adjustment > 0, name: t('trnForm.adjustmentTitle'), slug: 'adjustment', type: undefined },
  ]
  return filters.filter(item => item.isShow)
})

watch(typeFilters, (tabs) => {
  if (filterBy.value === 'all')
    return
  const selected = tabs.find(t => t.slug === filterBy.value)
  if (!selected || selected.count === 0)
    filterBy.value = 'all'
})

const selectedTypeFilter = computed(() => {
  return typeFilters.value.find(item => item.slug === filterBy.value)
})

const filteredByTypeIds = computed(() => {
  if (filterBy.value === 'all')
    return trnsIds ?? []

  return (trnsIds ?? []).filter((id) => {
    if (filterBy.value === 'adjustment')
      return trnsStore.items?.[id]?.categoryId === 'adjustment'

    return trnsStore.items?.[id]?.type === selectedTypeFilter.value?.type
  })
})

const isTrnsWithDesc = computed(() => filteredByTypeIds.value.some(id => trnsStore.items?.[id]?.desc))
const isAllTrnsWithDesc = computed(() => filteredByTypeIds.value.every(id => trnsStore.items?.[id]?.desc))

const selectedIds = computed(() => {
  if (isShowWithDesc.value && isTrnsWithDesc.value)
    return filteredByTypeIds.value.filter(id => trnsStore.items?.[id]?.desc)

  return filteredByTypeIds.value
})

const paginatedTrnsIds = computed(() => selectedIds.value.slice(0, pageNumber.value * size))

const isShowedAllTrns = computed(() => paginatedTrnsIds.value.length === selectedIds.value.length)

function setFilterBy(type: TrnsViewType | 'all') {
  filterBy.value = filterBy.value === type ? 'all' : (type ?? 'all')
}

const groupedTrns = computed(() => paginatedTrnsIds.value
  .reduce((acc, trnId) => {
    const trn = trnsStore.items?.[trnId]
    if (!trn) {
      return acc
    }
    const date = getStartOf(new Date(trn.date), 'day').getTime()
    if (!acc[date]) {
      acc[date] = [trnId]
    }
    else {
      acc[date].push(trnId)
    }
    return acc
  }, {} as Record<string, TrnId[]>))

const paginatedTotal = computed(() => computeTotalForTrnsIds(paginatedTrnsIds.value))

const groupTotals = computed(() => {
  const map = new Map<string, ReturnType<typeof computeTotalForTrnsIds>>()
  for (const [date, ids] of Object.entries(groupedTrns.value)) {
    if (ids.length > 1)
      map.set(date, computeTotalForTrnsIds(ids))
  }
  return map
})

const trnItemsMap = computed(() => {
  const map = new Map<TrnId, ReturnType<typeof trnsStore.computeTrnItem>>()
  for (const trnId of paginatedTrnsIds.value) {
    map.set(trnId, trnsStore.computeTrnItem(trnId))
  }
  return map
})

function onOpenTrnForm(date: number) {
  trnsFormStore.openFormForCreate()
  trnsFormStore.$patch((state) => {
    state.values.date = date
  })
}
</script>

<template>
  <div class="min-w-0">
    <!-- Header -->
    <slot
      v-if="isShowHeader"
      name="header"
      :paginatedTrnsIds
      :selectedIds
    >
      <UiTitleCollapse isHideArrow>
        {{ t('trns.title') }} {{ selectedIds.length > 0 ? selectedIds.length : '' }}
      </UiTitleCollapse>
    </slot>

    <slot name="contentBefore" />

    <!-- Filter by type -->
    <UiTabsScroll
      v-if="isShowFilterByType && realTypesCount > 1"
      class="mb-2"
    >
      <UiTabsItemPill
        v-for="filterItem in typeFilters"
        :key="filterItem.slug"
        variant="outline"
        :isActive="filterBy === filterItem.slug"
        @click="setFilterBy(filterItem.slug)"
      >
        {{ filterItem.name }}
      </UiTabsItemPill>
    </UiTabsScroll>

    <!-- With Description -->
    <div
      v-if="isShowFilterByDesc && isTrnsWithDesc && !isAllTrnsWithDesc && selectedIds.length > 0"
      class="relative"
    >
      <UiSwitchItem
        :checkboxValue="isShowWithDesc"
        :title="t('trns.filter.showTrnsWithDesc')"
        showCheckbox
        @click="isShowWithDesc = !isShowWithDesc"
      />
    </div>

    <!-- No Trns -->
    <TrnsNoTrns v-if="isShowDates && selectedIds.length === 0" />

    <!-- Hide dates -->
    <div v-if="!isShowDates">
      <!-- Group Sum -->
      <div
        v-if="isShowGroupSum && paginatedTrnsIds.length > 1"
        class="border-item-4 border-b pr-3 pb-2 opacity-60"
      >
        <Amount
          v-if="paginatedTotal.income !== 0"
          :amount="paginatedTotal.income"
          :currencyCode="currenciesStore.base"
          :isShowBaseRate="false"
          :type="TrnType.Income"
          colorize="income"
          variant="sm"
        />

        <Amount
          v-if="paginatedTotal.expense !== 0"
          :amount="paginatedTotal.expense"
          :currencyCode="currenciesStore.base"
          :isShowBaseRate="false"
          :type="TrnType.Expense"
          isShowMinus
          variant="sm"
        />
      </div>

      <template v-for="trnId in paginatedTrnsIds" :key="trnId">
        <TrnsItemWrap
          v-if="trnItemsMap.get(trnId)"
          :compact="compact"
          :date="(formatDate(trnItemsMap.get(trnId)!.date, 'trnItem') as string)"
          :trnId="trnId"
          :trnItem="trnItemsMap.get(trnId)!"
          class="group/trn group"
          @click="emit('click')"
        />
      </template>
    </div>

    <!-- With dates -->
    <div
      v-if="isShowDates"
      class="grid gap-1"
    >
      <div
        v-for="(groupTrnsIds, date) in groupedTrns"
        :key="date"
        class="_bg-item-2 _rounded-lg _border-b border-item-4 overflow-hidden pb-2 last:border-b-0 last:pb-px"
      >
        <div
          :class="{ 'border-item-4': isShowGroupSum && groupTrnsIds.length > 1 }"
          class="flex items-center gap-2 px-3 py-1"
        >
          <DateTrns
            :date="+date"
            class="grow"
            @click="onOpenTrnForm(+date)"
          />

          <!-- Group Sum -->
          <div
            v-if="isShowGroupSum && groupTrnsIds.length > 1"
            class="opacity-60"
          >
            <Amount
              v-if="groupTotals.get(String(date))?.income"
              :amount="groupTotals.get(String(date))!.income"
              :currencyCode="currenciesStore.base"
              :isShowBaseRate="false"
              :type="TrnType.Income"
              colorize="income"
              variant="sm"
            />

            <Amount
              v-if="groupTotals.get(String(date))?.expense"
              :amount="groupTotals.get(String(date))!.expense"
              :currencyCode="currenciesStore.base"
              :isShowBaseRate="false"
              :type="TrnType.Expense"
              isShowMinus
              variant="sm"
            />
          </div>
        </div>

        <div>
          <template v-for="trnId in groupTrnsIds" :key="trnId">
            <TrnsItemWrap
              v-if="trnItemsMap.get(trnId)"
              :compact="compact"
              :trnId="trnId"
              :trnItem="trnItemsMap.get(trnId)!"
              :date="(formatDate(trnItemsMap.get(trnId)!.date, 'trnItem') as string)"
              class="group"
              @click="emit('click')"
            />
          </template>
        </div>
      </div>
    </div>

    <!-- Show all -->
    <div
      v-if="!isShowedAllTrns"
      class="px-2 pt-1"
    >
      <div
        class="flex-center text-muted hover:bg-item-6 rounded-(--ui-radius) bg-(--item-5) px-5 py-2 text-sm"
        @click="pageNumber = ++pageNumber"
      >
        {{ t('trns.more') }} {{ paginatedTrnsIds.length }} /
        {{ selectedIds.length }}
      </div>
    </div>
  </div>
</template>
