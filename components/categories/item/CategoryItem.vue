<script>
import Icon from '~/components/icon/Icon'

export default {
  components: {
    Icon
  },

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

  .categoryItem__name {{ category.name }}
  .categoryItem__childNum(v-if="childCategoriesIds.length > 0") {{ childCategoriesIds.length }}
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/media"

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
    padding 8px 10px

  @media $media-laptop
    padding $m6 0

  &:active
    opacity .9

  &__icon
    padding-bottom $m4

    ^[0]._flat &
      padding-bottom 0
      padding-right $m3

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
      font-size 12px

    &:last-child
      padding-bottom 0

  &__childNum
    position absolute
    top $m5
    right $m6
    display flex
    align-items center
    justify-content center
    font-size 18px
    font-weight 500
</style>
