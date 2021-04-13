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
    medium: {
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
        _medium: this.medium,
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
        .mdi.mdi-folder-star
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables/margins'
@import '~assets/stylus/variables/media'

.icon
  display flex
  align-items center
  justify-content center
  width 32px
  height 32px
  color var(--c-font-1)
  border-radius $m5
  &._invert
    color var(--c-font-5)
    background var(--c-bg-10)
  &._round
    border-radius 50%
  &._small
    width 18px
    height 18px
  &._medium
    width 24px
    height 24px
  &._big
    width 48px
    height 48px
  &._category
    width auto
    height auto
    padding-bottom $m5
  &._category._small
    padding-bottom 0

  &__image
    font-size 20px
    ^[0]._small &
      font-size 14px
    ^[0]._medium &
      font-size 14px
    ^[0]._big &
      font-size 24px
    ^[0]._category &
      font-size 32px
    ^[0]._category._small &
      font-size 22px

  &__abbr
    font-size 12px
    font-weight 400

    ^[0]._small &
      font-size 10px
</style>
