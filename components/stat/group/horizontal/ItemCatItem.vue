<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import { useFilter } from '~/components/filter/useFilter'
import type { TrnType } from '~/components/trns/types'
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
const isCategoryHasChildren = computed(() =>
  categoriesStore.isCategoryHasChildren(props.categoryId))

// TODO: same HorizontalItem, HorizontalItemCatItem
const toggleShowInside = () => isShowInside.value = !isShowInside.value

// TODO: same HorizontalItem, HorizontalItemCatItem
const trnsIds = computed(() => {
  if (isCategoryHasChildren.value)
    return []

  return statPage.current.trnsIds
    .filter(id => trnsStore.items[id].type === props.moneyTypeNumber && trnsStore.items[id].categoryId === props.categoryId)
    .sort((a, b) => trnsStore.items[b].date - trnsStore.items[a].date)
})
</script>

<template lang="pug">
.statItem(
  class="bg-foreground-3"
  @click="toggleShowInside"
)
  .ins.py-2.px-2.space-x-3.justify-between.items-center.flex.border-t.bg-item-3(
    :class="[{ 'border-b-0': isShowInside }, 'dark_border-neutral-800']"
  )
    .text-neutral-50.text-xl.leading-none.w-8.h-8.rounded-full.justify-center.items-center.flex(
      :style="{ background: category.color }"
      @click.stop="setCategoryId(categoryId)"
    ): div(:class="category.icon")

    .grow
      .space-x-3.flex
        .grow.statItem__name {{ category.name }}

        .statItem__amount.text-item-base
          Amount(
            :amount="total"
            :currencyCode="currenciesStore.base"
            :type="moneyTypeNumber"
            :isShowBaseRate="false"
          )

  div(
    v-if="isShowInside"
    @click.stop=""
  )
    .overflow-hidden.overflow-y-auto(
      class="md_max-h-[30vh]"
    )
      TrnsList(
        :isShowGroupDate="false"
        :trnsIds="trnsIds"
        uiCat
      )
</template>

<style lang="stylus" scoped>
@import "../assets/stylus/variables"

.ins
  position relative

  +media-hover()
    background var(--c-item-bg-hover)

.statItem
  &__graph
    &__in
      height 4px
      min-width 2px
      border-radius 3px

  &__name
    overflow hidden
    align-self center
    color var(--c-font-4)
    font-size 14px
    white-space nowrap
    text-overflow ellipsis

  &__icon
    width 32px
</style>
