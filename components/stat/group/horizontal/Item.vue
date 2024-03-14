<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import useStatPage from '~/components/stat/useStatPage'
import { getWidthPercent } from '~/components/stat/helpers'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useFilter } from '~/components/filter/useFilter'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import type { MoneyTypeNumber, MoneyTypeSlug } from '~/components/stat/types'
import { useStat } from '~/components/stat/useStat'

const props = defineProps<{
  biggest: number
  total: number
  moneyTypeNumber: MoneyTypeNumber
  moneyTypeSlug: MoneyTypeSlug
  category: CategoryItem
  categoryId: CategoryId
}>()

const categoriesStore = useCategoriesStore()
const trnsStore = useTrnsStore()
const { statCurrentPeriod } = useStat()

const { statPage } = useStatPage()
const { setCategoryId } = useFilter()
const currenciesStore = useCurrenciesStore()
const isShowInside = ref(false)

const styles = computed(() => ({
  width: getWidthPercent(props.total, props.biggest),
  background: props.category.color,
}))

const isCategoryHasChildren = computed(() =>
  categoriesStore.isCategoryHasChildren(props.categoryId),
)

function toggleShowInside() {
  isShowInside.value = !isShowInside.value
}

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

const biggestAmount = computed(() => statCurrentPeriod.value[props.moneyTypeSlug].biggest)

const statCategories = computed(() => {
  return categoriesStore.getChildCategoriesIds(props.categoryId)
    .reduce((acc, id) => {
      const trnsIds = getTrnsByCategoryId(id)

      if (trnsIds.length > 0)
        acc.push(categoriesStore.getCategoryStat({ categoryId: id, trnsIds }))
      return acc
    }, [])
    .sort((a, b) => b[props.moneyTypeSlug] - a[props.moneyTypeSlug])
})

function getTrnsByCategoryId(categoryId: CategoryId) {
  const trnsItems = trnsStore.items
  // Note: same performance as in one filter but better readability
  return trnsStore.selectedTrnsIdsWithDate
    .filter(id => trnsItems[id].categoryId === categoryId)
    .filter(id => trnsItems[id].type === props.moneyTypeNumber)
}
</script>

<template>
  <div class="statItem" @click="toggleShowInside">
    <div
      class="z-[9] flex items-center justify-between space-x-3 rounded-md bg-item-3 px-2 py-2 hocus_bg-item-5"
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
      class="-mt-[1px] overflow-hidden rounded-b-md"
      @click.stop=""
    >
      <StatGroupHorizontalItemCatItem
        v-for="statCategory in statCategories"
        :key="statCategory.categoryId"
        :biggest="biggestAmount"
        :category="categoriesStore.items[statCategory.categoryId]"
        :categoryId="statCategory.categoryId"
        :total="statCategory[moneyTypeSlug]"
        :moneyTypeNumber="moneyTypeNumber"
        :moneyTypeSlug="moneyTypeSlug"
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
