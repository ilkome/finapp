<script setup lang="ts">
import dayjs from 'dayjs'
import { storeToRefs } from 'pinia'
import useAmount from '~/components/amount/useAmount'
import { useAppNav } from '~/components/app/useAppNav'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useFilterStore } from '~/components/filter/useFilterStore'
import { useTrnForm } from '~/components/trnForm/useTrnForm'
import type { TrnId, TrnItem } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = withDefaults(
  defineProps<{
    isFilterByDay?: boolean
    isShowFilter?: boolean
    isShowGroupDate?: boolean
    isShowGroupSum?: boolean
    limit?: number
    size?: number
    trnsIds: TrnId[]
    uiCat?: boolean
    uiHistory?: boolean
  }>(),
  {
    isShowFilter: false,
    isShowGroupDate: true,
    limit: 0,
    size: 30,
    uiHistory: false,
  },
)
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
  props.trnsIds.some(
    id => trnsStore.items[id].description || trnsStore.items[id].desc,
  ),
)

const trnsIdsWithLimit = computed(() => {
  const trnsItems = trnsStore.items

  if (
    props.isShowFilter
    && isShowTrnsWithDesc.value
    && isTrnsWithDescription.value
  ) {
    return props.trnsIds.filter(
      id => trnsItems[id].description || trnsStore.items[id].desc,
    )
  }

  if (props.limit > 0)
    return props.trnsIds.slice(0, props.limit)

  return props.trnsIds
})

const paginatedTrnsIds = computed(() =>
  trnsIdsWithLimit.value.slice(0, pageNumber.value * props.size),
)

const isShowedAllTrns = computed(
  () => paginatedTrnsIds.value.length === trnsIdsWithLimit.value.length,
)

const groupedTrns = computed(() => {
  const trnsItems = trnsStore.items
  const trnsIds = paginatedTrnsIds.value

  return trnsIds.reduce((acc, trnId) => {
    const date = dayjs(trnsItems[trnId].date).startOf('day').valueOf()
    acc[date] ??= []
    acc[date].push(trnId)
    return acc
  }, {} as Record<TrnItem['date'], TrnId[]>)
})

function showMoreTrns() {
  pageNumber.value += 1
}

function toggleTrnsWithDesc() {
  isShowTrnsWithDesc.value = !isShowTrnsWithDesc.value
}

function actions(trnItem: TrnItem) {
  return {
    onOpenDetails: () => {
      if (!trnsStore.isShownModal) {
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

<template>
  <div
    v-if="trnsIds && trnsIds.length > 0"
    class="grid"
    :class="{
      'gap-2': uiHistory,
    }"
  >
    <div v-if="isShowFilter && isTrnsWithDescription">
      <UiCheckbox
        :checkboxValue="isShowTrnsWithDesc"
        :title="$t('trns.filter.showTrnsWithDesc')"
        showCheckbox
        @onClick="toggleTrnsWithDesc"
      />
    </div>

    <div
      class="grid"
      :class="{
        'gap-4': uiHistory,
      }"
    >
      <div
        v-for="(trnsIds, date) in groupedTrns"
        :key="date"
      >
        <div
          v-if="isShowGroupDate"
          class="flex items-center px-2 pb-2 sm_px-1.5"
          @click="isFilterByDay ? filterStore.setDayDate(date) : null"
        >
          <DateTrnsDay :date="+date" class="grow" />
          <div v-if="isShowGroupSum" class="flex items-center gap-2 text-sm">
            <Amount
              v-if="getTotalOfTrnsIds(trnsIds).income !== 0"
              :amount="getTotalOfTrnsIds(trnsIds).income"
              :currencyCode="currenciesStore.base"
              :isShowBaseRate="false"
              :type="1"
              colorize="income"
            />
            <Amount
              v-if="getTotalOfTrnsIds(trnsIds).expense !== 0"
              :amount="getTotalOfTrnsIds(trnsIds).expense"
              :currencyCode="currenciesStore.base"
              :isShowBaseRate="false"
              :type="0"
            />
          </div>
        </div>

        <div>
          <TrnsItemBase
            v-for="trnId in trnsIds"
            v-if="uiHistory"
            :key="trnId"
            :trnId="trnId"
            @onClickEdit="emit('onClickEdit')"
          />
          <TrnsItemWithoutCat
            v-for="trnId in trnsIds"
            v-if="uiCat"
            :key="trnId"
            :actions="actions"
            :trnId="trnId"
          />
        </div>
      </div>
    </div>

    <div v-if="!isShowedAllTrns">
      <div
        class="flex-center grow rounded-lg bg-item-5 px-5 py-2.5 text-sm text-secondary hocus_bg-item-6"
        @click="showMoreTrns"
      >
        {{ $t("trns.more") }}
      </div>
    </div>
  </div>
</template>
