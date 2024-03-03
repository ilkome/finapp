<script setup lang="ts">
import { useFilter } from '~/components/filter/useFilter'
import type { CurrencyCode } from '~/components/currencies/types'
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategories'

const props = defineProps<{
  category: CategoryItem
  categoryId: CategoryId
  currencyCode: CurrencyCode
  total: number
  type: number
}>()

const { setCategoryId } = useFilter()
const categoriesStore = useCategoriesStore()

const isCategoryHasChildren = computed(() => categoriesStore.isCategoryHasChildren(props.categoryId))
</script>

<template lang="pug">
.statItemRound.hocus_bg-item-main-hover(
  v-if="category"
  :class="{ _prevStat: total === 0 }"
  ref="item"
  data-long-press-delay="300"
  @click="setCategoryId(categoryId)"
)
  .statItemRound__icon
    .text-neutral-50.text-xl.leading-none.w-8.h-8.rounded-full.justify-center.items-center.flex(
      :style="{ background: category.color }"
      @click.stop="setCategoryId(categoryId)"
    ): div(:class="category.icon")

  .statItemRound__name.js-getWidth(:class="{ _isCategoryHasChildren: isCategoryHasChildren }")
    | {{ category.name }}{{ isCategoryHasChildren ? '...' : '' }}

  .statItemRound__amount.js-getWidth.text-item-base
    Amount(
      :amount="total"
      :currencyCode="currencyCode"
      :type="type"
      :isShowBaseRate="false"
    )
</template>

<style lang="stylus">
// TODO: style
.statItemRound
  max-width 160px

  &__icon
    .icon
      width 36px !important
      height 36px !important
      background var(--c-bg-4) !important

      .icon__image
        font-size 22px
</style>

<style lang="stylus" scoped>
@import "../assets/stylus/variables"

.statItemRound
  cursor pointer
  position relative
  display flex
  align-items center
  justify-content center
  flex-flow column
  padding 10px
  border 1px solid transparent
  border-radius 6px

  &._prevStat
    opacity .5

  &._active
    margin-bottom 26px

  &__name
    padding 6px 0 2px 0
    color var(--c-font-4)
    font-size 12px
    text-align center

    ^[0]._active &
      color var(--c-font-2)
      font-weight 500

    &._isCategoryHasChildren
      margin-right -8px
</style>
