<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import type { CategoryListBackgroundType, CategoryListTrendType } from '~/components/stat/config/schema'
import type { CategoryWithData } from '~/components/stat/types'

import { computeBarStyle, getCategorySparklineWidth } from '~/components/stat/categories/barUtils'
import { useLongPressClick } from '~/components/stat/categories/useLongPressClick'
import { getTrnTypeByAmount } from '~/components/trns/types'

const props = defineProps<{
  backgroundType: CategoryListBackgroundType
  category: CategoryItem
  currencyCode: string
  insideClass?: string
  insideStyle?: string
  isActive?: boolean
  isExpanded?: boolean
  isLines?: boolean
  isRoundIcon?: boolean
  isShowChevron?: boolean
  isShowParent?: boolean
  item: CategoryWithData
  lineWidth?: number
  maxCategoryValues: {
    expense: number
    income: number
  }
  parentCategory?: CategoryItem
  stacked?: boolean
  trendType: CategoryListTrendType
}>()

const emit = defineEmits<{
  amountClick: [categoryId: CategoryId]
  click: [categoryId: CategoryId]
  longPress: [categoryId: CategoryId]
}>()

const hasChildren = computed(() => !!props.item.categories?.length)
const isShowBackground = computed(() => props.backgroundType !== 'none')
const isBarPlus = computed(() => props.trendType === 'bar-plus')
const isShowTrend = computed(() => props.trendType !== 'hidden')

const barStyle = computed(() =>
  computeBarStyle(props.item.value, props.category.color, props.maxCategoryValues, 'width'),
)
const sparklineHeight = 40
const sparklineWidth = computed(() => getCategorySparklineWidth(props.item.trend?.length ?? 0))
const sparklinePoints = computed(() => {
  const values = props.item.trend ?? []
  const padding = 2
  if (values.length === 0)
    return ''
  if (values.length === 1)
    return `${padding},${sparklineHeight / 2} ${sparklineWidth.value - padding},${sparklineHeight / 2}`

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min
  const drawableWidth = sparklineWidth.value - padding * 2
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

  const barWidth = Math.min(3, Math.max(1, (sparklineWidth.value - gap * Math.max(0, values.length - 1)) / values.length))
  const barsWidth = barWidth * values.length + gap * Math.max(0, values.length - 1)
  const startX = sparklineWidth.value - barsWidth
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

const longPressRef = ref(null)
useLongPressClick(longPressRef, () => props.item.id, {
  onClick: id => emit('click', id),
  onLongPress: id => emit('longPress', id),
})

function onAmountClick(e: MouseEvent) {
  e.stopPropagation()
  emit('amountClick', props.item.id)
}
</script>

<template>
  <UiRowBackground
    ref="longPressRef"
    :color="props.category.color"
    :data-stat-category-id="props.item.id"
    :type="props.backgroundType"
    :class="[props.insideClass, { 'bg-elevated': props.isActive }]"
    :style="props.insideStyle"
  >
    <UiElement
      :isActive="props.isActive"
      :lineWidth="props.isLines || isShowBackground ? 0 : props.lineWidth"
      :class="isShowBackground && 'border-0!'"
      class="relative [&_.uiElementLine]:block!"
      insideClasses="min-h-11!"
    >
      <template #line>
        <div
          v-if="props.isLines && !isShowBackground"
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
          v-if="props.isRoundIcon"
          :color="props.category.color"
          :name="props.category.icon"
          invert
        />
        <UiIconBase
          v-else
          :color="props.category.color"
          :name="props.category.icon"
          class="ml-1 w-6!"
        />
      </template>

      <div
        :class="{ 'pb-2!': props.isLines && !isShowBackground }"
        class="flex grow items-center gap-1"
      >
        <CategoriesName
          :category="props.category"
          :childrenCount="isShowChevron ? undefined : props.item.categories?.length"
          :isShowParent="props.isShowParent"
          :parentCategory="props.parentCategory"
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
          'pb-2!': props.isLines && !isShowBackground,
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
          :currencyCode="props.currencyCode"
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
            'self-end opacity-70': props.trendType === 'bar',
          }"
          :style="{ width: `${sparklineWidth}px` }"
          class="h-10 shrink-0 overflow-visible"
          focusable="false"
          preserveAspectRatio="none"
          :viewBox="`0 0 ${sparklineWidth} ${sparklineHeight}`"
        >
          <polyline
            v-if="props.trendType === 'line'"
            fill="none"
            :points="sparklinePoints"
            :stroke="props.category.color"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            vector-effect="non-scaling-stroke"
          />
          <template v-else>
            <rect
              v-for="(bar, index) in sparklineBars"
              :key="index"
              :fill="props.category.color"
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
  </UiRowBackground>
</template>
