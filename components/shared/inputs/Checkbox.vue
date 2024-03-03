<script setup lang="ts">
const props = defineProps<{
  value: boolean
  title?: string
}>()

const emit = defineEmits<{
  (e: 'click', value: boolean): void
}>()
</script>

<template lang="pug">
.checkboxBlock(@click="emit('click', !value)")
  .checkbox__title(v-if="title") {{ title }}

  .checkbox(:class="{ _active: value }")
    .checkbox__in
</template>

<style lang="stylus" scoped>
@import "../assets/stylus/variables"

.checkboxBlock
  display flex
  align-items center

.checkbox
  position relative
  width 44px
  height 24px
  background var(--c-bg-8)
  border-radius 20px
  anim()

  &._active
    background var(--c-blue-3)

  &__in
    position absolute
    top 2px
    left 3px
    width 20px
    height 20px
    background var(--c-font-2)
    border-radius 20px
    box-shadow 0 0 4px rgba(0, 0, 0, .25)
    anim()

    /.light &
      background var(--c-bg-1)

    ^[0]._active &
      transform translateX(18px)

  &__title
    flex-grow 1
    padding-right 16px
</style>
