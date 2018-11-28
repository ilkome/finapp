<script>
import Amount from '@/components/amount/Amount'
import Icon from '@/components/icon/Icon'
import TrnsListView from '@/components/trns/list/TrnsListView'
import StatItemChildCats from '@/components/stat/StatItemChildCats'

export default {
  components: {
    Amount,
    Icon,
    StatItemChildCats,
    TrnsListView
  },

  props: {
    category: {
      type: Object,
      required: true
    },
    categoryId: {
      type: String,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    type: {
      type: Number,
      required: true
    },
    biggest: {
      type: Number,
      required: true
    }
  },

  data () {
    return {
      showTrns: false
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
    toogleShowTrnsInCategory (categoryId) {
      this.showTrns = !this.showTrns
    }
  }
}
</script>

<template lang="pug">
.statItemChild(
  @click="toogleShowTrnsInCategory(categoryId)"
  :class="{ _active: showTrns }"
)
  .statItemChild__content
    .statItemChild__graph: .statItemChild__graph__in(:style="styles")
    .statItemChild__icon(
      @click.stop="() => $store.dispatch('handleSetFilterCategory', categoryId)")
      Icon(
        :background="category.color"
        :icon="category.icon")
    .statItemChild__name {{ category.name }}
    .statItemChild__amount
      Amount(
        :currency="$store.state.currencies.base"
        :value="total")
  .statItemChild__trns(@click.stop="" v-if="showTrns")
    TrnsListView(
      :grouped="false"
      :incomes="type === 1"
      :expenses="type === 0"
      :limit="3"
      :categoryId="categoryId")
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/fonts"
@import "~@/stylus/variables/media"
@import "~@/stylus/variables/scrollbar"

.statItemChild
  margin (- $m6) 0
  padding $m6 $m7
  border-top 1px solid transparent
  border-bottom 1px solid transparent

  @media $media-laptop
    padding $m7 $m8

  &:hover
    @media $media-laptop
      background var(--c-bg-7)

      /.theme-light &
        background var(--c-bg-5)

  &._active
    margin $m6 0
    padding 0
    background var(--c-bg-4)
    border-top 1px solid var(--c-bg-1)
    border-bottom-color var(--c-bg-1)

    /.theme-light &
      background var(--c-bg-4)

  &:first-child
    margin-top 0
    border-top 0

  &:last-child
    margin-bottom 0
    border-bottom 0

  &__content
    display grid
    grid-template-columns minmax(10px, max-content) 1fr minmax(10px, max-content)
    grid-template-rows repeat(2, minmax(10px, max-content))
    grid-column-gap $m9

    ^[0]._active &
      padding $m6 $m7
      background var(--c-bg-4)

      @media $media-laptop
        padding $m7 $m8

  &__graph
    overflow hidden
    grid-column 2 / -1
    grid-row 2 / -1
    align-self center
    margin-top $m5
    background var(--c-bg-6)
    border-radius 2px

    &__in
      height 4px
      min-width 2px

  &__name
    overflow hidden
    align-self center
    color var(--c-font-4)
    font-size 16px
    white-space nowrap
    text-overflow ellipsis

    ^[0]._active &
      color var(--c-font-3)

  &__icon
    grid-column 1 / 2
    grid-row 1 / -1

    &:active
      opacity .8

  &__amount
    align-self center

  &__trns
    border-top 1px solid var(--c-bg-3)

    /.theme-light &
      border-top 1px solid var(--c-bg-1)
</style>
