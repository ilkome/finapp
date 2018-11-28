<script>
export default {
  props: {
    color: {
      type: String,
      default: ''
    },
    background: {
      type: String,
      default: null
    },
    abbr: {
      type: String,
      default: null
    },
    category: {
      type: Boolean,
      default: false
    },
    icon: {
      type: String,
      default: ''
    },
    round: {
      type: Boolean,
      default: false
    },
    small: {
      type: Boolean,
      default: false
    },
    big: {
      type: Boolean,
      default: false
    },
    invert: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    className () {
      return {
        _big: this.big,
        _category: this.category,
        _invert: this.invert,
        _round: this.round,
        _small: this.small
      }
    }
  }
}
</script>

<template lang="pug">
  .icon(
    :class="className"
    :style="{ background, color }")
    //- wallet
    template(v-if="abbr")
      .icon__abbr {{ abbr.substring(0, 2) }}
    //- category
    template(v-else)
      .icon__image
        template(v-if="icon")
          div(:class="icon")
        template(v-else)
          .mdi.mdi-chart-bubble
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/media"

.icon
  display flex
  align-items center
  justify-content center
  width 36px
  height 36px
  color var(--c-font-1)
  border-radius 3px

  @media $media-laptop
    width 32px
    height 32px

  &._invert
    color var(--c-font-5)
    background var(--c-bg-10)

  &._big
    width 48px
    height 48px

  &._round
    border-radius 50%

  &._small
    width 20px
    height 20px

  &._category
    width auto
    height auto
    padding-bottom $m5

  &__image
    font-size 20px

    ^[0]._category &
      font-size 32px

    ^[0]._big &
        font-size 24px

  &__abbr
    font-size 14px

    @media $media-laptop
      font-size 12px
      font-weight 500

    ^[0]._small &
      font-size 12px
</style>
