<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import type { MoneyTypeNumber, MoneyTypeSlug } from '~/components/stat/types'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import type { FilterProvider } from '~/components/filter/useFilter'
import type { TrnId } from '~/components/trns/types'

const props = defineProps<{
  biggest: number
  total: number
  trnsIds: TrnId[]
  moneyTypeNumber: MoneyTypeNumber
  moneyTypeSlug: MoneyTypeSlug
  category: CategoryItem
  categoryId: CategoryId
}>()

const filter = inject('filter') as FilterProvider

const categoriesStore = useCategoriesStore()

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

function getWidthPercent(value: number, biggest: number): string {
  return `${(Math.abs(value) / Math.abs(biggest)) * 100}%`
}
</script>

<template>
  <div
    class="_bg-item-4 rounded-lg"
    @click="toggleShowInside"
  >
    <div
      class="group flex items-center justify-between space-x-3 rounded-md px-1 py-1 hocus_bg-item-5"
    >
      <Icon2
        :categoryId="categoryId"
        :color="category.color"
        :icon="category.icon"
        @click="filter.toggleCategoryId(categoryId)"
      />

      <div class="grow">
        <div class="flex space-x-3 pr-1">
          <div class="flex grow items-baseline gap-2">
            <div class="text-sm leading-none text-secondary">
              {{ category.name }}{{ isCategoryHasChildren ? "..." : "" }}
            </div>

            <div
              v-if="category.parentId"
              class="grow truncate text-xs text-item-2 opacity-60"
            >
              {{ categoriesStore.items[category.parentId].name }}
            </div>
          </div>

          <Amount
            :amount="total"
            :currencyCode="currenciesStore.base"
            :type="moneyTypeNumber"
            :isShowBaseRate="false"
          />
        </div>

        <div class="mt-1 mt-1 rounded-[3px] bg-item-5">
          <div class="h-[4px] min-w-[2px] rounded-[3px]" :style="styles" />
        </div>
      </div>
    </div>

    <!-- Inside -->
    <div
      v-if="isShowInside"
      class="scrollbar _bg-item-4 ml-10 max-h-[40vh] overflow-hidden overflow-y-auto pb-1 pr-1"
      @click.stop=""
    >
      <TrnsList :trnsIds="trnsIds" :isShowGroupDate="false" uiCat />
    </div>
  </div>
</template>
