<script>
import ContextMenuItem from '@/components/shared/contextMenu/ContextMenuItem'

export default {
  components: {
    ContextMenuItem
  },

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
    }
  }
}
</script>

<template lang="pug">
.context-menu
  transition(name="slide2")
    .context-menu__popup(:class="className" v-show="visible")
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

<style lang="stylus">
.context-menu-sep
  height 1px
  background var(--c-bg-8)
</style>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"

.context-menu
  z-index 1
  position relative

  &__opener
    z-index 22
    position relative

  &__overflow
    z-index 11
    position fixed
    left 0
    top 0
    width 100%
    height 100%

  &__popup
    overflow hidden
    z-index 22
    position absolute
    top 48px
    min-width 200px
    padding $m3
    background var(--c-bg-2)
    border 1px solid var(--c-bg-8)
    border-radius $m3
    box-shadow 0 10px 20px -5px var(--c-bg-1)

    /.theme-light &
      background var(--c-bg-7)

    &._right
      right 0

    &._bottom
      top inherit
      bottom 48px

  &__content
    z-index 12
    position relative
    background var(--c-bg-7)

    /.theme-light &
      background var(--c-bg-7-a)

  &__desc
    display flex
    align-items center
    padding $m7 $m7
    font-size 12px
    color var(--c-font-4)
    background var(--c-bg-8)

    /.theme-light &
      background var(--c-bg-1)
</style>
