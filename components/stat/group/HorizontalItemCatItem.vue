<script setup lang="ts">
import type { CategoryID, CategoryItem } from '~/components/categories/types'
import useFilter from '~/components/filter/useFilter'
import type { TrnType } from '~/components/trns/types'
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

function toggleShowInside() {
  isShowInside.value = !isShowInside.value
}

const trnsIds = computed(() => {
  if (isCategoryHasChildren.value)
    return []

  const trnsItems = $store.state.trns.items
  const trnsIds = statPage.current.trnsIds
    .filter((id) => {
      const trn = trnsItems[id]
      return trn.type === props.type && trn.categoryId === props.categoryId
    })
    .sort((a, b) => trnsItems[b].date - trnsItems[a].date)

  return trnsIds
})
</script>

<template lang="pug">
.statItem(
  :class="{ _active: isShowInside }"
  @click="toggleShowInside"
)
  .ins.py-2.px-3.space-x-3.justify-between.items-center.flex.border-t(
    :class="[{ _active: isShowInside }, { 'border-b-0 cursor-n-resize': isShowInside }, { 'cursor-s-resize': !isShowInside }, 'dark_border-neutral-800']"
  )
    .text-neutral-50.text-xl.leading-none.w-8.h-8.rounded-full.justify-center.items-center.flex(
      :style="{ background: category.color }"
      @click.stop="setFilterCatsId(categoryId)"
    ): div(:class="category.icon")

    .grow
      .space-x-3.flex
        .grow.statItem__name {{ category.name }}

        .statItem__amount.text-skin-item-base
          Amount(
            :amount="total"
            :currencyCode="$store.state.currencies.base"
            :type="type"
            :isShowBaseRate="false"
          )

  .statItemChild__trns(
    v-if="isShowInside"
    @click.stop=""
  )
    TrnsList(
      :isShowGroupDate="false"
      :trnsIds="trnsIds"
      uiCat
    )
</template>

<style lang="stylus">
// TODO: style
.statItemChild
  .trnItem._stat
    padding-right $m5
    padding-left $m6

  &__icon
    .icon
      width 36px !important
      height 36px !important
      background var(--c-bg-4)

      .icon__image
        font-size 22px
</style>

<style lang="stylus" scoped>
.ins2
  position relative
  background var(--c-item2-bg-hover)

.ins
  position relative
  background var(--c-item2-bg-hover)

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
