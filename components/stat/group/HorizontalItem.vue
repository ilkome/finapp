<script setup lang="ts">
import type { CategoryID, CategoryItem } from '~/components/categories/types'
import type { TrnType } from '~/components/trns/types'
import useFilter from '~/components/filter/useFilter'
import useStatPage from '~/components/stat/useStatPage'

const props = defineProps<{
  biggest: number
  total: number
  type: TrnType
  category: CategoryItem
  categoryId: CategoryID
}>()

const { $store } = useNuxtApp()
const { statPage } = useStatPage()
const { setFilterCatsId } = useFilter()
const isShowInside = ref(false)

const isCategoryHasChildren = computed(() =>
  $store.getters['categories/isCategoryHasChildren'](props.categoryId))

const styles = computed(() => ({
  width: `${Math.abs(props.total) / Math.abs(props.biggest) * 100}%`,
  background: props.category.color,
}))

function toggleShowInside() {
  isShowInside.value = !isShowInside.value
}

const trnsIds = computed(() => {
  if (isCategoryHasChildren.value)
    return []

  const trnsItems = $store.state.trns.items
  const trnsIds = statPage.current.trnsIds
    .filter(id => trnsItems[id].type === props.type && trnsItems[id].categoryId === props.categoryId)
    .sort((a, b) => trnsItems[b].date - trnsItems[a].date)

  return trnsIds
})
</script>

<template lang="pug">
.statItem(
  :class="{ _active: isShowInside }"
  @click="toggleShowInside"
)
  .ins.py-2.px-3.space-x-3.rounded-md.justify-between.items-center.flex.border.dark_border-neutral-800.bg-skin-item-main-bg.hocus_bg-skin-item-main-hover(
    :class="['z-[9]', { _active: isShowInside }, { 'cursor-n-resize shadow-xl rounded-b-none': isShowInside }, { 'cursor-s-resize shadow-sm': !isShowInside }]"
  )
    //- Icon
    .cursor-pointer.text-neutral-50.text-xl.leading-none.w-8.h-8.rounded-full.justify-center.items-center.flex(
      :style="{ background: category.color }"
      @click.stop="setFilterCatsId(categoryId)"
    ): div(:class="category.icon")

    .grow
      .space-x-3.flex
        .overflow-hidden.truncate.grow.space-x-2.flex.items-baseline.text-neutral-700(class="dark_text-neutral-400")
          .overflow-hidden.text-sm {{ category.name }}{{ isCategoryHasChildren ? '...' : '' }}

        .statItem__amount.text-skin-item-base
          Amount(
            :amount="total"
            :currencyCode="$store.state.currencies.base"
            :type="type"
            :isShowBaseRate="false"
          )
      .pt-1.statItem__graph.mt-1: .statItem__graph__in(:style="styles")

  //- Inside
  .overflow-hidden.ins2.rounded-b-md.border.border-t-0(
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
      .statItem__trns
        TrnsList(
          :trnsIds="trnsIds"
          :isShowGroupDate="false"
          classNames="md_grid-cols-1"
          uiCat
        )
</template>

<style lang="stylus">
.statItem
  &__icon
    .icon
      width 36px !important
      height 36px !important
      background var(--c-bg-4)

      .icon__image
        font-size 22px

  .trnItem._stat
    padding-right $m6
    padding-left $m6
</style>

<style lang="stylus" scoped>
.ins2
  position relative
  background var(--c-item2-bg-hover)

.ins
  position relative

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
