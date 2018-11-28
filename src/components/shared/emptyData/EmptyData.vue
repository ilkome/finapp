<script>
export default {
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
  .empty__icon: .mdi.mdi-flask-empty-outline
  .empty__text {{ text }}
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"

.empty
  padding $m10
  text-align center

  &__icon
    padding-bottom $m8
    color var(--c-font-4)
    font-size 160px

  &__text
    color var(--c-font-4)
    font-size 18px
</style>
