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
  moneyTypeNumber: MoneyTypeNumber
  total: number
}>()

const filter = inject('filter') as FilterProvider

const categoriesStore = useCategoriesStore()
const { trnFormCreate } = useTrnForm()

const hasChildren = computed(() =>
  categoriesStore.hasChildren(props.categoryId),
)
</script>

<template>
  <div
    v-if="category"
    class="flex flex-col flex-center group hocus_bg-item-5 p-2 rounded-lg"
    data-long-press-delay="300"
    @click="trnFormCreate({ categoryId })"
  >
    <Icon
      :color="category.color"
      :name="category.icon.replace('mdi mdi-', 'mdi:')"
      size="24"
      @click="filter.toggleCategoryId(categoryId)"
    />

    <div class="pt-1 text-xs text-secondary leading-none">
      {{ category.name }}{{ hasChildren ? "..." : "" }}
    </div>

    <Amount
      :amount="total"
      :currencyCode="currencyCode"
      :type="moneyTypeNumber"
      :isShowBaseRate="false"
    />
  </div>
</template>
