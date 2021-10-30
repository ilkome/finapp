<script>
import useFilter from '~/modules/filter/useFilter'

export default {
  name: 'StatItem',

  props: {
    biggest: { type: Number, required: true },
    category: { type: Object, required: true },
    categoryId: { type: String, required: true },
    currency: { type: String, required: true },
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
    showChildCategories () {
      const childCategoriesIds = this.$store.getters['categories/getChildCategoriesIds'](this.categoryId)

      const childCatsIdsWithTrns = []
      for (const childCategoryId of childCategoriesIds) {
        const trnsIds = this.$store.getters['trns/getTrnsIdsByFilter']({
          categoryId: childCategoryId,
          type: this.type
        })
        if (trnsIds.length > 0)
          childCatsIdsWithTrns.push(childCategoryId)
      }

      if (childCatsIdsWithTrns.length > 0)
        return true

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
    toogleShowInside () {
      this.isShowInside = !this.isShowInside
    }
  }
}
</script>

<template lang="pug">
.statItem(
  :class="{ _active: isShowInside }"
  @click="toogleShowInside"
)
  .statItem__content
    .statItem__graph: .statItem__graph__in(:style="styles")
    .statItem__icon(@click.stop="setCategoryFilter(categoryId)")
      Icon(
        :background="isShowInside ? category.color : 'var(--c-item-stat-bg)'"
        :color="isShowInside ? 'var(--c-item-stat-icon)' : category.color"
        :icon="category.icon"
        round
      )

    .statItem__name {{ category.name }} {{ showChildCategories ? '...' : '' }}
    .statItem__amount
      Amount(
        :currency="currency"
        :value="total"
      )

  template(v-if="isShowInside")
    .statItem__inside(@click.stop="")
      template(v-if="showChildCategories")
        StatItemChildCats(
          :categoryId="categoryId"
          :type="type"
        )

      template(v-else)
        .statItem__trns
          TrnsList(
            :incomes="type === 1"
            :expenses="type === 0"
            :categoryId="categoryId"
            ui="stat"
          )
</template>

<style lang="stylus">
@import '~assets/stylus/variables'

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
@import '~assets/stylus/variables'

.statItem
  cursor pointer
  position relative
  padding $m5 $m5
  border 1px solid transparent
  border-radius $borderRadiusMd

  +media-hover()
    &:not(._active)
      z-index 2
      background var(--c-item-bg-hover)

  &._active
    margin-bottom $m5
    background var(--c-item2-bg-hover)

    &:not(:first-child)
      margin-top $m5

  &__content
    display grid
    grid-template-columns minmax(10px, max-content) 1fr minmax(10px, max-content)
    grid-template-rows repeat(2, minmax(10px, max-content))
    grid-column-gap 20px

  &__inside
    margin (- $m5)
    margin-top $m3
    padding 0

  &__graph
    overflow hidden
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
    overflow hidden
    align-self center
    color var(--c-font-4)
    font-size 14px
    white-space nowrap
    text-overflow ellipsis

    ^[0]._active &
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

  &__arrow
    padding-top $m2
    color var(--c-font-5)
    grid-column 4 / 5
    grid-row 1 / 2
</style>
