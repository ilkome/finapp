<script setup lang="ts">
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import type { CategoryId } from '~/components/categories/types'
import type { TotalCategory } from '~/components/stat/types'

const props = defineProps<{
  isHideAmount?: boolean
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
    class="text-2 hocus:bg-item-5 bg-item-4 hover:bg-item-5 relative flex items-center gap-2 overflow-hidden rounded-full p-1"
    @click="emit('click', props.item.id)"
  >
    <div
      :style="{ backgroundColor: category?.color }"
      class="absolute inset-0 size-full opacity-10"
    />

    <div
      class="size-5"
    >
      <UiIconBase
        :name="category?.icon"
        :color="category?.color"
        class="!text-xs"
        invert
      />
    </div>

    <div class="text-xs">
      {{ category.name }}
    </div>

    <div
      v-if="!props.isHideAmount"
      class="pr-1 opacity-90"
    >
      <Amount
        :amount="props.item.value"
        :type="props.item.value >= 0 ? 1 : 0"
        :currencyCode="currenciesStore.base"
        :isShowBaseRate="false"
        align="left"
        variant="sm"
        colorize="income"
      />
    </div>
  </div>
</template>
