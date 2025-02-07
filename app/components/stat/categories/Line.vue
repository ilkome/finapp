<script setup lang="ts">
import { onLongPress } from '@vueuse/core'

import type { CategoryId } from '~/components/categories/types'
import type { StatDateProvider } from '~/components/date/types'
import type { CategoryWithData } from '~/components/stat/types'
import type { StatConfigProvider } from '~/components/stat/useStatConfig'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const props = defineProps<{
  biggestCatNumber: {
    expense: number
    income: number
  }
  insideClass?: string
  insideStyle?: string
  isActive?: boolean
  isShowDots?: boolean
  isShowParent?: boolean
  item: CategoryWithData
  lineWidth?: number
}>()

const emit = defineEmits<{
  click: [categoryId: CategoryId]
  onClickIcon: [id: CategoryId]
}>()

const statDate = inject('statDate') as StatDateProvider
const statConfig = inject('statConfig') as StatConfigProvider
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
        state.values.date = new Date().getTime()
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
      '-bg-item-3 ': props.isActive,
      'rounded-lg bg-item-2': statConfig.config.value.catsList.isItemsBg,
    }]"
    :style="props.insideStyle"
    class="relative"
  >
    <slot name="before" />
    <UiElement
      :isActive="props.isActive"
      :lineWidth="!statConfig.config.value.catsList.isItemsBg ? props.lineWidth : 0"
      class="relative"
      insideClasses="!min-h-[44px]"
    >
      <template #line>
        <div
          v-if="statConfig.config.value.catsList.isLines"
          class="absolute bottom-2 left-0 w-full overflow-hidden rounded-lg pl-[52px] pr-3"
        >
          <div class="overflow-hidden rounded-lg bg-item-4">
            <div
              :style="getBarStyle()"
              class="h-1 opacity-60"
            />
          </div>
        </div>
      </template>

      <template #leftIcon>
        <UiIconBase
          v-if="statConfig.config.value.catsList.isRoundIcon"
          :color="category?.color"
          :name="category?.icon"
          invert
          @click="emit('onClickIcon', props.item.id)"
        />
        <UiIconBase
          v-else
          :color="category?.color"
          :name="category?.icon"
          class="ml-1 !w-6"
          @click="emit('onClickIcon', props.item.id)"
        />
      </template>

      <CategoriesName
        :category
        :class="{ '!pb-2': statConfig.config.value.catsList.isLines }"
        :hasChildren="categoriesStore.getChildsIds(props.item.id).length > 0"
        :isShowParent="props.isShowParent"
        :parentCategory
        :showChildrenCount="props.item.categories?.length"
      />

      <div
        v-if="props.item.value !== 0"
        :class="{
          '!pb-2': statConfig.config.value.catsList.isLines,
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
