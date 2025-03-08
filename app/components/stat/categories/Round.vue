<script setup lang="ts">
import { onLongPress } from '@vueuse/core'

import type { CategoryId } from '~/components/categories/types'
import type { StatDateProvider } from '~/components/date/types'
import type { CategoryWithData } from '~/components/stat/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const props = defineProps<{
  isShowAmount?: boolean
  item: CategoryWithData
}>()

const emit = defineEmits<{
  click: [categoryId: CategoryId]
}>()

const statDate = inject('statDate') as StatDateProvider
const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()
const trnsFormStore = useTrnsFormStore()

const category = computed(() => categoriesStore.items[props.item.id])

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
    :class="{ 'opacity-60': props.item.value === 0 }"
    class="relative flex items-center gap-2 overflow-hidden rounded-full bg-item-3 p-1 pr-2 text-2 hover:bg-item-5 hocus:bg-item-5"
  >
    <div
      :style="{ backgroundColor: category?.color }"
      class="absolute inset-0 size-full opacity-10"
    />

    <div class="size-5">
      <UiIconBase
        :name="category?.icon"
        :color="category?.color"
        class="!w-5 p-1"
        invert
      />
    </div>

    <div class="text-xs">
      {{ category.name }}
    </div>

    <div
      v-if="props.isShowAmount"
      class="opacity-90"
    >
      <Amount
        :amount="props.item.value"
        :type="props.item.value >= 0 ? 1 : 0"
        :currencyCode="currenciesStore.base"
        :isShowBaseRate="false"
        :isShowSymbol="false"
        align="left"
        variant="xs"
        colorize="income"
      />
    </div>
  </div>
</template>
