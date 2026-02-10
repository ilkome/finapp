<script setup lang="ts">
import type { TrnId, TrnsViewType } from '~/components/trns/types'

import { useAmount } from '~/components/amount/useAmount'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useDateFormats } from '~/components/date/useDateFormats'
import { getStartOf } from '~/components/date/utils'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = withDefaults(
  defineProps<{
    alt?: boolean
    initTrnType?: TrnsViewType
    isHideDates?: boolean
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
  }>(),
  {
    initTrnType: 'all',
    size: 30,
    trnsIds: () => [],
  },
)

const emit = defineEmits<{
  click: []
}>()

const currenciesStore = useCurrenciesStore()
const categoriesStore = useCategoriesStore()
const trnsStore = useTrnsStore()
const trnsFormStore = useTrnsFormStore()

const { getTotalOfTrnsIds } = useAmount()
const { t } = useI18n()
const { formatDate } = useDateFormats()
const isShowWithDesc = ref(false)
const filterBy = ref<TrnsViewType>(props.initTrnType)
const pageNumber = ref(1)

type TypeFilter = {
  count: number
  isShow: boolean
  name: string
  slug: TrnsViewType | 'all'
  type: TrnType | undefined
}

const typeFilters = computed<TypeFilter[]>(() => {
  const all = {
    count: props.trnsIds.length,
    isShow: true,
    name: t('common.all'),
    slug: 'all',
    type: undefined,
  }

  const transfers = {
    count: props.trnsIds.filter(id => trnsStore.items[id]?.type === TrnType.Transfer).length,
    isShow: props.isShowTransfers,
    name: t('transfer.titleMoney'),
    slug: 'transfer',
    type: TrnType.Transfer,
  }

  const expense = {
    count: props.trnsIds.filter(id => trnsStore.items[id].type === TrnType.Expense).length,
    isShow: props.isShowExpense,
    name: t('money.expense'),
    slug: 'expense',
    type: TrnType.Expense,
  }

  const income = {
    count: props.trnsIds.filter(id => trnsStore.items[id].type === TrnType.Income).length,
    isShow: props.isShowIncome,
    name: t('money.income'),
    slug: 'income',
    type: TrnType.Income,
  }

  return [all, expense, income, transfers].filter(item => item.isShow)
})

const selectedTypeFilter = computed(() => {
  return typeFilters.value.find(item => item.slug === filterBy.value)
})

const isTrnsWithDesc = computed(() => {
  let ids = props.trnsIds ?? []

  if (filterBy.value !== 'all') {
    ids = props.trnsIds.filter(id => trnsStore.items[id].type === selectedTypeFilter.value?.type)
  }

  return (ids).some(id => trnsStore.items[id]?.desc)
})

const selectedIds = computed(() => {
  let ids = props.trnsIds ?? []

  if (filterBy.value !== 'all') {
    ids = props.trnsIds.filter((id) => {
      if (filterBy.value === 'transfer') {
        return trnsStore.items[id]?.type === selectedTypeFilter.value?.type || categoriesStore.transferCategoriesIds.includes(trnsStore.items[id]?.categoryId)
      }

      return trnsStore.items[id]?.type === selectedTypeFilter.value?.type
    })
  }

  if (isShowWithDesc.value && isTrnsWithDesc.value) {
    ids = ids.filter(id => trnsStore.items[id].desc)
  }

  return ids
})

const paginatedTrnsIds = computed(() => selectedIds.value.slice(0, pageNumber.value * props.size))

const isShowedAllTrns = computed(() => paginatedTrnsIds.value.length === selectedIds.value.length)

function setFilterBy(type: TrnsViewType | 'all') {
  if (filterBy.value === type) {
    filterBy.value = 'all'
    return
  }

  filterBy.value = type ?? 'all'
}

const groupedTrns = computed(() => paginatedTrnsIds.value
  .reduce((acc, trnId) => {
    if (!trnsStore.items?.[trnId]) {
      return acc
    }
    const date = getStartOf(new Date(trnsStore.items[trnId]?.date), 'day').getTime()
    if (!acc[date]) {
      acc[date] = [trnId]
    }
    else {
      acc[date].push(trnId)
    }
    return acc
  }, {} as Record<string, TrnId[]>))

function onOpenTrnForm(date: number) {
  trnsFormStore.trnFormCreate()
  trnsFormStore.$patch((state) => {
    state.values.date = date
  })
}
</script>

