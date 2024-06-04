<script setup lang="ts">
import type { MoneyTypeSlugSum } from '~/components/stat/types'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import type { CategoryId } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategories'
import useAmount from '~/components/amount/useAmount'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import type { TrnId } from '~/components/trns/types'

const props = defineProps<{
  isGroupCategoriesByParent?: boolean
  isOpenedAll?: boolean
  isShowLinesChart?: boolean
  trnsIds: TrnId[]
  type?: MoneyTypeSlugSum
}>()

const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()
const trnsStore = useTrnsStore()
const { getTotalOfTrnsIds } = useAmount()

const cats = computed(() => getCats(props.trnsIds ?? [], props.isGroupCategoriesByParent))
const biggest = computed(() => cats.value.at(0)?.value ?? 0)

const openedCats = ref<CategoryId[]>([])
const openedTrns = ref<CategoryId[]>([])

export interface TotalCategories {
  expense: TotalCategory[]
  income: TotalCategory[]
}

export interface TotalCategory {
  id: CategoryId
  trnsIds: TrnId[]
  value: number
}

function getCats(trnsIds: TrnId[], isGrouped: boolean) {
  const categoriesWithTrns = trnsIds?.reduce(
    (prev, trnId) => {
      const categoryId = trnsStore.items[trnId]?.categoryId

      if (categoriesStore.transferCategoriesIds.includes(categoryId))
        return prev

      if (isGrouped) {
        const trnBaseCategory = categoriesStore.items[categoryId]

        const newCategoryId
          = trnBaseCategory.parentId === 0
            ? trnsStore.items[trnId]?.categoryId
            : trnBaseCategory.parentId

        prev[newCategoryId] ??= []
        prev[newCategoryId].push(trnId)
        return prev
      }

      prev[categoryId] ??= []
      prev[categoryId].push(trnId)
      return prev
    },
    {} as Record<CategoryId, TrnId[]>,
  )

  const categories = Object.keys(categoriesWithTrns).reduce((acc, categoryId) => {
    const totalInCategory = getTotalOfTrnsIds(categoriesWithTrns[categoryId])

    acc[categoryId] = {
      id: categoryId,
      trnsIds: categoriesWithTrns[categoryId],
      value: totalInCategory.sum,
    }

    return acc
  }, {} as Record<CategoryId, TotalCategory>)

  return Object.keys(categories)
    .sort((a, b) => {
      // Sort positive values from biggest to smallest
      if (categories[a].value >= 0 && categories[b].value >= 0) {
        return categories[b].value - categories[a].value
      }
      // Sort negative values from smallest to biggest
      else if (categories[a].value < 0 && categories[b].value < 0) {
        return categories[a].value - categories[b].value
      }
      // Keep positive values before negative values
      else if (categories[a].value >= 0 && categories[b].value < 0) {
        return -1
      }
      // Keep negative values after positive values
      else {
        return 1
      }
    })
    .reduce(
      (prev, categoryId) => {
        prev.push(categories[categoryId])
        return prev
      },
      [] as TotalCategory[],
    )
}

function getBarStyle(amount: number, categoryId: CategoryId) {
  return {
    backgroundColor: categoriesStore.items[categoryId].color,
    width: `${(Math.abs(amount) / Math.abs(biggest.value ?? 0)) * 100}%`,
  }
}

function getTrns(categoryId: CategoryId) {
  return trnsStore.getStoreTrnsIds({
    categoriesIds: [categoryId],
    trnsIds: props.trnsIds,
  }, { includesChildCategories: true })
}

watch(cats, () => {
  if (props.isOpenedAll) {
    openedCats.value = cats.value.map(d => d.id)
  }
}, { immediate: true })

function toggleAll() {
  if (openedCats.value.length === cats.value.length) {
    openedCats.value = []
  }
  else {
    openedCats.value = cats.value.map(d => d.id)
  }
}

function onClick(item: TotalCategory) {
  const category = categoriesStore.items[item.id]

  if (category?.childIds?.length > 0) {
    openedCats.value.includes(item.id)
      ? (openedCats.value = openedCats.value.filter(d => d !== item.id))
      : openedCats.value.push(item.id)
  }

  else {
    openedTrns.value.includes(item.id)
      ? (openedTrns.value = openedTrns.value.filter(d => d !== item.id))
      : openedTrns.value.push(item.id)
  }
}
</script>

<template>
  <div>
    <slot name="contentBefore" />

    <div v-if="cats.length > 0">
      <div
        v-for="item in cats"
        :key="item.id"
        class="group"
        :class="{
          'bg-item-4 rounded-md overflow-hidden mb-2': props.isGroupCategoriesByParent && openedCats.includes(item.id),
        }"
      >
        <UiElement
          class="relative"
          :isShowLine="!props.isShowLinesChart"
          @click="onClick(item)"
        >
          <template #line>
            <div
              v-if="props.isShowLinesChart"
              class="absolute left-0 bottom-2 w-full pl-11 pr-3 rounded-lg overflow-hidden"
            >
              <div class="bg-item-3 rounded-lg overflow-hidden">
                <div
                  class="h-1 opacity-60"
                  :style="getBarStyle(item.value, item.id)"
                />
              </div>
            </div>
          </template>

          <template #leftIcon>
            <Icon
              :color="categoriesStore.items[item.id]?.color"
              :name="categoriesStore.items[item.id]?.icon.replace('mdi mdi-', 'mdi:')"
            />
          </template>

          <div
            :class="{
              'pb-2 pt-1': props.isShowLinesChart,
            }"
          >
            <!-- Parent category name -->
            <div
              v-if="categoriesStore.items[item.id].parentId"
              class="text-2xs"
            >
              {{ categoriesStore.items[categoriesStore.items[item.id].parentId].name }}
            </div>

            <!-- Category name -->
            <div class="flex items-center gap-2 text-secondary text-sm leading-none">
              {{ categoriesStore.items[item.id].name }}
              <!-- Has childs -->
              <div
                v-if="categoriesStore.items[item.id].parentId === 0"
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
              :amount="item.value"
              :currencyCode="currenciesStore.base"
              :isShowBaseRate="false"
              colorize="income"
            />
          </div>
        </UiElement>

        <div
          v-if="openedCats.includes(item.id)"
          class="pl-4"
        >
          <StatPeriodsLines2
            v-if="!!categoriesStore.items[item.id]?.childIds?.length"
            :trnsIds="getTrns(item.id) ?? []"
            :isShowLinesChart="props.isShowLinesChart"
          />
        </div>

        <div
          v-if="openedTrns.includes(item.id)"
          class="pl-8 pt-2 pb-2"
        >
          <TrnsList
            :trnsIds="getTrns(item.id) ?? []"
            alt
            isHideDates
            isShowHeader
            isShowFilterByDesc
          />
        </div>
      </div>
    </div>
  </div>
</template>
