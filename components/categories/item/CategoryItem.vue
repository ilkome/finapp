<script>
export default {
  props: {
    id: {
      type: String,
      required: true
    },
    category: {
      type: Object,
      required: true
    },
    ui: {
      type: String,
      default: null
    }
  },

  computed: {
    childCategoriesIds () {
      return this.$store.getters['categories/getChildCategoriesIds'](this.id)
    },

    parentCategory () {
      return this.$store.state.categories.items[this.category.parentId]
    }
  },

  methods: {
    handleClick () {
      if (this.$listeners.onClick) {
        this.$listeners.onClick(this.id)
      }
    },

    handleIconClick () {
      if (this.$listeners.onIconClick) {
        this.$listeners.onIconClick(this.id)
      }
    }
  }
}
</script>

<template lang="pug">
.categoryItem(
  :class="{ [ui]: ui }"
  @click="handleClick"
)
  .categoryItem__icon
    Icon(
      @click="handleIconClick"
      :icon="category.icon"
      :small="ui === '_flat'"
      :color="category.color || $store.state.ui.defaultBgColor"
      :category="true"
    )

  .categoryItem__name
    .parent(v-if="ui === '_flat' && parentCategory") {{ parentCategory.name }}
    .child {{ category.name }}
  .categoryItem__childNum(v-if="childCategoriesIds.length > 0") {{ childCategoriesIds.length }}
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/media"
@import "~assets/stylus/variables/fonts"

.categoryItem
  overflow hidden
  position relative
  display flex
  flex-flow column nowrap
  align-items center
  justify-content center
  padding $m7 0
  color var(--c-font-1)
  background var(--c-bg-6)
  border-radius $m4

  &._flat
    flex-flow row nowrap
    align-items center
    justify-content flex-start
    flex 1 1 auto
    padding 10px 12px

  @media $media-laptop
    padding $m6 0

  &:active
    opacity .9

  &__icon
    padding-bottom $m4

    ^[0]._flat &
      padding-bottom 0
      padding-right $m5

  &__name
    overflow hidden
    min-height 16px
    text-overflow ellipsis
    padding 0 $m4
    font-size 14px
    text-align center

    ^[0]._flat &
      min-height inherit
      padding-top 1px
      color var(--c-font-3)
      text-align left

      .parent
        padding-bottom $m2
        font-size 12px

      .child
        font-size 16px

    &:last-child
      padding-bottom 0

  &__childNum
    position absolute
    top $m5
    right $m6
    display flex
    align-items center
    justify-content center
    font-secondary()
    color var(--c-font-4)
    font-size 18px
    font-weight 500
</style>