<template>
  <div>
    <!-- Header -->
    <slot
      v-if="isShowHeader"
      name="header"
      :paginatedTrnsIds
      :selectedIds
    >
      <UiTitle8 isHideArrow>
        {{ t('trns.title') }} {{ selectedIds.length > 0 ? selectedIds.length : '' }}
      </UiTitle8>
    </slot>

    <slot name="contentBefore" />

    <!-- Filter by type -->
    <UiTabs2
      v-if="isShowFilterByType && typeFilters.length > 2"
      class="mb-2"
    >
      <UiTabsItem4
        v-for="filterItem in typeFilters"
        :key="filterItem.slug"
        :isActive="filterBy === filterItem.slug"
        :class="{
          'opacity-50': filterItem.count === 0,
        }"
        @click="setFilterBy(filterItem.slug)"
      >
        {{ filterItem.name }}
      </UiTabsItem4>
    </UiTabs2>

    <!-- With Description -->
    <div
      v-if="isShowFilterByDesc && isTrnsWithDesc && selectedIds.length > 0"
      class="relative"
    >
      <UiCheckbox
        :checkboxValue="isShowWithDesc"
        :title="t('trns.filter.showTrnsWithDesc')"
        showCheckbox
        @click="isShowWithDesc = !isShowWithDesc"
      />
    </div>

    <!-- No Trns -->
    <TrnsNoTrns v-if="props.isShowDates && selectedIds.length === 0" />

    <!-- Hide dates -->
    <div v-if="!isShowDates">
      <!-- Group Sum -->
      <div
        v-if="isShowGroupSum && paginatedTrnsIds.length > 1"
        class="border-item-4 border-b pr-3 pb-2 opacity-60"
      >
        <Amount
          v-if="getTotalOfTrnsIds(paginatedTrnsIds).income !== 0"
          :amount="getTotalOfTrnsIds(paginatedTrnsIds).income"
          :currencyCode="currenciesStore.base"
          :isShowBaseRate="false"
          :type="1"
          colorize="income"
          variant="sm"
        />

        <Amount
          v-if="getTotalOfTrnsIds(paginatedTrnsIds).expense !== 0"
          :amount="getTotalOfTrnsIds(paginatedTrnsIds).expense"
          :currencyCode="currenciesStore.base"
          :isShowBaseRate="false"
          :type="0"
          isShowMinus
          variant="sm"
        />
      </div>

      <TrnsItemWrap
        v-for="trnId in paginatedTrnsIds"
        :key="trnId"
        :alt="props.alt"
        :date="formatDate(trnsStore.computeTrnItem(trnId)?.date, 'trnItem')"
        :trnId="trnId"
        :trnItem="trnsStore.computeTrnItem(trnId)"
        class="group/trn group"
        @click="emit('click')"
      />
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
              v-if="getTotalOfTrnsIds(groupTrnsIds).income !== 0"
              :amount="getTotalOfTrnsIds(groupTrnsIds).income"
              :currencyCode="currenciesStore.base"
              :isShowBaseRate="false"
              :type="1"
              colorize="income"
              variant="sm"
            />

            <Amount
              v-if="getTotalOfTrnsIds(groupTrnsIds).expense !== 0"
              :amount="getTotalOfTrnsIds(groupTrnsIds).expense"
              :currencyCode="currenciesStore.base"
              :isShowBaseRate="false"
              :type="0"
              isShowMinus
              variant="sm"
            />
          </div>
        </div>

        <div>
          <TrnsItemWrap
            v-for="trnId in groupTrnsIds"
            :key="trnId"
            :alt="props.alt"
            :trnId="trnId"
            :trnItem="trnsStore.computeTrnItem(trnId)"
            :date="formatDate(trnsStore.computeTrnItem(trnId)?.date, 'trnItem')"
            class="group"
            @click="emit('click')"
          />
        </div>
      </div>
    </div>

    <!-- Show all -->
    <div
      v-if="!isShowedAllTrns"
      class="px-2 pt-1"
    >
      <div
        class="flex-center text-muted hover:bg-item-6 rounded-[var(--ui-radius)] bg-[var(--item-5)] px-5 py-2 text-sm"
        @click="pageNumber = ++pageNumber"
      >
        {{ t('trns.more') }} {{ paginatedTrnsIds.length }} /
        {{ selectedIds.length }}
      </div>
    </div>
  </div>
</template>
