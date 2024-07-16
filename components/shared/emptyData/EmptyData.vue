<script>
export default {
  name: 'EmptyData',

  props: {
    text: {
      required: true,
      type: String,
    },
  },
}
</script>

<template>
  <div class="empty">
    <div class="empty__icon mdi mdi-palm-tree" />
    <div class="empty__text">
      {{ text }}
    </div>
  </div>
</template>

<style lang="stylus" scoped>
@import "../assets/stylus/variables/*"

.empty
  padding 40px
  text-align center

  &__icon
    padding-bottom 20px
    color var(--c-font-4)
    font-size 100px

  &__text
    color var(--c-font-4)
    font-size 16px
    line-height 22px
</style>
