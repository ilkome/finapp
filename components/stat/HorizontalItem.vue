<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import type { MoneyTypeNumber, MoneyTypeSlug } from '~/components/stat/types'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useFilter } from '~/components/filter/useFilter'
import { useStat } from '~/components/stat/useStatStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import type { TrnId } from '~/components/trns/types'

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
const statStore = useStat()

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

  return trnsStore.filteredTrnsIds
    .filter(
      id =>
        trnsStore.items[id].type === props.moneyTypeNumber
        && trnsStore.items[id].categoryId === props.categoryId,
    )
    .sort((a, b) => trnsStore.items[b].date - trnsStore.items[a].date)
})

const biggestAmount = computed(
  () => statStore.statCurrentPeriod[props.moneyTypeSlug].biggest,
)

const statCategories = computed(() => {
  return categoriesStore
    .getChildCategoriesIds(props.categoryId)
    .reduce((acc, id) => {
      const trnsIds = getTrnsByCategoryId(id)

      if (trnsIds.length > 0)
        acc.push(categoriesStore.getCategoryStat({ categoryId: id, trnsIds }))
      return acc
    }, [])
    .sort((a, b) => b[props.moneyTypeSlug] - a[props.moneyTypeSlug])
})

function getTrnsByCategoryId(categoryId: CategoryId) {
  return trnsStore.selectedTrnsIdsWithDate
    .filter((id: TrnId) => trnsStore.items[id].categoryId === categoryId)
    .filter((id: TrnId) => trnsStore.items[id].type === props.moneyTypeNumber)
}

function getWidthPercent(value: number, biggest: number): string {
  return `${Math.abs(value) / Math.abs(biggest) * 100}%`
}
</script>

<template>
  <div
    class="rounded-lg bg-item-4"
    @click="toggleShowInside"
  >
    <div
      class="group flex items-center justify-between space-x-3 rounded-md px-2 py-2 hocus_bg-item-5"
    >
      <Icon2
        :categoryId="categoryId"
        :color="category.color"
        :icon="category.icon"
        @click="setCategoryId"
      />

      <div class="grow">
        <div class="flex space-x-3 pr-1">
          <div class="flex grow items-baseline gap-2">
            <div class="text-sm leading-none text-secondary">
              {{ category.name }}{{ isCategoryHasChildren ? "..." : "" }}
            </div>

            <div
              v-if="category.parentId"
              class="grow truncate text-xs text-item-2 opacity-60 dark_text-neutral-400"
            >
              {{ categoriesStore.items[category.parentId].name }}
            </div>
          </div>

          <Amount
            :amount="total"
            :currencyCode="currenciesStore.base"
            :type="moneyTypeNumber"
            :isShowBaseRate="false"
            @click.stop="console.log('click')"
          />
        </div>

        <div class="mt-1 mt-1 rounded-[3px] bg-item-5">
          <div class="h-[4px] min-w-[2px] rounded-[3px]" :style="styles" />
        </div>
      </div>
    </div>

    <!-- Inside -->
    <div v-if="isShowInside" @click.stop="">
      <StatHorizontalItemIn
        v-for="statCategory in statCategories"
        :key="statCategory.categoryId"
        :biggest="biggestAmount"
        :category="categoriesStore.items[statCategory.categoryId]"
        :categoryId="statCategory.categoryId"
        :total="statCategory[moneyTypeSlug]"
        :moneyTypeNumber="moneyTypeNumber"
        :moneyTypeSlug="moneyTypeSlug"
      />

      <div
        v-if="!isCategoryHasChildren"
        class="max-h-[40vh] scrollbar overflow-hidden overflow-y-auto rounded-xl bg-item-4 pb-1 pl-12 pr-1"
      >
        <TrnsList :trnsIds="trnsIds" :isShowGroupDate="false" uiCat />
      </div>
    </div>
  </div>
</template>
