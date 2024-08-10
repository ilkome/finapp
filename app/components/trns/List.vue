<script setup lang="ts">
import dayjs from 'dayjs'
import type { MoneyTypeNumber } from '~/components/stat/types'
import type { TrnId, TrnType } from '~/components/trns/types'
import useAmount from '~/components/amount/useAmount'
import useTrn from '~/components/trns/useTrn'
import { formatDate } from '~/components/date/format'
import { getStyles } from '~/components/ui/getStyles'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = withDefaults(
  defineProps<{
    alt?: boolean
    initTrnType?: TrnType | MoneyTypeNumber | undefined
    isHideDates?: boolean
    isHideNoTrns?: boolean
    isShowFilterByDesc?: boolean
    isShowFilterByType?: boolean
    isShowGroupSum?: boolean
    isShowHeader?: boolean
    size?: number
    trnsIds: TrnId[]
  }>(),
  {
    initTrnType: 'sum',
    size: 30,
    trnsIds: () => [],
  },
)

const currenciesStore = useCurrenciesStore()
const trnsStore = useTrnsStore()
const { formatTrnItem } = useTrn()
const { getTotalOfTrnsIds } = useAmount()
const { t } = useI18n()

const isShowWithDesc = ref(false)
const filterBy = ref(props.initTrnType)
const pageNumber = ref(1)

watch(
  () => props.trnsIds,
  () => {
    // pageNumber.value = 1
    // isShowWithDesc.value = false
    // filterBy.value = props.initTrnType
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
  <div>
    <!-- Header -->
    <slot
      v-if="isShowHeader"
      name="header"
      :paginatedTrnsIds
      :selectedIds
    >
      <UiTitle9>{{ $t("trns.title") }} {{ selectedIds.length > 0 ? selectedIds.length : '' }}</UiTitle9>
    </slot>

    <slot name="contentBefore" />

    <!-- Filter by type -->
    <UiTabs
      v-if="isShowFilterByType"
      class="mb-2"
    >
      <UiTabsItem
        v-for="(filterItem, slug) in typeFilters"
        :key="filterItem.slug"
        :isActive="filterBy === slug"
        :class="{
          'opacity-50': filterItem.count === 0,
        }"
        @click="setFilterBy(slug)"
      >
        {{ filterItem.name }}
      </UiTabsItem>
    </UiTabs>

    <!-- With Desc -->
    <div
      v-if="isShowFilterByDesc && isTrnsWithDesc && selectedIds.length > 0"
      class="z-10 relative pb-2"
    >
      <UiCheckbox
        :checkboxValue="isShowWithDesc"
        :title="$t('trns.filter.showTrnsWithDesc')"
        showCheckbox
        @onClick="isShowWithDesc = !isShowWithDesc"
      />
    </div>

    <!-- No Trns -->
    <TrnsNoTrns v-if="!props.isHideNoTrns && selectedIds.length === 0" />

    <!-- Hide dates -->
    <div v-if="isHideDates">
      <!-- Group Sum -->
      <div
        v-if="isShowGroupSum && paginatedTrnsIds.length > 1"
        class="pr-3 border-b border-item-7 pb-2"
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
        :date="formatDate(formatTrnItem(trnId)?.date, 'trnItem')"
        :trnId="trnId"
        :trnItem="formatTrnItem(trnId)"
        class="group"
      />
    </div>

    <!-- With dates -->
    <div
      v-if="!isHideDates"
      class="grid gap-2"
    >
      <div
        v-for="(groupTrnsIds, date) in groupedTrns"
        :key="date"
        class="bg-item-9 rounded-lg overflow-hidden"
      >
        <div
          :class="{ '-border-b border-item-7': isShowGroupSum && groupTrnsIds.length > 1 }"
          class="flex gap-2 items-end py-2 pb-1 px-3"
        >
          <DateTrns
            :date="+date"
            class="grow"
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
            :trnItem="formatTrnItem(trnId)"
            :date="formatDate(formatTrnItem(trnId)?.date, 'trnItem')"
            class="group"
          />
        </div>
      </div>
    </div>

    <!-- Show all -->
    <div v-if="!isShowedAllTrns">
      <div
        class="flex-center grow rounded-full bg-item-5 px-5 py-2.5 text-sm text-secondary hocus:bg-item-6"
        @click="pageNumber = ++pageNumber"
      >
        {{ $t("trns.more") }} {{ paginatedTrnsIds.length }} /
        {{ selectedIds.length }}
      </div>
    </div>
  </div>
</template>
