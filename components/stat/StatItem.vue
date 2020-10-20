<script>
export default {
  name: 'StatItem2',

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
      showInside: false
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
    }
  },

  methods: {
    toogleShowInside (categoryId) {
      this.showInside = !this.showInside
    }
  }
}
</script>

<template lang="pug">
.statItem(
  @click="toogleShowInside(categoryId)"
  :class="{ _active: showInside }"
)

  .statItem__content
    .statItem__graph: .statItem__graph__in(:style="styles")
    .statItem__icon(@click.stop="() => $store.dispatch('filter/handleSetFilterCategory', categoryId)")
      Icon(
        :background="category.color"
        :icon="category.icon"
        :round="true"
      )

    .statItem__name {{ category.name }}
    .statItem__amount
      Amount(
        :currency="currency"
        :value="total")

  template(v-if="showInside")
    .statItem__inside(@click.stop="")
      template(v-if="showChildCategories")
        StatItemChildCats2(:categoryId="categoryId", :type="type")

      template(v-else)
        TrnsList(
          ui="stat"
          :incomes="type === 1"
          :expenses="type === 0"
          :categoryId="categoryId")
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables"

.statItem
  overflow hidden
  cursor pointer
  position relative
  margin (- 10px) 0
  margin-bottom 10px
  padding 10px
  border 1px solid transparent
  border-radius $m5

  &:hover
    @media $media-laptop
      z-index 2
      background var(--c-bg-1)
      border 1px solid var(--c-bg-5)

      /.light-mode &
        background var(--c-bg-3)

  &._active
    padding 0
    margin-bottom 30px
    background var(--c-bg-2)
    border 1px solid var(--c-bg-7)

    &:first-child
      margin-top (- 10px)

  &__content
    display grid
    grid-template-columns minmax(10px, max-content) 1fr minmax(10px, max-content)
    grid-template-rows repeat(2, minmax(10px, max-content))
    grid-column-gap 20px

    ^[0]._active &
      padding 10px 10px
      background var(--c-bg-5)
      border-bottom 1px solid var(--c-bg-7)

      /.light-mode &
        background var(--c-bg-10)
        border-bottom 1px solid var(--c-bg-5)

  &__graph
    overflow hidden
    grid-column 2 / -1
    grid-row 2 / -1
    align-self center
    margin-top 6px
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
