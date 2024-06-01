<script setup lang="ts">
import dayjs from 'dayjs'
import type { MoneyTypeNumber } from '~/components/stat/types'
import type { TrnId, TrnType } from '~/components/trns/types'
import useAmount from '~/components/amount/useAmount'
import useTrn from '~/components/trns/useTrn'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = withDefaults(
  defineProps<{
    alt?: boolean
    initTrnType?: TrnType | MoneyTypeNumber | undefined
    isHideDates?: boolean
    isShowFilterByDesc?: boolean
    isShowFilterByType?: boolean
    isShowGroupSum?: boolean
    isShowHeader?: boolean
    size?: number
    trnsIds: TrnId[]
  }>(),
  {
    initTrnType: 'sum',
    size: 10,
    trnsIds: () => [],
  },
)

const currenciesStore = useCurrenciesStore()
const trnsStore = useTrnsStore()
const { formatDate, formatTrnItem } = useTrn()
const { getTotalOfTrnsIds } = useAmount()
const { t } = useI18n()

const isShowWithDesc = ref(false)
const filterBy = ref(props.initTrnType)
const pageNumber = ref(1)

watch(
  () => props.trnsIds,
  () => {
    pageNumber.value = 1
    isShowWithDesc.value = false
    filterBy.value = props.initTrnType
  },
)

const typeFilters = computed(() => ({
  sum: {
    count: props.trnsIds.length,
    name: t('common.all'),
    slug: undefined,
  },
  // eslint-disable-next-line perfectionist/sort-objects
  expense: {
    count: props.trnsIds.filter(id => trnsStore.items[id].type === 0).length,
    name: t('money.expense'),
    slug: 0,
  },
  income: {
    count: props.trnsIds.filter(id => trnsStore.items[id].type === 1).length,
    name: t('money.income'),
    slug: 1,
  },
  transfer: {
    count: props.trnsIds.filter(id => trnsStore.items[id].type === 2).length,
    name: t('transfer.titleMoney'),
    slug: 2,
  },
}))

const selectedIds = computed(() => {
  let ids = props.trnsIds ?? []

  if (filterBy.value !== 'sum') {
    ids = props.trnsIds.filter(
      id => trnsStore.items[id].type === typeFilters.value[filterBy.value]?.slug,
    )
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

  if (filterBy.value !== 'sum') {
    ids = props.trnsIds.filter(
      id => trnsStore.items[id].type === typeFilters.value[filterBy.value]?.slug,
    )
  }

  return (ids).some(
    id => trnsStore.items[id].description || trnsStore.items[id].desc,
  )
})

function setFilterBy(type: TrnType | undefined) {
  filterBy.value = type
}

const groupedTrns = computed(() => {
  return paginatedTrnsIds.value.reduce(
    (acc, trnId) => {
      const date = dayjs(trnsStore.items[trnId]?.date).startOf('day').valueOf()
      !acc[date] ? acc[date] = [trnId] : acc[date].push(trnId)
      return acc
    },
    {} as Record<string, TrnId[]>,
  )
})
</script>

<template>
  <div class="grid gap-3 h-full overflow-hidden content-start">
    <slot
      v-if="isShowHeader"
      name="header"
      :paginatedTrnsIds
      :selectedIds
    >
      <UiTitle
        class="flex items-baseline gap-2"
      >
        <div>{{ $t("trns.title") }}</div>
        <div v-if="selectedIds.length > 0" class="text-sm">
          {{ selectedIds.length }}
        </div>
      </UiTitle>
    </slot>

    <slot name="contentBefore" />

    <UiTabs3 v-if="isShowFilterByType">
      <UiTabsItem5
        v-for="(filterItem, slug) in typeFilters"
        :key="filterItem.slug"
        :isActive="filterBy === slug"
        :class="{
          'opacity-50': filterItem.count === 0,
        }"
        @click="setFilterBy(slug)"
      >
        {{ filterItem.name }}
      </UiTabsItem5>
    </UiTabs3>

    <div
      v-if="isShowFilterByDesc && isTrnsWithDesc && selectedIds.length > 0"
      class="-my-1"
    >
      <UiCheckbox
        :checkboxValue="isShowWithDesc"
        :title="$t('trns.filter.showTrnsWithDesc')"
        showCheckbox
        @onClick="isShowWithDesc = !isShowWithDesc"
      />
    </div>

    <div
      v-if="selectedIds.length === 0"
      class="flex-col gap-2 flex-center h-full py-3 text-center text-secondary"
    >
      <Icon name="mdi:palm-tree" size="64" />
      <div class="text-md">
        {{ $t("trns.noTrns") }}
      </div>
    </div>

    <div
      v-if="isHideDates"
    >
      <TrnsItemWrap
        v-for="trnId in paginatedTrnsIds"
        :key="trnId"
        :alt="props.alt"
        :trnId="trnId"
        :trnItem="formatTrnItem(trnId)"
        :date="formatDate(formatTrnItem(trnId)?.date, 'trnItem')"
      />
    </div>

    <div
      v-if="!isHideDates"
      class="grid gap-6 overflow-hidden overflow-y-auto"
    >
      <div
        v-for="(groupTrnsIds, date) in groupedTrns"
        :key="date"
      >
        <div class="flex gap-2 items-center ">
          <DateTrns
            :date="+date"
            class="px-3 grow"
          />

          <div
            v-if="isShowGroupSum"
            class="pr-3"
          >
            <Amount
              v-if="groupTrnsIds.length > 1 && getTotalOfTrnsIds(groupTrnsIds).income !== 0"
              :amount="getTotalOfTrnsIds(groupTrnsIds).income"
              :currencyCode="currenciesStore.base"
              :isShowBaseRate="false"
              :type="1"
              colorize="income"
              variant="2xs"
            />

            <Amount
              v-if="groupTrnsIds.length > 1 && getTotalOfTrnsIds(groupTrnsIds).expense !== 0"
              :amount="getTotalOfTrnsIds(groupTrnsIds).expense"
              :currencyCode="currenciesStore.base"
              :isShowBaseRate="false"
              :type="0"
              variant="2xs"
              isShowMinus
            />
          </div>
        </div>

        <TrnsItemWrap
          v-for="trnId in groupTrnsIds"
          :key="trnId"
          :alt="props.alt"
          :trnId="trnId"
          :trnItem="formatTrnItem(trnId)"
          :date="formatDate(formatTrnItem(trnId)?.date, 'trnItem')"
        />
      </div>
    </div>

    <div v-if="!isShowedAllTrns">
      <div
        class="flex-center grow rounded-lg bg-item-5 px-5 py-2.5 text-sm text-secondary hocus_bg-item-6"
        @click="pageNumber = ++pageNumber"
      >
        {{ $t("trns.more") }} {{ paginatedTrnsIds.length }} /
        {{ selectedIds.length }}
      </div>
    </div>
  </div>
</template>
