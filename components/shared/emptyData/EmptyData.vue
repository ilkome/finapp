<script>
export default {
  name: 'EmptyData',

  props: {
    text: {
      type: String,
      required: true
    }
  }
}
</script>

<template lang="pug">
.empty
  .empty__icon: .mdi.mdi-palm-tree
  .empty__text {{ text }}
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables/margins'

.empty
  padding $m10
  text-align center

  &__icon
    padding-bottom $m8
    color var(--c-font-4)
    font-size 100px

  &__text
    color var(--c-font-4)
    font-size 16px
    line-height 22px
</style>
