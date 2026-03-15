<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { CategoryWithData } from '~/components/stat/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useCategoryLongPress } from '~/components/stat/categories/useCategoryLongPress'
import { getTrnTypeByAmount } from '~/components/trns/types'

const props = defineProps<{
  isShowAmount?: boolean
  item: CategoryWithData
}>()

const emit = defineEmits<{
  click: [categoryId: CategoryId]
}>()

const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()

const category = computed(() => categoriesStore.items[props.item.id])

const { longPressRef } = useCategoryLongPress(
  () => props.item.id,
  () => emit('click', props.item.id),
)
</script>

<template>
  <div
    v-if="category"
    ref="longPressRef"
    class="dark:bg-item-3 relative flex items-center gap-2 overflow-hidden rounded-2xl border border-transparent p-1 pr-3 hover:bg-(--item-5)"
  >
    <div
      :style="{ backgroundColor: category?.color }"
      class="absolute inset-0 size-full opacity-10"
    />

    <div class="size-6">
      <UiIconBase
        :name="category?.icon"
        :color="category?.color"
        :size="14"
        class="!w-6 p-1"
        invert
      />
    </div>

    <div>
      <div class="text-xs">
        {{ category.name }}
      </div>

      <div
        v-if="props.isShowAmount"
        class="opacity-90"
      >
        <Amount
          :amount="props.item.value"
          :type="getTrnTypeByAmount(props.item.value)"
          :currencyCode="currenciesStore.base"
          :isShowBaseRate="false"
          :isShowSymbol="false"
          align="left"
          variant="xs"
          colorize="income"
        />
      </div>
    </div>
  </div>
</template>
