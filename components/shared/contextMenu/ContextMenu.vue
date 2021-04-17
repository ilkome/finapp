<script>
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    openerCircle: {
      type: Boolean,
      default: false
    },
    position: {
      type: Object,
      default: () => {}
    }
  },

  computed: {
    className () {
      return {
        _bottom: this.position && this.position.bottom,
        _right: this.position && this.position.right,
        _top: this.position && this.position.top
      }
    },

    positionStyles () {
      if (this.position && this.position.left && typeof this.position.left === 'string') {
        return {
          left: this.position.left
        }
      }
      if (this.position && this.position.right && typeof this.position.right === 'string') {
        if (this.position.top && typeof this.position.top === 'string') {
          return {
            right: this.position.right,
            top: this.position.top
          }
        }
        return {
          right: this.position.right
        }
      }

      return null
    }
  }
}
</script>

<template lang="pug">
.context-menu
  transition(name="slide2")
    .context-menu__popup(
      v-if="$slots.content"
      v-show="visible"
      :class="className"
      :style="positionStyles"
    )
      .context-menu__overflow(@click="$emit('onClickOpener')")
      .context-menu__content
        slot(name="content")
      .context-menu__desc(v-if="$slots.desc")
        slot(name="desc")

  .context-menu__opener(@click="$emit('onClickOpener')")
    template(v-if="$slots.opener")
      slot(name="opener")
    template(v-else)
      template(v-if="openerCircle")
        .d-button-cirle: .mdi.mdi-dots-horizontal
      template(v-else)
        .d-button._noPadding._grey: .mdi.mdi-tune
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables/margins'

.context-menu
  z-index 6
  position relative

  &__opener
    z-index 22
    position relative

  &__overflow
    z-index 11
    position fixed
    top 0
    left 0
    width 100%
    height 100%

  &__popup
    overflow hidden
    z-index 20
    position absolute
    top 48px
    min-width 200px
    background var(--c-bg-2)
    border 1px solid var(--c-bg-6)
    border-radius $m6
    box-shadow 0 10px 20px -5px var(--c-bg-1)

    /.light-mode &
      background var(--c-bg-3)
      border 1px solid var(--c-bg-5)

    &._right
      right 0

    &._bottom
      top inherit
      bottom 48px

  &__content
    z-index 12
    position relative

  &__desc
    display flex
    align-items center
    padding 10px 16px
    color var(--c-font-4)
    font-size 11px
    background var(--c-bg-4)
    border-top 1px solid var(--c-bg-6)
</style>
