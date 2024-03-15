<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import { useFilter } from '~/components/filter/useFilter'
import useStatPage from '~/components/stat/useStatPage'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import type { MoneyTypeNumber } from '~/components/stat/types'

const props = defineProps<{
  biggest: number
  total: number
  moneyTypeNumber: MoneyTypeNumber
  category: CategoryItem
  categoryId: CategoryId
}>()

const { statPage } = useStatPage()
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

  return statPage.current.trnsIds
    .filter(
      id =>
        trnsStore.items[id].type === props.moneyTypeNumber
        && trnsStore.items[id].categoryId === props.categoryId,
    )
    .sort((a, b) => trnsStore.items[b].date - trnsStore.items[a].date)
})
</script>

<template>
  <div class="statItem bg-foreground-3" @click="toggleShowInside">
    <div
      class="hocus_bg-item-8 relative flex items-center justify-between space-x-3 border-t bg-item-3 px-2 py-2 dark_border-neutral-800"
      :class="[{ 'border-b-0': isShowInside }]"
    >
      <div
        class="flex h-8 w-8 items-center justify-center rounded-full text-xl leading-none text-neutral-50"
        :style="{ background: category.color }"
        @click.stop="setCategoryId(categoryId)"
      >
        <div :class="category.icon" />
      </div>

      <div class="grow">
        <div class="flex space-x-3">
          <div
            class="flex grow items-baseline space-x-2 overflow-hidden truncate text-sm text-neutral-700 dark_text-neutral-400"
          >
            {{ category.name }}
          </div>

          <div class="statItem__amount text-item-base">
            <Amount
              :amount="total"
              :currencyCode="currenciesStore.base"
              :type="moneyTypeNumber"
              :isShowBaseRate="false"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-if="isShowInside" @click.stop="">
      <div class="md_max-h-[30vh]">
        <TrnsList :isShowGroupDate="false" :trnsIds="trnsIds" uiCat />
      </div>
    </div>
  </div>
</template>
