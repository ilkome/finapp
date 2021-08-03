<script>
export default {
  props: {
    contentPadding: {
      type: Boolean,
      default: true
    }
  }
}
</script>

<template lang="pug">
.component(:class="{ _padding: contentPadding }")
  //------------------------------------------------
  //- header
  //------------------------------------------------
  .component__header(v-if="$slots.header || $slots.headerLeft || $slots.headerRight")
    .component__header-wrap(:class="{ _spaceBetween: $slots.headerLeft || $slots.headerRight }")
      slot(name="header")

      .component__header-left(v-if="$slots.headerLeft")
        slot(name="headerLeft")

      .component__header-right(v-if="$slots.headerRight")
        slot(name="headerRight")

  .component__header(v-else)

  //------------------------------------------------
  //- content
  //------------------------------------------------
  .component__content(:class="{ _scroll: $slots.bottom }")
    .component__content-main(v-if="$slots.content")
      slot(name="content")

    .component__content-left(v-if="$slots.contentLeft")
      slot(name="contentLeft")

    .component__content-right(v-if="$slots.contentRight")
      slot(name="contentRight")

    .component__content-bottom(v-if="$slots.bottom")
      .component__content-bottom-in
        slot(name="bottom")
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.component
  display grid
  grid-template-columns 1fr
  grid-template-rows minmax(auto, auto) 1fr minmax(auto, auto)
  height 100%

  &__header
    +media-laptop()
      background 0
      border-bottom 0

    +media(600px)
      padding-top $m8

    &-wrap
      max-width 1100px
      padding 12px 16px

      &._spaceBetween
        display flex
        align-items center
        justify-content space-between

      +media-laptop()
        padding 32px 60px
        padding-bottom 0

    &-left
      font-h1()
      font-size 22px
      font-weight 600

      +media-laptop()
        font-size 28px

  &__content
    overflow hidden
    overflow-y auto
    max-width 1100px
    scrollbar()

    ~/._padding &
      padding 16px

      +media-laptop()
        padding 32px 60px

    &._scroll
      display grid
      grid-template-rows minmax(min-content, auto) minmax(50px, min-content)

    &-main
      overflow hidden
      overflow-y auto
      display flex
      flex-flow column
      justify-content center
      height 100%
      scrollbar()

      +media(1100px)
        justify-content start

    &-left
      margin-bottom 16px

    &-right
      margin-bottom 16px

    &-bottom
      +media(600px)
        padding-bottom $m7

      &-in
        padding 16px

        ~/._padding &
          padding 0px
</style>
