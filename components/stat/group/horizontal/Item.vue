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
  <div
    class="bg-item-4 rounded-lg" :class="[
      { 'bg-item-4': isShowInside },
    ]"
    @click="toggleShowInside"
  >
    <div
      class="group flex items-center justify-between space-x-3 rounded-md px-2 py-2 hocus_bg-item-5"
    >
      <!-- Icon -->
      <div
        class="group-hocus_bg-item-6 flex size-8 bg-item-5 cursor-pointer items-center justify-center rounded-full text-xl leading-none hocus_scale-110"
        :style="{ color: category.color }"
        @click.stop="setCategoryId(categoryId)"
      >
        <div :class="category.icon" />
      </div>

      <div class="grow">
        <div class="flex space-x-3 pr-1">
          <div class="grow flex items-baseline gap-2">
            <div class="text-sm leading-none text-secondary">
              {{ category.name }}{{ isCategoryHasChildren ? "..." : "" }}
            </div>

            <div v-if="category.parentId" class="opacity-60 grow truncate text-xs text-item-2 dark_text-neutral-400">
              {{ categoriesStore.items[category.parentId].name }}
            </div>
          </div>

          <!-- <div
            class="flex grow pl-1 items-baseline space-x-2 overflow-hidden truncate text-sm text-neutral-700 dark_text-neutral-400"
          >
            {{ category.name }}{{ isCategoryHasChildren ? "..." : "" }}
          </div> -->

          <Amount
            :amount="total"
            :currencyCode="currenciesStore.base"
            :type="moneyTypeNumber"
            :isShowBaseRate="false"
          />
        </div>

        <div class="mt-1 mt-1 bg-item-5 rounded-[3px]">
          <div class="h-[4px] min-w-[2px] rounded-[3px]" :style="styles" />
        </div>
      </div>
    </div>

    <!-- Inside -->
    <div
      v-if="isShowInside"
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

      <div v-if="!isCategoryHasChildren" class="pl-12 pr-1 pb-1 max-h-[60vh] overflow-hidden overflow-y-auto bg-item-4">
        <TrnsList
          :trnsIds="trnsIds"
          :isShowGroupDate="false"
          uiCat
        />
      </div>
    </div>
  </div>
</template>
