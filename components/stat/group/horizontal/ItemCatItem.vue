<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import type { MoneyTypeNumber } from '~/components/stat/types'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useFilter } from '~/components/filter/useFilter'
import { useStat } from '~/components/stat/useStat'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = defineProps<{
  biggest: number
  total: number
  moneyTypeNumber: MoneyTypeNumber
  category: CategoryItem
  categoryId: CategoryId
}>()

const { statCurrentPeriod } = useStat()
const { setCategoryId } = useFilter()
const currenciesStore = useCurrenciesStore()
const categoriesStore = useCategoriesStore()
const trnsStore = useTrnsStore()

const isShowInside = ref(false)

// TODO: same HorizontalItem, HorizontalItemCatItem
function toggleShowInside() {
  isShowInside.value = !isShowInside.value
}

// TODO: same HorizontalItem, HorizontalItemCatItem
const trnsIds = computed(() => {
  if (categoriesStore.isCategoryHasChildren(props.categoryId))
    return []

  return statCurrentPeriod.value.trnsIds
    .filter(
      id =>
        trnsStore.items[id].type === props.moneyTypeNumber
        && trnsStore.items[id].categoryId === props.categoryId,
    )
    .sort((a, b) => trnsStore.items[b].date - trnsStore.items[a].date)
})
</script>

<template>
  <div @click="toggleShowInside">
    <div
      class="relative flex items-center justify-between space-x-3 border-t bg-item-3 px-2 py-2 hocus_bg-item-8 dark_border-neutral-800"
      :class="[{ 'border-b-0': isShowInside }]"
    >
      <div
        class="flex h-8 w-8 items-center justify-center rounded-full text-xl leading-none text-icon-primary"
        :style="{ background: category.color }"
        @click.stop="setCategoryId(categoryId)"
      >
        <div :class="category.icon" />
      </div>

      <div class="grow flex space-x-3">
        <div
          class="overflow-hidden truncate text-sm text-secondary"
        >
          {{ category.name }}
        </div>

        <Amount
          :amount="total"
          :currencyCode="currenciesStore.base"
          :type="moneyTypeNumber"
          :isShowBaseRate="false"
        />
      </div>
    </div>

    <div v-if="isShowInside" class="md_max-h-[30vh]" @click.stop="">
      <TrnsList :isShowGroupDate="false" :trnsIds="trnsIds" uiCat />
    </div>
  </div>
</template>
