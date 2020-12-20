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
      :color="category.color || $store.state.ui.defaultBgColor"
      :category="true"
    )

  .categoryItem__name
    .parent(v-if="childCategoriesIds.length > 0") {{ childCategoriesIds.length }}
    .parent(v-if="ui === '_flat' && parentCategory") {{ parentCategory.name }}
    .child {{ category.name }}

  .categoryItem__dots(v-if="childCategoriesIds.length > 0"): .mdi.mdi-dots-vertical
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables/margins'
@import '~assets/stylus/variables/media'
@import '~assets/stylus/variables/fonts'

.categoryItem
  overflow hidden
  cursor pointer
  position relative
  display flex
  flex-flow column nowrap
  align-items center
  justify-content center
  padding $m6
  color var(--c-font-1)
  background var(--c-bg-6)
  border-radius $m5

  &._flat
    flex-flow column
    align-items center
    justify-content center
    flex 1 1 auto
    padding $m6

  @media $media-laptop
    padding $m6 0

  &:active
    opacity .9

  &__icon
    padding-bottom $m4

    ^[0]._flat &
      padding-bottom $m3

  &__name
    overflow hidden
    min-height 16px
    text-overflow ellipsis
    padding 0 $m4
    font-size 14px
    text-align center

    ^[0]._flat &
      min-height inherit

    &:last-child
      padding-bottom 0

  .parent
    padding-bottom $m3
    color var(--c-font-4)
    font-size 12px
    text-align center

  .child
    color var(--c-font-1)
    font-size 14px
    text-align center

    /.light-mode &
      color var(--c-font-4)

  &__dots
    position absolute
    top $m5
    right $m4
    color var(--c-font-5)
    font-size 18px
</style>
