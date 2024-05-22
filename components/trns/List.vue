<script setup lang="ts">
import type { TrnId, TrnItemFull, TrnType } from '~/components/trns/types'
import useTrn from '~/components/trns/useTrn'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import type { MoneyTypeNumber } from '~/components/stat/types'

const props = withDefaults(
  defineProps<{
    alt?: boolean
    initTrnType?: TrnType | MoneyTypeNumber | undefined
    isShowFilter?: boolean
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

const { t } = useI18n()
const { formatDate, formatTrnItem } = useTrn()
const trnsStore = useTrnsStore()

const isShowWithDesc = ref(false)
const filterBy = ref(props.initTrnType)
const pageNumber = ref(1)

watch(
  () => props.trnsIds,
  () => {
    pageNumber.value = 1
    isShowWithDesc.value = false
  },
)

const selectedIds = computed(() => {
  let ids = props.trnsIds ?? []

  if (filterBy.value !== 'sum') {
    ids = props.trnsIds.filter(
      id => trnsStore.items[id].type === typeFilters.value[filterBy.value]?.slug,
    )
  }

  if (isShowWithDesc.value) {
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

const isTrnsWithDescription = computed(() =>
  (props.trnsIds ?? []).some(
    id => trnsStore.items[id].description || trnsStore.items[id].desc,
  ),
)

const trns = computed(
  () =>
    paginatedTrnsIds.value
      .map(id => formatTrnItem(id))
      .filter(trn => trn?.id) as TrnItemFull[],
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

function setFilterBy(type: TrnType | undefined) {
  filterBy.value = type
}
</script>

<template>
  <div class="grid gap-3">
    <UiTitle v-if="isShowHeader">
      <div class="flex items-baseline gap-2">
        <div>{{ $t("trns.title") }}</div>
        <div v-if="selectedIds.length > 0" class="text-2xs">
          {{ paginatedTrnsIds.length }} / {{ selectedIds.length }}
        </div>
      </div>
    </UiTitle>

    <UiTabs3 v-if="isShowFilter">
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
      v-if="isShowFilter && isTrnsWithDescription && selectedIds.length > 0"
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
      class="flex-center h-full pb-2"
    >
      <div class="py-3 text-center">
        <Icon name="mdi:palm-tree" size="48" />
        <div class="text-md">
          {{ $t("trns.noTrns") }}
        </div>
      </div>
    </div>

    <div>
      <TrnsItemWrap
        v-for="trnItem in trns"
        :key="trnItem.id"
        :alt="props.alt"
        :trnId="trnItem.id"
        :trnItem="trnItem"
        :date="formatDate(trnItem.date, 'trnItem')"
      />
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
