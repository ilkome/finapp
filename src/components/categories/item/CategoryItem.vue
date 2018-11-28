<script>
import Icon from '@/components/icon/Icon'

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
    }
  },

  computed: {
    childCategoriesIds () {
      return this.$store.getters.getChildCategoriesIds(this.id)
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
  :style="{ background: category.color || $store.state.ui.defaultBgColor }"
  @click="handleClick"
)
  .categoryItem__icon
    Icon(
      @click="handleIconClick"
      :icon="category.icon"
      :background="category.color || $store.state.ui.defaultBgColor"
      :category="true"
    )

  .categoryItem__content
    .categoryItem__name {{ category.name }}
    .categoryItem__child(v-if="childCategoriesIds.length > 0") {{ childCategoriesIds.length }}
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/media"

.categoryItem
  overflow hidden
  position relative
  display flex
  flex-flow column nowrap
  align-items center
  justify-content center
  padding $m7 0
  color var(--c-font-1)
  border-radius $m3

  @media $media-laptop
    padding $m6 0

  &:active
    opacity .9

  &__icon
    padding-bottom $m4

  &__name
    min-height 16px
    overflow hidden
    text-overflow ellipsis
    padding 0 $m4
    font-size 14px
    text-align center

    &:last-child
      padding-bottom 0

  &__child
    position absolute
    right $m6
    top $m5
    display flex
    align-items center
    justify-content center
    font-size 18px
    font-weight 500
</style>
