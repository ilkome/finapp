<script setup lang="ts">
import { onLongPress } from '@vueuse/core'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import type { CategoryId } from '~/components/categories/types'
import type { TotalCategory } from '~/components/stat/types'
import type { StatDateProvider } from '~/components/date/types'

const props = defineProps<{
  isHideAmount?: boolean
  item: TotalCategory
}>()

const emit = defineEmits<{
  click: [categoryId: CategoryId]
}>()

const statDate = inject('statDate') as StatDateProvider
const trnFormStore = useTrnFormStore()
const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()
const trnsStore = useTrnsStore()

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

    if (statDate.selectedInterval.value?.start && statDate.params.value.intervalSelected !== -1 && statDate.params.value.intervalsBy === 'day' && isTransactible && statDate.selectedInterval.value) {
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
    class="text-2 hocus:bg-item-5 bg-item-4 hover:bg-item-5 relative flex items-center gap-2 overflow-hidden rounded-full p-1"
  >
    <div
      :style="{ backgroundColor: category?.color }"
      class="absolute inset-0 size-full opacity-10"
    />

    <div class="size-5">
      <UiIconBase
        :name="category?.icon"
        :color="category?.color"
        class="!text-xs"
        invert
      />
    </div>

    <div class="text-xs">
      {{ category.name }}
    </div>

    <div
      v-if="!props.isHideAmount"
      class="pr-1 opacity-90"
    >
      <Amount
        :amount="props.item.value"
        :type="props.item.value >= 0 ? 1 : 0"
        :currencyCode="currenciesStore.base"
        :isShowBaseRate="false"
        :isShowSymbol="false"
        align="left"
        variant="sm"
        colorize="income"
      />
    </div>
  </div>
</template>
