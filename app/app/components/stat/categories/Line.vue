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

const isLines = computed(() => statConfig.config.value.categories.list.isLines)
const isRoundIcon = computed(() => statConfig.config.value.categories.list.isRoundIcon)
const backgroundType = computed(() => statConfig.config.value.categories.list.backgroundType)
const isShowBackground = computed(() => backgroundType.value !== 'none')
const trendType = computed(() => statConfig.config.value.categories.list.trendType)
const isBarPlus = computed(() => trendType.value === 'bar-plus')
const isShowTrend = computed(() => trendType.value !== 'hidden')

const category = computed(() => categoriesStore.items[props.item.id])
const parentCategory = computed(() => {
  const pid = category.value?.parentId
  return pid ? categoriesStore.items[pid] : undefined
})

const barStyle = computed(() =>
  computeBarStyle(props.item.value, category.value?.color, props.maxCategoryValues, 'width'),
)
const sparklineWidth = 56
const sparklineHeight = 40
const sparklinePoints = computed(() => {
  const values = props.item.trend ?? []
  const padding = 2
  if (values.length === 0)
    return ''
  if (values.length === 1)
    return `${padding},${sparklineHeight / 2} ${sparklineWidth - padding},${sparklineHeight / 2}`

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min
  const drawableWidth = sparklineWidth - padding * 2
  const drawableHeight = sparklineHeight - padding * 2
  return values.map((value, index) => {
    const x = padding + index * drawableWidth / (values.length - 1)
    const y = range === 0
      ? sparklineHeight / 2
      : padding + (max - value) * drawableHeight / range
    return `${x},${y}`
  }).join(' ')
})
const sparklineBars = computed(() => {
  const values = props.item.trend ?? []
  const gap = 2
  const max = Math.max(...values, 0)
  if (max === 0)
    return []

  const barWidth = Math.min(3, Math.max(1, (sparklineWidth - gap * Math.max(0, values.length - 1)) / values.length))
  const barsWidth = barWidth * values.length + gap * Math.max(0, values.length - 1)
  const startX = sparklineWidth - barsWidth
  const maxBarHeight = sparklineHeight * 0.9
  return values.map((value, index) => {
    const barHeight = value === 0 ? 1 : Math.max(2, value / max * maxBarHeight)
    return {
      height: barHeight,
      opacity: value === 0 ? 0.2 : 1,
      width: barWidth,
      x: startX + index * (barWidth + gap),
      y: sparklineHeight - barHeight,
    }
  })
})

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
    :data-stat-category-id="props.item.id"
    :class="[props.insideClass, {
      'bg-elevated': props.isActive,
      'overflow-hidden rounded-md': isShowBackground,
      'bg-elevated/10 hover:bg-elevated/30': isShowBackground && backgroundType === 'category',
      'bg-elevated/30 hover:bg-elevated/50': isShowBackground && backgroundType === 'standard',
    }]"
    :style="props.insideStyle"
    class="relative"
  >
    <slot name="before" />
    <div
      v-if="isShowBackground && backgroundType === 'category'"
      :style="{ backgroundColor: category.color }"
      class="pointer-events-none absolute inset-0 opacity-5"
    />
    <UiElement
      :isActive="props.isActive"
      :lineWidth="isLines || isShowBackground ? 0 : props.lineWidth"
      :class="isShowBackground && 'border-0!'"
      class="relative [&_.uiElementLine]:block!"
      insideClasses="min-h-11!"
    >
      <template #line>
        <div
          v-if="isLines && !isShowBackground"
          class="absolute bottom-2 left-0 w-full overflow-hidden rounded-lg pr-3 pl-13"
        >
          <div class="overflow-hidden rounded-lg bg-accented">
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
          class="ml-1 w-6!"
        />
      </template>

      <div
        :class="{ 'pb-2!': isLines && !isShowBackground }"
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
        data-stat-category-amount
        :class="{
          'gap-4 pr-0': isShowBackground && isShowTrend && !isBarPlus,
          'gap-2 pr-2': !isShowBackground && isShowTrend && !isBarPlus,
          'grid! grid-cols-[max-content] place-items-end': isBarPlus,
          'pb-2!': isLines && !isShowBackground,
          'pr-0': isBarPlus && isShowBackground,
          'pr-2': !isShowTrend || (isBarPlus && !isShowBackground),
        }"
        class="-my-1.5 flex min-w-12 shrink-0 items-center justify-end self-stretch rounded-sm pl-2"
        @click="onAmountClick"
        @pointerdown.stop
      >
        <Amount
          :amount="props.item.value"
          :type="getTrnTypeByAmount(props.item.value)"
          :currencyCode="currenciesStore.base"
          :isShowBaseRate="false"
          :isShowSymbol="false"
          :class="isBarPlus && 'relative z-10 col-start-1 row-start-1 self-center justify-self-end'"
          colorize="income"
        />
        <svg
          v-if="sparklinePoints && isShowTrend"
          aria-hidden="true"
          :class="{
            'col-start-1 row-start-1 opacity-30': isBarPlus,
            'self-end opacity-70': trendType === 'bar',
          }"
          class="h-10 w-14 shrink-0 overflow-visible"
          focusable="false"
          preserveAspectRatio="none"
          viewBox="0 0 56 40"
        >
          <polyline
            v-if="trendType === 'line'"
            fill="none"
            :points="sparklinePoints"
            :stroke="category.color"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            vector-effect="non-scaling-stroke"
          />
          <template v-else>
            <rect
              v-for="(bar, index) in sparklineBars"
              :key="index"
              :fill="category.color"
              :height="bar.height"
              :opacity="bar.opacity"
              rx="1"
              :width="bar.width"
              :x="bar.x"
              :y="bar.y"
            />
          </template>
        </svg>
      </div>
    </UiElement>

    <slot />
  </div>
</template>
