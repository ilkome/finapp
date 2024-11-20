<script setup lang="ts">
import { onLongPress } from '@vueuse/core'
import dayjs from 'dayjs'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import type { CategoryId } from '~/components/categories/types'
import type { TotalCategory } from '~/components/stat/types'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import type { Range, StatDateProvider } from '~/components/date/types'

const props = defineProps<{
  isActive?: boolean
  item: TotalCategory
  selectedRange?: Range
}>()

const emit = defineEmits<{
  click: [categoryId: CategoryId]
}>()

const statDate = inject('statDate') as StatDateProvider

const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()
const trnsStore = useTrnsStore()
const trnFormStore = useTrnFormStore()

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

// TODO: addTrnFromSelectedInterval
const longPressRef = ref(null)
onLongPress(
  longPressRef,
  () => {
    const isTransactible = categoriesStore.isItTransactible(props.item.id)
    if (statDate.params.value.intervalSelected !== -1 && statDate.params.value.intervalsBy === 'day' && isTransactible && statDate.selectedInterval.value) {
      trnFormStore.trnFormCreate()
      trnFormStore.$patch((state) => {
        state.values.amount = [0, 0, 0]
        state.values.amountRaw = ['', '', '']
        state.values.categoryId = props.item.id
        state.ui.isShow = true
        state.values.date = statDate.selectedInterval.value!.start
      })
    }
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
    class="text-secondary2 hocus:bg-item-5 bg-item-9 relative flex items-center gap-2 overflow-hidden rounded-full p-1"
  >
    <div
      :style="{ backgroundColor: category?.color }"
      class="absolute inset-0 size-full opacity-10"
    />

    <div
      class="-lg:size-7 size-5"
    >
      <UiIconBase
        :name="category?.icon"
        :color="category?.color"
        class="-xl:!text-lg !text-xs"
        invert
      />
    </div>

    <div class="text-3 text-xs xl:text-sm">
      {{ category.name }}
    </div>

    <div class="pr-1 opacity-90">
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
