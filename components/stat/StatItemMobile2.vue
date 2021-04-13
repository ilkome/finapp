<script>
export default {
  name: 'StatItemMobile2',

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

  computed: {
    trnsIds () {
      return this.$store.getters['trns/getTrns']({
        categoryId: this.categoryId,
        type: this.type
      })
    },

    summary () {
      return this.$store.getters['trns/getTotalOfTrnsIds'](this.trnsIds)
    },

    showChildCategories () {
      const childCategoriesIds = this.$store.getters['categories/getChildCategoriesIds'](this.categoryId)

      const childCatsIdsWithTrns = []
      for (const childCategoryId of childCategoriesIds) {
        const trnsIds = this.$store.getters['trns/getTrnsIdsByFilter']({
          categoryId: childCategoryId,
          type: this.type
        })
        if (trnsIds.length > 0) { childCatsIdsWithTrns.push(childCategoryId) }
      }

      if (childCatsIdsWithTrns.length > 0) { return true }
      return false
    },

    styles () {
      return {
        width: `${Math.abs(this.total) / Math.abs(this.biggest) * 100}%`,
        background: this.category.color
      }
    },

    filterPeriod () {
      return this.$store.state.filter.period
    },

    statCurrentPeriod () {
      return this.$store.getters['stat/statCurrentPeriod']
    }
  }
}
</script>

<template lang="pug">
.statItem(
  @click="$store.dispatch('filter/handleSetFilterCategory', categoryId)"
)
  .statItem__content
    .statItem__graph: .statItem__graph__in(:style="styles")
    .statItem__icon
      Icon(
        :color="category.color"
        :icon="category.icon"
        background="transparent"
        big
        round
      )

    .statItem__name {{ category.name }}
    .statItem__amount
      Amount(
        :currency="currency"
        :value="total"
        :type="type"
        :isColorize="false"
        isShowPrefix
        size="md"
      )
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.statItem
  overflow hidden
  cursor pointer
  position relative
  padding $m6
  border-radius $m6

  +media-hover()
    background var(--c-bg-3)

  .icon
    width auto
    height auto

    .icon__image
      font-size 32px

  &._active
    margin-bottom $m9

  &:active
    z-index 2
    background var(--c-bg-5)

  &__content
    display flex
    align-items center
    justify-content center
    flex-flow column

  &__summary
    z-index 10
    position sticky
    top (- $m7)
    padding 0
    padding-bottom $m7
    background var(--c-bg-4)

  &__chart
    height 180px
    margin-bottom $m9

  &__graph
    overflow hidden
    display none
    grid-column 2 / -1
    grid-row 2 / -1
    align-self center
    margin-top $m3
    background var(--c-bg-8)
    border-radius 2px

    &__in
      height 4px
      min-width 2px

  &__name
    // overflow hidden
    align-self center
    padding 6px 0 2px 0
    color var(--c-font-4)
    font-size 12px
    text-align center
    // white-space wrap
    // text-overflow ellipsis

    ^[0]._active &
      color var(--c-font-2)
      font-weight 500

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
</style>
