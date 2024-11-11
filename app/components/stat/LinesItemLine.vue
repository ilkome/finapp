<script setup lang="ts">
import { onLongPress } from '@vueuse/core'
import dayjs from 'dayjs'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import type { CategoryId } from '~/components/categories/types'
import type { TotalCategory, ViewOptions } from '~/components/stat/types'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import type { IntervalRange } from '~/components/date/useIntervalRange'
import type { Range } from '~/components/date/types'

const props = defineProps<{
  biggestCatNumber: number
  insideClass?: string
  insideStyle?: string
  intervalRange?: IntervalRange
  isActive?: boolean
  isHideDots?: boolean
  item: TotalCategory
  lineWidth?: number
  selectedRange?: Range
  viewOptions?: ViewOptions
}>()

const emit = defineEmits<{
  click: [categoryId: CategoryId]
  onClickIcon: [id: CategoryId]
}>()

const trnFormStore = useTrnFormStore()
const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()

const category = computed(() => categoriesStore.items[props.item.id])
const parentCategory = computed(() => categoriesStore.items[category.value?.parentId])

function getBarStyle() {
  return {
    backgroundColor: category.value?.color,
    width: `${(Math.abs(props.item.value) / Math.abs(props.biggestCatNumber ?? 0)) * 100}%`,
  }
}

const longPressRef = ref(null)
onLongPress(
  longPressRef,
  () => {
    trnFormStore.trnFormCreate()
    trnFormStore.$patch((state) => {
      state.values.amount = [0, 0, 0]
      state.values.amountRaw = ['', '', '']
      state.values.categoryId = props.item.id
      state.ui.isShow = true

      if (props.selectedRange?.start && props.intervalRange?.interval.value.period === 'day' && props.intervalRange?.interval.value.selected !== -1) {
        state.values.date = props.selectedRange?.start
      }
      else {
        state.values.date = dayjs().startOf('day').valueOf()
      }
    })
  },
  {
    delay: 300,
    distanceThreshold: 24,
    modifiers: { prevent: true },
  },
)
</script>

<template>
  <div
    ref="longPressRef"
    :class="[props.insideClass, {
      '-bg-item-4 ': props.isActive,
      'bg-item-9 rounded-lg': props.viewOptions?.catsList.isItemsBg,
      'group': !props.viewOptions?.catsList.isItemsBg,
    }]"
    :style="props.insideStyle"
    class="relative"
  >
    <slot name="before" />
    <UiElement
      :isActive2="props.isActive"
      class="relative"
      isShowToggle2
      insideClasses="!min-h-[44px]"
      :lineWidth="!props.viewOptions?.catsList.isItemsBg ? props.lineWidth : 0"
      @click="emit('click', props.item.id)"
    >
      <template #line>
        <div
          v-if="props.viewOptions?.catsList.isLines"
          class="absolute bottom-2 left-0 w-full overflow-hidden rounded-lg pl-[52px] pr-3"
        >
          <div class="bg-item-3 overflow-hidden rounded-lg">
            <div
              class="h-1 opacity-60"
              :style="getBarStyle()"
            />
          </div>
        </div>
      </template>

      <template #leftIcon>
        <UiIconBase
          v-if="props.viewOptions?.catsList.isRoundIcon"
          :color="category?.color"
          :name="category?.icon"
          invert
          class="ml-0 !w-7 !text-base leading-none"
          @click.stop="emit('onClickIcon', props.item.id)"
        />
        <UiIconBase
          v-else
          :color="category?.color"
          :name="category?.icon"
          class="ml-1 !w-6 !text-xl leading-none"
          @click.stop="emit('onClickIcon', props.item.id)"
        />
      </template>

      <CategoriesName
        :class="{ '!pb-2': props.viewOptions?.catsList.isLines }"
        :category
        :parentCategory
        :hasChildren="categoriesStore.getChildsIds(props.item.id).length > 0"
      />

      <div
        v-if="props.item.value !== 0"
        :class="{
          '!pb-2': props.viewOptions?.catsList.isLines,
        }"
        class="grow pr-1"
      >
        <Amount
          :amount="props.item.value"
          :type="props.item.value > 0 ? 1 : 0"
          :currencyCode="currenciesStore.base"
          :isShowBaseRate="false"
          :isShowSymbol="props.item.value !== 0"
          colorize="income"
        />
      </div>
    </UiElement>

    <slot />
  </div>
</template>
