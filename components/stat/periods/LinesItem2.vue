<script setup lang="ts">
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useCategoriesStore } from '~/components/categories/useCategories'
import type { CategoryId } from '~/components/categories/types'
import type { TotalCategory } from '~/components/stat/useNewStat'

const props = defineProps<{
  biggestCatNumber: number
  isActive?: boolean
  isShowLinesChart?: boolean
  item: TotalCategory
}>()

const emit = defineEmits<{
  click: [categoryId: CategoryId]
}>()
const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()
</script>

<template>
  <div
    class="grid gap-2 group text-secondary2 hocus_bg-item-5 py-3 px-4 rounded-md bg-item-4"
  >
    <Icon
      :color="categoriesStore.items[props.item.id]?.color"
      :name="categoriesStore.items[props.item.id]?.icon.replace('mdi mdi-', 'mdi:')"
      size="22"
    />

    <div class="grid gap-1">
      <!-- Parent category name -->
      <div
        v-if="categoriesStore.items[props.item.id].parentId"
        class="text-2xs"
      >
        {{ categoriesStore.items[categoriesStore.items[props.item.id].parentId].name }}
      </div>

      <!-- Category name -->
      <div class="flex items-center gap-0.5 text-secondary text-sm leading-none">
        {{ categoriesStore.items[props.item.id].name }}
        <!-- Has childs -->
        <div
          v-if="categoriesStore.items[props.item.id].parentId === 0"
          class="text-md font-unica"
        >
          ...
        </div>
      </div>

      <div class="grow pr-1 opacity-90">
        <Amount
          align="left"
          :amount="props.item.value"
          :type="props.item.value >= 0 ? 1 : 0"
          :currencyCode="currenciesStore.base"
          :isShowBaseRate="false"
          colorize="income"
        />
      </div>
    </div>
  </div>
</template>
