<script setup lang="ts">
import type { MoneyTypeNumber } from '~/components/stat/types'
import type { TrnId, TrnType } from '~/components/trns/types'
import useAmount from '~/components/amount/useAmount'
import { useDateFormats } from '~/components/date/useDateFormats'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { getStartOf } from '~/components/date/utils'

const props = withDefaults(
  defineProps<{
    alt?: boolean
    initTrnType?: TrnType | MoneyTypeNumber | undefined
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
    trnsIds: TrnId[]
  }>(),
  {
    initTrnType: 'summary',
    size: 30,
    trnsIds: () => [],
  },
)

const emit = defineEmits<{
  click: []
}>()

const currenciesStore = useCurrenciesStore()
const trnsStore = useTrnsStore()
const { getTotalOfTrnsIds } = useAmount()
const { t } = useI18n()
const { formatDate } = useDateFormats()
const isShowWithDesc = ref(false)
const filterBy = ref(props.initTrnType)
const pageNumber = ref(1)

const typeFilters = computed(() => {
  const sum = {
    count: props.trnsIds.length,
    isShow: true,
    name: t('common.all'),
    slug: 'summary',
    type: undefined,
  }

  const transfers = {
    count: props.trnsIds.filter(id => trnsStore.items[id].type === 2).length,
    isShow: props.isShowTransfers,
    name: t('transfer.titleMoney'),
    slug: 'transfer',
    type: 2,
  }

  const expense = {
    count: props.trnsIds.filter(id => trnsStore.items[id].type === 0).length,
    isShow: props.isShowExpense,
    name: t('money.expense'),
    slug: 'expense',
    type: 0,
  }

  const income = {
    count: props.trnsIds.filter(id => trnsStore.items[id].type === 1).length,
    isShow: props.isShowIncome,
    name: t('money.income'),
    slug: 'income',
    type: 1,
  }

  return [sum, expense, income, transfers].filter(item => item.isShow)
})

const selectedIds = computed(() => {
  let ids = props.trnsIds ?? []

  if (filterBy.value !== 'summary') {
    ids = props.trnsIds.filter(id => trnsStore.items[id].type === typeFilters.value.find(item => item.slug === filterBy.value)?.type)
  }

  if (isShowWithDesc.value && isTrnsWithDesc.value) {
    ids = ids.filter(
      id => trnsStore.items[id].description || trnsStore.items[id].desc,
    )
  }

  return ids
})

const paginatedTrnsIds = computed(() =>
  selectedIds.value.slice(0, pageNumber.value * props.size),
)

const isShowedAllTrns = computed(
  () => paginatedTrnsIds.value.length === selectedIds.value.length,
)

const isTrnsWithDesc = computed(() => {
  let ids = props.trnsIds ?? []

  if (filterBy.value !== 'summary') {
    ids = props.trnsIds.filter(
      id => trnsStore.items[id].type === typeFilters.value[filterBy.value]?.type,
    )
  }

  return (ids).some(
    id => trnsStore.items[id].description || trnsStore.items[id].desc,
  )
})

function setFilterBy(type: TrnType | undefined) {
  if (filterBy.value === type) {
    filterBy.value = 'summary'
    return
  }

  filterBy.value = type ?? 'summary'
}

const groupedTrns = computed(() => {
  return paginatedTrnsIds.value.reduce(
    (acc, trnId) => {
      if (!trnsStore.items?.[trnId]) {
        return acc
      }
      const date = getStartOf(new Date(trnsStore.items[trnId].date), 'day').getTime()
      if (!acc[date]) {
        acc[date] = [trnId]
      }
      else {
        acc[date].push(trnId)
      }
      return acc
    },
    {} as Record<string, TrnId[]>,
  )
})
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
      <UiTitle9>{{ t("trns.title") }} {{ selectedIds.length > 0 ? selectedIds.length : '' }}</UiTitle9>
    </slot>

    <slot name="contentBefore" />

    <!-- Filter by type -->
    <UiTabs1
      v-if="isShowFilterByType && typeFilters.length > 2"
      class="mb-4"
    >
      <UiTabsItem1
        v-for="filterItem in typeFilters"
        :key="filterItem.slug"
        :isActive="filterBy === filterItem.slug"
        :class="{
          'opacity-50': filterItem.count === 0,
        }"
        @click="setFilterBy(filterItem.slug)"
      >
        {{ filterItem.name }}
      </UiTabsItem1>
    </UiTabs1>

    <!-- With Desc -->
    <div
      v-if="isShowFilterByDesc && isTrnsWithDesc && selectedIds.length > 0"
      class="relative pb-2"
    >
      <UiCheckbox
        :checkboxValue="isShowWithDesc"
        :title="t('trns.filter.showTrnsWithDesc')"
        showCheckbox
        @onClick="isShowWithDesc = !isShowWithDesc"
      />
    </div>

    <!-- No Trns -->
    <TrnsNoTrns v-if="props.isShowDates && selectedIds.length === 0" />

    <!-- Hide dates -->
    <div v-if="!isShowDates">
      <!-- Group Sum -->
      <div
        v-if="isShowGroupSum && paginatedTrnsIds.length > 1"
        class="border-item-5 border-b pb-2 pr-3"
      >
        <Amount
          v-if="getTotalOfTrnsIds(paginatedTrnsIds).income !== 0"
          :amount="getTotalOfTrnsIds(paginatedTrnsIds).income"
          :currencyCode="currenciesStore.base"
          :isShowBaseRate="false"
          :type="1"
          colorize="income"
          variant="base"
        />

        <Amount
          v-if="getTotalOfTrnsIds(paginatedTrnsIds).expense !== 0"
          :amount="getTotalOfTrnsIds(paginatedTrnsIds).expense"
          :currencyCode="currenciesStore.base"
          :isShowBaseRate="false"
          :type="0"
          isShowMinus
          variant="base"
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
      class="grid gap-3"
    >
      <div
        v-for="(groupTrnsIds, date) in groupedTrns"
        :key="date"
        class="bg-item-9 overflow-hidden rounded-lg"
      >
        <div
          :class="{ '-border-b border-item-5': isShowGroupSum && groupTrnsIds.length > 1 }"
          class="bg-item-4 flex items-end gap-2 px-3 py-2 pb-1"
        >
          <DateTrns
            :date="+date"
            class="grow "
          />

          <!-- Group Sum -->
          <div
            v-if="isShowGroupSum && groupTrnsIds.length > 1"
            class="pb-2"
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
      class="flex-center pt-1"
    >
      <div
        class="flex-center bg-item-5 text-secondary hocus:bg-item-6 rounded-full px-5 py-2 text-sm"
        @click="pageNumber = ++pageNumber"
      >
        {{ t("trns.more") }} {{ paginatedTrnsIds.length }} /
        {{ selectedIds.length }}
      </div>
    </div>
  </div>
</template>
