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
    currency: {
      type: String,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    biggest: {
      type: Number,
      required: true
    },
    type: {
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
    showChildCategories () {
      const childCategoriesIds = this.$store.getters.getChildCategoriesIds(this.categoryId)

      const childCatsIdsWithTrns = []
      for (const childCategoryId of childCategoriesIds) {
        const trnsIds = this.$store.getters.getSelectedTrnsIdsByFilter({
          categoryId: childCategoryId,
          type: this.type
        })
        if (trnsIds.length > 0) childCatsIdsWithTrns.push(childCategoryId)
      }
      if (childCatsIdsWithTrns.length > 0) return true

      return false
    },
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
.statItem(
  @click="toogleShowTrnsInCategory(categoryId)"
  :class="{ _active: showTrns }"
)
  .statItem__content
    .statItem__graph: .statItem__graph__in(:style="styles")
    .statItem__icon(
      @click.stop="() => $store.dispatch('handleSetFilterCategory', categoryId)")
      Icon(:background="category.color", :icon="category.icon")
    .statItem__name {{ category.name }}
    .statItem__amount
      Amount(
        :currency="currency"
        :value="total")

  template(v-if="showTrns")
    .statItem__cats(
      v-if="showChildCategories"
      @click.stop="")
      StatItemChildCats(:categoryId="categoryId", :type="type")
    .statItem__trns(
      v-else
      @click.stop="")
      TrnsListView(
        :grouped="false"
        :incomes="type === 1"
        :expenses="type === 0"
        :limit="10"
        :categoryId="categoryId")
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/fonts"
@import "~@/stylus/variables/media"
@import "~@/stylus/variables/scrollbar"

.statItem
  position relative
  margin (- $m7) 0
  padding $m7 $m7
  border 1px solid transparent

  @media $media-laptop
    padding $m7 $m8

  &:last-child
    margin-bottom 0

  &:hover
    @media $media-laptop
      background var(--c-bg-1)
      border 1px solid var(--c-bg-5)

      /.theme-light &
        background var(--c-bg-3)

  &._active
    margin $m7 0
    padding 0
    background var(--c-bg-3)
    border 1px solid var(--c-bg-7)

    &:first-child
      margin-top (- $m7)

  &__content
    display grid
    grid-template-columns minmax(10px, max-content) 1fr minmax(10px, max-content)
    grid-template-rows repeat(2, minmax(10px, max-content))
    grid-column-gap $m9

    ^[0]._active &
      padding $m7 $m7
      background var(--c-bg-5)
      border-bottom 1px solid var(--c-bg-1)

      @media $media-laptop
        padding $m7 $m8

      /.theme-light &
        background var(--c-bg-10)
        border-bottom 1px solid var(--c-bg-5)

  &__graph
    overflow hidden
    grid-column 2 / -1
    grid-row 2 / -1
    align-self center
    margin-top $m5
    background var(--c-bg-8)
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
      color var(--c-font-2)

  &__icon
    grid-column 1 / 2
    grid-row 1 / -1

    &:active
      opacity .8

  &__amount
    align-self center

  &__trns
    padding 0
</style>
