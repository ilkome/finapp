<script lang="ts">
import useFilter from '~/modules/filter/useFilter'

export default {
  props: {
    category: { type: Object, required: true },
    categoryId: { type: String, required: true },
    currencyCode: { type: String, required: true },
    total: { type: Number, required: true },
    type: { type: Number, required: true },
  },

  setup(props) {
    const { categoryId } = toRefs(props)
    const { $store } = useNuxtApp()
    const { setFilterCatsId } = useFilter()

    const isCategoryHasChildren = computed(() => $store.getters['categories/isCategoryHasChildren'](categoryId.value))

    // long press
    const itemRef = ref(document.createElement('div'))

    return {
      setFilterCatsId,
      itemRef,
      isCategoryHasChildren,
    }
  },
}
</script>

<template lang="pug">
.statItemRound.hocus_bg-skin-item-main-hover(
  v-if="category"
  :class="{ _prevStat: total === 0 }"
  ref="item"
  data-long-press-delay="300"
  @click="setFilterCatsId(categoryId)"
)
  .statItemRound__icon
    .text-neutral-50.text-xl.leading-none.w-8.h-8.rounded-full.justify-center.items-center.flex(
      :style="{ background: category.color }"
      @click.stop="setFilterCatsId(categoryId)"
    ): div(:class="category.icon")

  .statItemRound__name.js-getWidth(:class="{ _isCategoryHasChildren: isCategoryHasChildren }")
    | {{ category.name }}{{ isCategoryHasChildren ? '...' : '' }}

  .statItemRound__amount.js-getWidth.text-skin-item-base
    Amount(
      :amount="total"
      :currencyCode="currencyCode"
      :type="type"
      :isShowBaseRate="false"
    )
</template>

<style lang="stylus">
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
.statItemRound
  cursor pointer
  position relative
  display flex
  align-items center
  justify-content center
  flex-flow column
  padding $m6
  border 1px solid transparent
  border-radius $m5

  &._prevStat
    opacity .5

  &._active
    margin-bottom $m9

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
