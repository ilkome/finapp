<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import type { TrnType } from '~/components/trns/types'
import useFilter from '~/components/filter/useFilter'
import useStatPage from '~/components/stat/useStatPage'
import { getWidthPercent } from '~/components/stat/helpers'

const props = defineProps<{
  biggest: number
  total: number
  type: TrnType
  category: CategoryItem
  categoryId: CategoryId
}>()

const { $store } = useNuxtApp()
const { statPage } = useStatPage()
const { setFilterCatsId } = useFilter()
const isShowInside = ref(false)

const styles = computed(() => ({
  width: getWidthPercent(props.total, props.biggest),
  background: props.category.color,
}))

// TODO: same HorizontalItem, HorizontalItemCatItem
const isCategoryHasChildren = computed(() =>
  $store.getters['categories/isCategoryHasChildren'](props.categoryId))

// TODO: same HorizontalItem, HorizontalItemCatItem
const toggleShowInside = () => isShowInside.value = !isShowInside.value

// TODO: same HorizontalItem, HorizontalItemCatItem
const trnsIds = computed(() => {
  if (isCategoryHasChildren.value)
    return []

  const trnsItems = $store.state.trns.items
  return statPage.current.trnsIds
    .filter(id => trnsItems[id].type === props.type && trnsItems[id].categoryId === props.categoryId)
    .sort((a, b) => trnsItems[b].date - trnsItems[a].date)
})
</script>

<template lang="pug">
.statItem(
  :class="{ _active: isShowInside }"
  @click="toggleShowInside"
)
  .ins.py-2.px-2.space-x-3.rounded-md.justify-between.items-center.flex.bg-item-main-bg.hocus_bg-item-main-hover(
    :class="['z-[9]', { _active: isShowInside }, { 'cursor-n-resize shadow-xl rounded-b-none': isShowInside }, { 'cursor-s-resize shadow-sm': !isShowInside }]"
  )
    //- Icon
    .cursor-pointer.text-neutral-50.text-xl.leading-none.w-8.h-8.rounded-full.justify-center.items-center.flex(
      :style="{ background: category.color }"
      @click.stop="setFilterCatsId(categoryId)"
    ): div(:class="category.icon")

    .grow
      .space-x-3.flex
        .overflow-hidden.truncate.grow.space-x-2.flex.items-baseline.text-neutral-700.dark_text-neutral-400.text-sm
          | {{ category.name }}{{ isCategoryHasChildren ? '...' : '' }}

        .statItem__amount.text-item-base
          Amount(
            :amount="total"
            :currencyCode="$store.state.currencies.base"
            :type="type"
            :isShowBaseRate="false"
          )
      .pt-1.statItem__graph.mt-1: .statItem__graph__in(:style="styles")

  //- Inside
  .overflow-hidden.bg-item-main-bg.rounded-b-md(
    v-if="isShowInside"
    class="mt-[-1px] dark_border-neutral-800"
    @click.stop=""
  )
    template(v-if="isCategoryHasChildren")
      StatGroupHorizontalItemCat(
        :categoryId="categoryId"
        :type="type"
      )

    template(v-if="!isCategoryHasChildren")
      .statItem__trns.overflow-hidden(
        class="max-h-[60vh]"
      )
        TrnsList(
          :trnsIds="trnsIds"
          :isShowGroupDate="false"
          classNames="md_grid-cols-1"
          uiCat
        )
</template>

<style lang="stylus" scoped>
.statItem
  &__graph
    &__in
      height 4px
      min-width 2px
      border-radius 3px

  &__icon
    width 32px
</style>
