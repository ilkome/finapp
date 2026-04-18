<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { CategoryWithData } from '~/components/stat/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { computeBarStyle } from '~/components/stat/categories/barUtils'
import { useCategoryLongPress } from '~/components/stat/categories/useCategoryLongPress'
import { statConfigKey } from '~/components/stat/injectionKeys'
import { getTrnTypeByAmount } from '~/components/trns/types'

const props = defineProps<{
  insideClass?: string
  insideStyle?: string
  isActive?: boolean
  isShowParent?: boolean
  item: CategoryWithData
  lineWidth?: number
  maxCategoryValues: {
    expense: number
    income: number
  }
}>()

const emit = defineEmits<{
  click: [categoryId: CategoryId]
}>()

const statConfig = inject(statConfigKey)!
const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()

const isLines = computed(() => statConfig.config.value.catsList.isLines)
const isRoundIcon = computed(() => statConfig.config.value.catsList.isRoundIcon)

const category = computed(() => categoriesStore.items[props.item.id])
const parentCategory = computed(() => {
  const pid = category.value?.parentId
  return pid ? categoriesStore.items[pid] : undefined
})

const barStyle = computed(() =>
  computeBarStyle(props.item.value, category.value?.color, props.maxCategoryValues, 'width'),
)

const { longPressRef } = useCategoryLongPress(
  () => props.item.id,
  () => emit('click', props.item.id),
)
</script>

<template>
  <div
    v-if="category"
    ref="longPressRef"
    :class="[props.insideClass, {
      '-bg-item-3 ': props.isActive,
    }]"
    :style="props.insideStyle"
    class="relative"
  >
    <slot name="before" />
    <UiElement
      :isActive="props.isActive"
      :lineWidth="props.lineWidth"
      class="relative"
      insideClasses="!min-h-[44px]"
    >
      <template #line>
        <div
          v-if="isLines"
          class="absolute bottom-2 left-0 w-full overflow-hidden rounded-lg pr-3 pl-[52px]"
        >
          <div class="bg-item-4 overflow-hidden rounded-lg">
            <div
              :style="barStyle"
              class="h-1 opacity-60"
            />
          </div>
        </div>
      </template>

      <template #leftIcon>
        <UiIconBase
          v-if="isRoundIcon"
          :color="category?.color"
          :name="category?.icon"
          invert
        />
        <UiIconBase
          v-else
          :color="category?.color"
          :name="category?.icon"
          class="ml-1 !w-6"
        />
      </template>

      <CategoriesName
        :category
        :childrenCount="props.item.categories?.length"
        :class="{ '!pb-2': isLines }"
        :isShowParent="props.isShowParent"
        :parentCategory
      />

      <div
        v-if="props.item.value !== 0"
        :class="{
          '!pb-2': isLines,
        }"
        class="grow pr-1"
      >
        <Amount
          :amount="props.item.value"
          :type="getTrnTypeByAmount(props.item.value)"
          :currencyCode="currenciesStore.base"
          :isShowBaseRate="false"
          :isShowSymbol="false"
          colorize="income"
        />
      </div>
    </UiElement>

    <slot />
  </div>
</template>
