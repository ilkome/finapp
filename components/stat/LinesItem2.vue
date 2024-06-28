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
    class="relative grid gap-2 group text-secondary2 hocus:bg-item-5 py-2.5 p-3 rounded-md bg-item-4"
    @click="emit('click', props.item.id)"
  >
    <div
      class="relative size-8 flex-center"
    >
      <div
        class="rounded-full absolute inset-0 size-full opacity-90 dark_opacity-70"
        :style="{ backgroundColor: categoriesStore.items[props.item.id]?.color }"
      />

      <Icon
        class="relative"
        color="white"
        :name="categoriesStore.items[props.item.id]?.icon.replace('mdi mdi-', 'mdi:')"
        size="18"
      />
    </div>

    <div class="absolute right-2 top-2 opacity-40">
      <Icon
        v-if="categoriesStore.items[props.item.id]?.parentId"
        color="text-secondary2"
        :name="categoriesStore.items[categoriesStore.items[props.item.id]?.parentId]?.icon.replace('mdi mdi-', 'mdi:')"
        size="12"
      />
    </div>

    <div class="grid gap-0 pt-2 pb-1">
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
</template>
