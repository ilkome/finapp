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
    .statItemChild__graph
      .statItemChild__graph__in(:style="styles")

    .statItemChild__icon(@click.stop="setCategoryFilter(categoryId)")
      Icon(
        :color="category.color"
        :icon="category.icon"
        :background="isShowInside ? 'var(--c-bg-5)' : 'transparent'"
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
</style>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.statItemChild
  border 1px solid transparent
  border-radius $borderRadiusMd

  +media-hover()
    &:not(._active)
      background var(--c-item2-bg-hover)

  &__content
    display grid
    grid-template-columns minmax(10px, max-content) 1fr minmax(10px, max-content)
    grid-template-rows repeat(2, minmax(10px, max-content))
    grid-column-gap 20px
    margin 0
    padding $m6 $m5

  &__graph
    overflow hidden
    grid-column 2 / -1
    grid-row 2 / -1
    align-self center
    margin-top 6px
    background var(--c-bg-6)
    border-radius 2px

    ~/:hover &
      background var(--c-bg-7)

    &__in
      height 4px
      min-width 2px

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
    display flex
    justify-content center
    width 32px
    grid-column 1 / 2
    grid-row 1 / -1

  &__amount
    align-self center

  &__trns
    padding 0

    ^[0]._active &
      padding-bottom $m4
</style>
