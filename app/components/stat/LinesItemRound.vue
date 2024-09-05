<script setup lang="ts">
import { onLongPress } from '@vueuse/core'
import dayjs from 'dayjs'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useCategoriesStore } from '~/components/categories/useCategories'
import type { CategoryId } from '~/components/categories/types'
import type { TotalCategory } from '~/components/stat/types'
import { useTrnForm, useTrnFormStore } from '~/components/trnForm/useTrnForm'
import type { IntervalRange } from '~/components/date/useIntervalRange'
import type { Range } from '~/components/date/types'

const props = defineProps<{
  intervalRange?: IntervalRange
  isActive?: boolean
  item: TotalCategory
  selectedRange?: Range
}>()

const emit = defineEmits<{
  click: [categoryId: CategoryId]
}>()

const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()
const trnsStore = useTrnsStore()
const trnFormStore = useTrnFormStore()
const { trnFormCreate } = useTrnForm()

const category = computed(() => {
  const isOneCategory = props.item.trnsIds.length <= 1
  const isParentCategory = categoriesStore.items[props.item.id]?.parentId === 0

  const isDifferentCategories = props.item.trnsIds.some(id =>
    trnsStore.items[id]?.categoryId !== trnsStore.items[props.item.trnsIds[0]]?.categoryId)

  if (isParentCategory && (!isDifferentCategories || isOneCategory)) {
    const parentId = trnsStore.items[props.item.trnsIds[0]].categoryId
    return categoriesStore.items[parentId]
  }

  return categoriesStore.items[props.item.id]
})

const longPressRef = ref(null)
onLongPress(
  longPressRef,
  () => {
    trnFormCreate()
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
  { delay: 300, modifiers: { prevent: true } },
)
</script>

<template>
  <div
    ref="longPressRef"
    class="relative flex gap-2 items-center text-secondary2 hocus:bg-item-5 p-1 rounded-full bg-item-9 overflow-hidden"
    :class="{ 'opacity-60': props.item.value === 0 }"
    @click="emit('click', props.item.id)"
  >
    <div
      :style="{ backgroundColor: category?.color }"
      class="absolute inset-0 size-full opacity-10"
    />

    <div
      class="size-5 -lg:size-7"
    >
      <UiIconBase
        :name="category?.icon"
        :color="category?.color"
        class="!text-xs -xl:!text-lg"
        invert
      />
    </div>

    <!-- TODO: text-xs xl:text-sm -->
    <div class="text-xs text-3 xl:text-sm">
      {{ category.name }}
    </div>

    <div class="opacity-90 pr-1">
      <Amount
        :amount="props.item.value"
        :currencyCode="currenciesStore.base"
        :isShowBaseRate="false"
        :isShowSymbol="false"
        :type="props.item.value >= 0 ? 1 : 0"
        align="left"
        colorize="income"
        variant="sm"
      />
    </div>
  </div>
</template>
