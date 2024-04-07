<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import type { CurrencyCode } from '~/components/currencies/types'
import type { MoneyTypeNumber } from '~/components/stat/types'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useTrnForm } from '~/components/trnForm/useTrnForm'
import type { FilterProvider } from '~/components/filter/useFilter'

const props = defineProps<{
  category: CategoryItem
  categoryId: CategoryId
  currencyCode: CurrencyCode
  total: number
  moneyTypeNumber: MoneyTypeNumber
}>()

const filter = inject('filter') as FilterProvider

const categoriesStore = useCategoriesStore()
const { trnFormCreate } = useTrnForm()

const isCategoryHasChildren = computed(() =>
  categoriesStore.isCategoryHasChildren(props.categoryId),
)
</script>

<template>
  <div
    v-if="category"
    class="flex flex-col flex-center group hocus_bg-item-5 p-2 rounded-lg"
    data-long-press-delay="300"
    @click="trnFormCreate({ categoryId })"
  >
    <Icon2
      :categoryId="categoryId"
      :color="category.color"
      :icon="category.icon"
      size="lg"
      @click="filter.toggleCategoryId(categoryId)"
    />

    <div class="pt-1 text-xs text-secondary leading-none">
      {{ category.name }}{{ isCategoryHasChildren ? "..." : "" }}
    </div>

    <Amount
      :amount="total"
      :currencyCode="currencyCode"
      :type="moneyTypeNumber"
      :isShowBaseRate="false"
    />
  </div>
</template>
