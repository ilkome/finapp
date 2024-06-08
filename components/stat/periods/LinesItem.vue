<script setup lang="ts">
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useCategoriesStore } from '~/components/categories/useCategories'
import type { TrnId } from '~/components/trns/types'
import type { CategoryId } from '~/components/categories/types'
import type { TotalCategory } from '~/components/stat/useNewStat'

const props = defineProps<{
  allTrnsIds?: TrnId[]
  biggestCatNumber: number
  cats: TotalCategory[]
  isActive?: boolean
  isGroupCategoriesByParent?: boolean
  isOpenedAll?: boolean
  isShowLinesChart?: boolean
  item: unknown
  openedCats: CategoryId[]
  openedTrns: CategoryId[]
  trnsIds: TrnId[]
}>()

const emit = defineEmits<{
  click: [categoryId: CategoryId]
}>()
const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()
const trnsStore = useTrnsStore()

function getBarStyle(amount: number, categoryId: CategoryId) {
  return {
    backgroundColor: categoriesStore.items[categoryId].color,
    width: `${(Math.abs(amount) / Math.abs(props.biggestCatNumber ?? 0)) * 100}%`,
  }
}

function getTrns(categoryId: CategoryId) {
  return trnsStore.getStoreTrnsIds({
    categoriesIds: [categoryId],
    trnsIds: props.trnsIds,
  }, { includesChildCategories: true })
}
</script>

<template>
  <div
    :class="{
      'bg-item-4 rounded-md mb-2': props.isActive,
    }"
    class="group"
  >
    <UiElement
      :isShowLine="!props.isShowLinesChart"
      class="relative"
      @click="emit('click', props.item.id)"
    >
      <template #line>
        <div
          v-if="props.isShowLinesChart"
          class="absolute left-0 bottom-2 w-full pl-11 pr-3 rounded-lg overflow-hidden"
        >
          <div class="bg-item-3 rounded-lg overflow-hidden">
            <div
              class="h-1 opacity-60"
              :style="getBarStyle(props.item.value, props.item.id)"
            />
          </div>
        </div>
      </template>

      <template #leftIcon>
        <Icon
          :color="categoriesStore.items[props.item.id]?.color"
          :name="categoriesStore.items[props.item.id]?.icon.replace('mdi mdi-', 'mdi:')"
        />
      </template>

      <div
        :class="{
          'pb-2 pt-1': props.isShowLinesChart,
        }"
      >
        <!-- Parent category name -->
        <div
          v-if="categoriesStore.items[props.item.id].parentId"
          class="text-2xs"
        >
          {{ categoriesStore.items[categoriesStore.items[props.item.id].parentId].name }}
        </div>

        <!-- Category name -->
        <div class="flex items-center gap-2 text-secondary text-sm leading-none">
          {{ categoriesStore.items[props.item.id].name }}
          <!-- Has childs -->
          <div
            v-if="categoriesStore.items[props.item.id].parentId === 0"
            class="text-md font-unica"
          >
            ...
          </div>
        </div>
      </div>

      <div
        :class="{
          'pb-1': props.isShowLinesChart,
        }"
        class="grow pr-1 opacity-90"
      >
        <Amount
          :amount="props.item.value"
          :type="props.item.value >= 0 ? 1 : 0"
          :currencyCode="currenciesStore.base"
          :isShowBaseRate="false"
          colorize="income"
        />
      </div>
    </UiElement>

    <div v-if="openedCats.includes(props.item.id) || openedTrns.includes(props.item.id)">
      <LazyStatCategoryChartWrap
        :categoryId="props.item.id"
        :trnsIds="props.allTrnsIds ?? []"
      />
    </div>

    <div
      v-if="openedCats.includes(props.item.id)"
      class="pl-4"
    >
      <!-- <StatPeriodsLines2
            v-if="!!categoriesStore.items[props.item.id]?.childIds?.length"
            :trnsIds="getTrns(props.item.id) ?? []"
            :isShowLinesChart="props.isShowLinesChart"
          /> -->
    </div>

    <div
      v-if="openedTrns.includes(props.item.id)"
      class="pl-8 pt-2 pb-2"
    >
      <TrnsList
        :trnsIds="getTrns(props.item.id) ?? []"
        alt
        isHideDates
        isShowHeader
        isShowFilterByDesc
      />
    </div>
  </div>
</template>
