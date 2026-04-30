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
  isExpanded?: boolean
  isShowChevron?: boolean
  isShowParent?: boolean
  item: CategoryWithData
  lineWidth?: number
  maxCategoryValues: {
    expense: number
    income: number
  }
  stacked?: boolean
}>()

const emit = defineEmits<{
  amountClick: [categoryId: CategoryId]
  click: [categoryId: CategoryId]
}>()

const hasChildren = computed(() => !!props.item.categories?.length)

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

function onAmountClick(e: MouseEvent) {
  e.stopPropagation()
  emit('amountClick', props.item.id)
}
</script>

<template>
  <div
    v-if="category"
    ref="longPressRef"
    :class="[props.insideClass, {
      '-bg-elevated ': props.isActive,
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
          <div class="bg-accented overflow-hidden rounded-lg">
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

      <div
        :class="{ '!pb-2': isLines }"
        class="flex grow items-center gap-1"
      >
        <CategoriesName
          :category
          :childrenCount="isShowChevron ? undefined : props.item.categories?.length"
          :isShowParent="props.isShowParent"
          :parentCategory
          :stacked="props.stacked"
        />

        <Icon
          v-if="isShowChevron && hasChildren"
          :name="props.isExpanded ? 'lucide:chevron-down' : 'lucide:chevron-right'"
          size="18"
          class="text-muted"
        />
      </div>

      <div
        v-if="props.item.value !== 0"
        :class="{ '!pb-2': isLines }"
        class="-my-1.5 flex min-w-12 shrink-0 cursor-pointer items-center justify-end self-stretch rounded-sm px-2"
        @click="onAmountClick"
        @pointerdown.stop
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
