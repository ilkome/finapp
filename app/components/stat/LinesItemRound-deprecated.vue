<script setup lang="ts">
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import type { CategoryId } from '~/components/categories/types'
import type { TotalCategory } from '~/components/stat/types'

const props = defineProps<{
  biggestCatNumber: number
  isActive?: boolean
  item: TotalCategory
}>()

const emit = defineEmits<{
  click: [categoryId: CategoryId]
}>()

const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()
const trnsStore = useTrnsStore()

const category = computed(() => {
  const isOneCategory = props.item.trnsIds.length <= 1
  const isParentCategory = categoriesStore.items[props.item.id]?.parentId === 0

  const isDifferentCategories = props.item.trnsIds.some(id =>
    trnsStore.items[id]?.categoryId !== trnsStore.items[props.item.trnsIds[0]]?.categoryId)

  if (isParentCategory && (!isDifferentCategories || isOneCategory)) {
    const parentId = trnsStore.items[props.item.trnsIds[0]].categoryId
    return categoriesStore.items[parentId]
  }

  return categoriesStore.items[props.item.id]
})
</script>

<template>
  <div
    class="relative grid gap-2 group text-secondary2 hocus:bg-item-5 py-2.5 p-3 rounded-md bg-item-4"
    @click="emit('click', props.item.id)"
  >
    <div
      class="size-8"
    >
      <UiIconBase
        :name="category?.icon"
        :color="category?.color"
        invert
      />
    </div>

    <div class="absolute right-2 top-2 opacity-40">
      <UiIconBase
        v-if="category?.parentId"
        :name="categoriesStore.items[category?.parentId]?.icon"
        class="text-2xs"
        color="text-secondary2"
      />
    </div>

    <div class="grid gap-0 pt-2 pb-1">
      <!-- Parent category name -->
      <div
        v-if="category?.parentId"
        class="text-2xs"
      >
        {{ categoriesStore.items[category?.parentId].name }}
      </div>

      <!-- Category name -->
      <div class="flex items-center gap-0.5 text-secondary text-sm leading-none">
        {{ category.name }}
        <!-- Has childs -->
        <div
          v-if="category?.parentId === 0"
          class="text-md font-secondary"
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
