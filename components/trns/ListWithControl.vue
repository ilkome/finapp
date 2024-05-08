<script setup lang="ts">
import type { MoneyTypeNumber } from '~/components/stat/types'
import type { TrnId, TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = withDefaults(
  defineProps<{
    defaultFilterTrnsPeriod?: string
    initTrnType?: TrnType | MoneyTypeNumber
    isFilterByDay?: boolean
    isShowGroupSum?: boolean
    size?: number
    trnsClassNames?: string
    trnsIds: TrnId[]
  }>(),
  {
    defaultFilterTrnsPeriod: 'all',
    size: 50,
    trnsClassNames: '',
  },
)

const emit = defineEmits<{
  onChangePeriod: [period: string]
  onClickEdit: [e: Event]
}>()

const trnsStore = useTrnsStore()
const filterBy = ref(props.initTrnType)

const filteredTrnsIds = computed(() => {
  if (filterBy.value === undefined)
    return props.trnsIds

  return props.trnsIds.filter(
    (id: TrnId) => trnsStore.items[id].type === filterBy.value,
  )
})

function setFilterBy(type: TrnType | undefined) {
  filterBy.value = type
}

function onClickEdit(props) {
  emit('onClickEdit', props)
}

const isShown = ref(true)
</script>

<template>
  <div>
    <div class="flex flex-col gap-2 h-full max-w-md">
      <!-- Header -->
      <div
        v-if="trnsIds.length > 0 || defaultFilterTrnsPeriod"
        class="flex items-center justify-between gap-2"
      >
        <!-- Title -->
        <UiTitle @click="isShown = !isShown">
          {{ $t("trns.inPeriodTitle") }}: {{ filteredTrnsIds.length }}
        </UiTitle>

        <div v-if="isShown && defaultFilterTrnsPeriod">
          <UiTabs2 class="gap-1">
            <UiTabsItem2
              :isActive="defaultFilterTrnsPeriod === 'period'"
              @click="emit('onChangePeriod', 'period')"
            >
              {{ $t("dates.period") }}
            </UiTabsItem2>
            <UiTabsItem2
              :isActive="defaultFilterTrnsPeriod === 'all'"
              @click="emit('onChangePeriod', 'all')"
            >
              {{ $t("common.all") }}
            </UiTabsItem2>
          </UiTabs2>
        </div>
      </div>

      <!-- Content Before -->
      <slot name="contentBefore" />

      <!-- Type Selector -->
      <div
        v-if="trnsIds.length > 0 && isShown"
      >
        <UiTabs>
          <UiTabsItem2
            :isActive="filterBy === undefined"
            @click="setFilterBy(undefined)"
          >
            {{ $t("common.all") }}
          </UiTabsItem2>
          <UiTabsItem2
            :isActive="filterBy === 0"
            @click="setFilterBy(0)"
          >
            {{ $t("money.expense") }}
          </UiTabsItem2>
          <UiTabsItem2
            :isActive="filterBy === 1"
            @click="setFilterBy(1)"
          >
            {{ $t("money.income") }}
          </UiTabsItem2>
          <UiTabsItem2
            :isActive="filterBy === 2"
            @click="setFilterBy(2)"
          >
            {{ $t("transfer.titleMoney") }}
          </UiTabsItem2>
        </UiTabs>
      </div>

      <div
        v-if="isShown"
        class="scroll scrollerBlock js-scroll-trns h-full overflow-y-auto"
      >
        <!-- Nothing -->
        <div v-if="filteredTrnsIds.length === 0" class="flex-center h-full pb-2">
          <div class="py-3 text-center">
            <div class="mdi mdi-palm-tree text-7xl" />
            <div class="text-md">
              {{ $t("trns.noTrns") }}
            </div>
          </div>
        </div>

        <!-- List -->
        <div v-else class="h-full">
          <div :class="props.trnsClassNames">
            <TrnsList
              :isFilterByDay="isFilterByDay"
              :isShowGroupSum="isShowGroupSum"
              :size="props.size"
              :trnsIds="filteredTrnsIds"
              isShowFilter
              uiHistory
              @onClickEdit="onClickEdit"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="stylus" scoped>
@import "../assets/stylus/variables"

.scroll
  overflow hidden
  overflow-y auto
  height 100%
  scrollbar()
</style>
