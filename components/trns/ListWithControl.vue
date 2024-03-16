<script setup lang="ts">
import type { TrnId, TrnType } from '~/components/trns/types'
import { useFilter } from '~/components/filter/useFilter'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = withDefaults(
  defineProps<{
    trnsIds: TrnId[] | false
    trnsClassNames?: string
    defaultFilterTrnsPeriod?: string
    isFilterByDay?: boolean
    isShowGroupSum?: boolean
  }>(),
  {
    trnsClassNames: 'grid md_grid-cols-2 md_gap-x-20',
  },
)
const emit = defineEmits(['onClickEdit'])

const filterStore = useFilter()
const trnsStore = useTrnsStore()

const filterTrnsType = ref<TrnType | null>(null)
const filterTrnsPeriod = ref(props.defaultFilterTrnsPeriod)

// Return to filter 'period', when global filter params changed
watch(() => filterStore.isShow, () => (filterTrnsPeriod.value = 'period'))

const filteredTrnsIds = computed(() => {
  const trnsIds
    = props.defaultFilterTrnsPeriod && filterTrnsPeriod.value === 'all'
      ? trnsStore.allTrnsIdsWithFilter
      : props.trnsIds

  if (filterTrnsType.value === null)
    return trnsIds

  return trnsIds.filter(
    (id: TrnId) => trnsStore.items[id].type === filterTrnsType.value,
  )
})

const trnsCount = computed(() => filteredTrnsIds.value.length)

function setFilterTrnsType(type: TrnType | null) {
  filterTrnsType.value = type
}

function onClickEdit(props) {
  emit('onClickEdit', props)
}
</script>

<template>
  <div class="grid h-full grid-rows-[auto,1fr] overflow-hidden">
    <!-- Header -->
    <div>
      <div
        v-if="trnsIds.length > 0 || defaultFilterTrnsPeriod"
        class="flex items-center justify-between gap-2 !pb-3 pb-2"
      >
        <!-- Title -->
        <UiTitle>
          <div class="flex gap-2">
            {{ $t("trns.inPeriodTitle") }}:
          </div>
          <div>{{ trnsCount }}</div>
        </UiTitle>

        <div v-if="defaultFilterTrnsPeriod" class="div">
          <UiTabs2>
            <UiTabsItem2
              :isActive="filterTrnsPeriod === 'period'"
              @click="filterTrnsPeriod = 'period'"
            >
              {{ $t("dates.period") }}
            </UiTabsItem2>
            <UiTabsItem2
              :isActive="filterTrnsPeriod === 'all'"
              @click="filterTrnsPeriod = 'all'"
            >
              {{ $t("common.all") }}
            </UiTabsItem2>
          </UiTabs2>
        </div>
      </div>

      <!-- Type Selector -->
      <div v-if="trnsIds.length > 0" class="pb-2">
        <UiTabs>
          <UiTabsItem
            :isActive="filterTrnsType === null"
            @click="setFilterTrnsType(null)"
          >
            {{ $t("common.all") }}
          </UiTabsItem>
          <UiTabsItem
            :isActive="filterTrnsType === 0"
            @click="setFilterTrnsType(0)"
          >
            {{ $t("money.expense") }}
          </UiTabsItem>
          <UiTabsItem
            :isActive="filterTrnsType === 1"
            @click="setFilterTrnsType(1)"
          >
            {{ $t("money.income") }}
          </UiTabsItem>
          <UiTabsItem
            :isActive="filterTrnsType === 2"
            @click="setFilterTrnsType(2)"
          >
            {{ $t("transfer.titleMoney") }}
          </UiTabsItem>
        </UiTabs>
      </div>
    </div>

    <div class="scroll scrollerBlock h-full h-full overflow-y-auto">
      <!-- Nothing -->
      <div v-if="trnsCount === 0" class="flex-center h-full pb-2">
        <div class="py-3 text-center">
          <div class="mdi mdi-palm-tree text-7xl" />
          <div class="text-md">
            {{ $t("trns.noTrns") }}
          </div>
        </div>
      </div>

      <!-- List -->
      <div v-else class="h-full pb-10">
        <div :class="trnsClassNames">
          <TrnsList
            :isFilterByDay="isFilterByDay"
            :isShowGroupSum="isShowGroupSum"
            :size="50"
            :trnsIds="filteredTrnsIds"
            isShowFilter
            uiHistory
            @onClickEdit="onClickEdit"
          />
        </div>
      </div>
    </div>
  </div>
</template>
