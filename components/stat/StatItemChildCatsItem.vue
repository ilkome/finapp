<script>
import useFilter from '~/modules/filter/useFilter'

export default {
  props: {
    biggest: { type: Number, required: true },
    category: { type: Object, required: true },
    categoryId: { type: String, required: true },
    total: { type: Number, required: true },
    type: { type: Number, required: true }
  },

  setup () {
    const { setCategoryFilter } = useFilter()

    return {
      setCategoryFilter
    }
  },

  data () {
    return {
      isShowInside: false
    }
  },

  computed: {
    styles () {
      return {
        width: `${Math.abs(this.total) / Math.abs(this.biggest) * 100}%`,
        background: this.category.color
      }
    }
  },

  methods: {
    toogleShowInside () {
      this.isShowInside = !this.isShowInside
    }
  }
}
</script>

<template lang="pug">
.statItemChild(
  :class="{ _active: isShowInside }"
  @click="toogleShowInside(categoryId)"
)
  .statItemChild__content
    .statItemChild__icon(@click.stop="setCategoryFilter(categoryId)")
      Icon(
        :background="isShowInside ? category.color : 'var(--c-item-stat-bg)'"
        :color="isShowInside ? 'var(--c-item-stat-icon)' : category.color"
        :icon="category.icon"
        round
      )

    .statItemChild__name {{ category.name }}

    .statItemChild__amount
      Amount(
        :currency="$store.state.currencies.base"
        :value="total"
        :type="type"
        :isColorize="false"
        isShowPrefix
      )

  .statItemChild__trns(
    v-if="isShowInside"
    @click.stop=""
  )
    TrnsList(
      :incomes="type === 1"
      :expenses="type === 0"
      :categoryId="categoryId"
      ui="stat"
    )
</template>

<style lang="stylus">
@import '~assets/stylus/variables'

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
@import '~assets/stylus/variables'

.statItemChild
  cursor default
  border 1px solid transparent
  border-radius $borderRadiusMd

  +media-hover()
    &:not(._active)
      background var(--c-item-bg-hover)

  &__content
    display grid
    grid-template-columns minmax(10px, max-content) 1fr minmax(10px, max-content)
    grid-column-gap 20px
    margin 0
    padding $m5 $m5

  &__name
    overflow hidden
    align-self center
    color var(--c-font-4)
    font-size 14px
    white-space nowrap
    text-overflow ellipsis

    ~/._active &
      color var(--c-font-2)

  &__icon
    width 32px
    grid-column 1 / 2
    grid-row 1 / -1

    &:active
      opacity .8

    @media $media-laptop
      &:hover
        transform scale(1.3)

  &__amount
    align-self center

  &__trns
    padding 0

    ^[0]._active &
      padding-bottom $m4
</style>
