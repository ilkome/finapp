<script>
export default {
  props: {
    center: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: null
    },
    show: {
      type: Boolean,
      required: true
    },
    paddingless: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    afterClose () {
      if (this.$listeners.afterClose) {
        this.$listeners.afterClose()
      }
    }
  }
}
</script>

<template lang="pug">
.modalBottom(
  :style="{ maxHeight: `${$store.state.ui.height}px`}"
  :class="{ _center: center, _paddingless: paddingless }")

  transition(name="fadeIn" appear)
    .modalBottom__overflow(@click="$listeners.onClose" v-show="show")

  transition(name="slide" appear v-on:after-leave="afterClose")
    .modalBottom__wrap(v-show="show")
      //- Header
      .modalBottom__header(
        @click="$listeners.onClose"
        ref="header")
        template(v-if="$slots.header")
          slot(name="header")
        template(v-else)
          .modalBottom__header__back: .mdi.mdi-chevron-left
          .modalBottom__header__title(v-if="title") {{ title }}

      //- Content
      .modalBottom__scroll(:style="{ maxHeight: `${$store.state.ui.height - 100}px`}")
        slot(name="description")

        template(v-if="$slots.btns")
          .modalLinks._noPadding
            slot(name="btns")

        slot()
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/media"

.modalBottom
  &__wrap
    ^[0]._center &
      @media $media-laptop
        margin 0 auto
</style>
