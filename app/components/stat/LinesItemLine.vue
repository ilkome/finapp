<script setup lang="ts">
import { onLongPress } from '@vueuse/core'
import dayjs from 'dayjs'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import type { CategoryId } from '~/components/categories/types'
import type { TotalCategory, ViewOptions } from '~/components/stat/types'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import type { Range, StatDateProvider } from '~/components/date/types'

const props = defineProps<{
  biggestCatNumber: {
    expense: number
    income: number
  }
  insideClass?: string
  insideStyle?: string
  isActive?: boolean
  isHideDots?: boolean
  isHideParent?: boolean
  item: TotalCategory
  lineWidth?: number
  viewOptions?: ViewOptions
}>()

const emit = defineEmits<{
  click: [categoryId: CategoryId]
  onClickIcon: [id: CategoryId]
}>()

const statDate = inject('statDate') as StatDateProvider
const trnsFormStore = useTrnsFormStore()
const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()

const category = computed(() => categoriesStore.items[props.item.id])
const parentCategory = computed(() => categoriesStore.items[category.value?.parentId])

function getBarStyle() {
  if (!props.item.value || props.item.value === 0)
    return

  const isIncome = props.item.value > 0
  const reference = isIncome ? props.biggestCatNumber.income : props.biggestCatNumber.expense

  return {
    backgroundColor: category.value?.color,
    width: `${(Math.abs(props.item.value) / Math.abs(reference)) * 100}%`,
  }
}

// TODO: addTrnFromSelectedInterval
const longPressRef = ref(null)
onLongPress(
  longPressRef,
  () => {
    const isTransactible = categoriesStore.isItTransactible(props.item.id)
    if (!isTransactible)
      return

    trnsFormStore.trnFormCreate()
    trnsFormStore.$patch((state) => {
      state.values.amount = [0, 0, 0]
      state.values.amountRaw = ['', '', '']
      state.values.categoryId = props.item.id
      state.ui.isShow = true

      const isDayDate = statDate.params.value.intervalSelected !== -1 && statDate.params.value.intervalsBy === 'day'
      if (isDayDate && statDate.selectedInterval.value?.start) {
        state.values.date = statDate.selectedInterval.value!.start
      }
      else {
        state.values.date = dayjs().valueOf()
      }
    })
  },
  {
    onMouseUp: (duration: number, distance: number, isLongPress: boolean) => {
      if (!isLongPress && distance < 100) {
        emit('click', props.item.id)
      }
    },
  },
)
</script>

<template>
  <div
    v-if="category"
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
      :isActive="props.isActive"
      :lineWidth="!props.viewOptions?.catsList.isItemsBg ? props.lineWidth : 0"
      class="relative"
      insideClasses="!min-h-[44px]"
      isShowToggle2
    >
      <template #line>
        <div
          v-if="props.viewOptions?.catsList.isLines"
          class="absolute bottom-2 left-0 w-full overflow-hidden rounded-lg pl-[52px] pr-3"
        >
          <div class="bg-item-3 overflow-hidden rounded-lg">
            <div
              :style="getBarStyle()"
              class="h-1 opacity-60"
            />
          </div>
        </div>
      </template>

      <template #leftIcon>
        <UiIconBase
          v-if="props.viewOptions?.catsList.isRoundIcon"
          :color="category?.color"
          :name="category?.icon"
          class="ml-0 !w-7 !text-base leading-none"
          invert
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
        :isHideParent="props.isHideParent"
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
          :isShowSymbol="false"
          colorize="income"
        />
      </div>
    </UiElement>

    <slot />
  </div>
</template>
