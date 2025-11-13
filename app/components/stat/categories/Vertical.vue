<script setup lang="ts">
import { onLongPress } from '@vueuse/core'

import type { CategoryId } from '~/components/categories/types'
import type { StatDateProvider } from '~/components/date/types'
import type { CategoryWithData } from '~/components/stat/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const props = defineProps<{
  biggestCatNumber: {
    expense: number
    income: number
  }
  item: CategoryWithData
}>()

const emit = defineEmits<{
  click: [categoryId: CategoryId]
  onClickIcon: [id: CategoryId]
}>()

const statDate = inject('statDate') as StatDateProvider
const trnsFormStore = useTrnsFormStore()
const categoriesStore = useCategoriesStore()

const category = computed(() => categoriesStore.items[props.item.id])

function getBarStyle() {
  if (!props.item.value || props.item.value === 0)
    return

  const isIncome = props.item.value > 0
  const reference = isIncome ? props.biggestCatNumber.income : props.biggestCatNumber.expense

  return {
    backgroundColor: category.value?.color,
    height: `${(Math.abs(props.item.value) / Math.abs(reference)) * 100}%`,
  }
}

const amount = computed(() => {
  const abs = Math.abs(props.item.value)
  const sign = props.item.value > 0 ? '' : '-'

  if (abs >= 1000000)
    return `${(props.item.value / 1000000).toFixed(2)}M`
  else if (abs >= 10000)
    return `${sign}${(abs / 1000).toFixed()}K`
  else if (abs > 999)
    return `${sign}${(abs / 1000).toFixed(1)}K`

  return `${props.item.value.toFixed()}`
})

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
    class="rounded-sm p-1 pb-4 hover:bg-[var(--item-5)]"
  >
    <div class="bg-item-3 flex h-28 items-end rounded-sm">
      <div
        class="relative w-7 rounded-t"
        :style="getBarStyle()"
      >
        <div
          :class="{
            'text-income-1': props.item.value > 0,
          }"
          class="font-secondary absolute top-[-14px] w-full text-center text-xs leading-none"
        >
          {{ amount }}
        </div>
      </div>
    </div>

    <UiIconBase
      :name="category?.icon"
      :color="category?.color"
      :size="20"
      invert
      class="rounded-none rounded-b p-0"
    />
  </div>
</template>
