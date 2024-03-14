<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import useStatPage from '~/components/stat/useStatPage'
import { getWidthPercent } from '~/components/stat/helpers'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useFilter } from '~/components/filter/useFilter'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import type { MoneyTypeNumber, MoneyTypeSlug } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import { getTotal } from '~/components/amount/getTotal'
import { useStat } from '~/components/stat/useStat'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  biggest: number
  total: number
  moneyTypeNumber: MoneyTypeNumber
  category: CategoryItem
  categoryId: CategoryId
}>()

const categoriesStore = useCategoriesStore()
const trnsStore = useTrnsStore()
const { statCurrentPeriod } = useStat()
const walletsStore = useWalletsStore()
const moneyTypeSlug = computed<MoneyTypeSlug>(() => props.moneyTypeNumber === 1 ? 'income' : 'expense')

const { statPage } = useStatPage()
const { setCategoryId } = useFilter()
const currenciesStore = useCurrenciesStore()
const isShowInside = ref(false)

const styles = computed(() => ({
  width: getWidthPercent(props.total, props.biggest),
  background: props.category.color,
}))

// TODO: same HorizontalItem, HorizontalItemCatItem
const isCategoryHasChildren = computed(() =>
  categoriesStore.isCategoryHasChildren(props.categoryId),
)

// TODO: same HorizontalItem, HorizontalItemCatItem
const toggleShowInside = () => (isShowInside.value = !isShowInside.value)

// TODO: same HorizontalItem, HorizontalItemCatItem
const trnsIds = computed(() => {
  if (isCategoryHasChildren.value)
    return []

  return statPage.current.trnsIds
    .filter(
      id =>
        trnsStore.items[id].type === props.moneyTypeNumber
        && trnsStore.items[id].categoryId === props.categoryId,
    )
    .sort((a, b) => trnsStore.items[b].date - trnsStore.items[a].date)
})

const biggestAmount = computed(() => statCurrentPeriod.value[moneyTypeSlug.value].biggest)

const statCategories = computed(() => {
  return categoriesStore.getChildCategoriesIds(props.categoryId)
    .reduce((acc, id) => {
      const trnsIds = getTrnsByCategoryId(id)
      if (trnsIds.length > 0)
        acc.push(getCategoryStat({ categoryId: id, trnsIds }))
      return acc
    }, [])
    .sort((a, b) => b[moneyTypeSlug.value] - a[moneyTypeSlug.value])
})

function getTrnsByCategoryId(categoryId: CategoryId) {
  const trnsItems = trnsStore.items
  // Note: same performance as in one filter but better readability
  return trnsStore.selectedTrnsIdsWithDate
    .filter(id => trnsItems[id].categoryId === categoryId)
    .filter(id => trnsItems[id].type === props.moneyTypeNumber)
}

function getCategoryStat({ categoryId, trnsIds }: { categoryId: CategoryId, trnsIds: TrnId[] }) {
  const trnsItems = trnsStore.items
  const walletsItems = walletsStore.items
  const baseCurrencyCode = currenciesStore.base
  const rates = currenciesStore.rates

  const total = getTotal({
    baseCurrencyCode,
    rates,
    trnsIds,
    trnsItems,
    walletsItems,
  })

  return {
    categoryId,
    total: total.sumTransactions,
    income: total.incomeTransactions,
    expense: total.expenseTransactions,
  }
}
</script>

<template>
  <div class="statItem" @click="toggleShowInside">
    <div
      class="ins z-[9] flex items-center justify-between space-x-3 rounded-md bg-item-3 px-2 py-2 hocus_bg-item-5"
      :class="[
        { 'rounded-b-none shadow-xl': isShowInside },
        { 'shadow-sm': !isShowInside },
      ]"
    >
      <!-- Icon -->
      <div
        class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-xl leading-none text-neutral-50"
        :style="{ background: category.color }"
        @click.stop="setCategoryId(categoryId)"
      >
        <div :class="category.icon" />
      </div>

      <div class="grow">
        <div class="flex space-x-3">
          <div
            class="flex grow items-baseline space-x-2 overflow-hidden truncate text-sm text-neutral-700 dark_text-neutral-400"
          >
            {{ category.name }}{{ isCategoryHasChildren ? "..." : "" }}
          </div>

          <Amount
            :amount="total"
            :currencyCode="currenciesStore.base"
            :type="moneyTypeNumber"
            :isShowBaseRate="false"
          />
        </div>

        <div class="mt-1 pt-1">
          <div class="h-[4px] min-w-[2px] rounded-[3px]" :style="styles" />
        </div>
      </div>
    </div>

    <!-- Inside -->
    <div
      v-if="isShowInside"
      class="-mt-[1px] overflow-hidden rounded-b-md dark_border-neutral-800"
      @click.stop=""
    >
      <StatGroupHorizontalItemCatItem
        v-for="statCategory in statCategories"
        :key="statCategory.categoryId"
        :biggest="biggestAmount"
        :category="categoriesStore.items[statCategory.categoryId]"
        :categoryId="categoryId"
        :total="statCategory[moneyTypeSlug]"
        :moneyTypeNumber="moneyTypeNumber"
      />

      <div v-if="!isCategoryHasChildren" class="max-h-[60vh] overflow-hidden">
        <TrnsList
          :trnsIds="trnsIds"
          :isShowGroupDate="false"
          classes="md_grid-cols-1"
          uiCat
        />
      </div>
    </div>
  </div>
</template>
