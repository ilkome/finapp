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
    },

    activeItemId: {
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
      if (this.$listeners.onClick)
        this.$listeners.onClick(this.id)
    },

    handleIconClick () {
      if (this.$listeners.onIconClick)
        this.$listeners.onIconClick(this.id)
    }
  }
}
</script>

<template lang="pug">
.categoryItem(
  :class="{ [ui]: ui, _active: activeItemId === id }"
  @click="handleClick"
)
  .categoryItem__active(v-if="activeItemId === id")
  .categoryItem__icon
    Icon(
      :category="true"
      :color="category.color || $store.state.ui.defaultBgColor"
      :icon="category.icon"
      small
      @click="handleIconClick"
    )

  .categoryItem__name(:class="{ _flat: ui === '_flat' }")
    .categoryItem__parent(v-if="ui === '_flat' && parentCategory") {{ parentCategory.name }}
    .categoryItem__child {{ category.name }}
    .categoryItem__length(v-if="childCategoriesIds.length > 0") {{ childCategoriesIds.length }}

  //- .categoryItem__dots(v-if="childCategoriesIds.length > 0"): .mdi.mdi-dots-vertical
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.categoryItem
  overflow hidden
  cursor pointer
  position relative
  display flex
  flex-flow row nowrap
  align-items center
  justify-content center
  min-height 48px
  padding $m6
  color var(--c-font-1)
  background var(--color-item-bg)
  border-radius $m5
  anim()

  +media-hover()
    color var(--c-text-1)
    border 1px solid var(--c-blue-1)

  +media(700px)
    padding $m7 $m8

  &._flat
    flex-flow row
    align-items center
    justify-content center
    min-height inherit
    flex 1 1 auto
    padding $m6

  &:active
    opacity .9

  &__icon
    padding-right $m6

    ^[0]._flat &
      padding-right $m5
      padding-bottom 0

  &__name
    overflow hidden
    display flex
    flex-grow 1
    text-overflow ellipsis
    padding-right 0
    font-size 14px

    ^[0]._flat &
      display block
      flex-grow 1
      min-height inherit

    &:last-child
      padding-bottom 0

  &__length
    margin-left auto
    padding-left $m6
    color var(--c-font-4)
    font-size 12px

    ^[0]._flat &
      text-align left

  &__parent
    padding-bottom $m3
    color var(--c-font-4)
    font-size 12px
    text-align center

    ^[0]._flat &
      text-align left

  &__child
    color var(--c-font-1)
    font-size 14px
    text-align center

    /.light-mode &
      color var(--c-font-4)

    ^[0]._flat &
      text-align left

  &__dots
    position absolute
    top $m5
    right $m4
    color var(--c-font-5)
    font-size 18px

  &__active
    position absolute
    top $m5
    right $m5
    display flex
    align-items center
    justify-content center
    width 8px
    height 8px
    background var(--c-blue-1)
    border-radius 50%
</style>
