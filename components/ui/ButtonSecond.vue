<script setup lang="ts">
const props = defineProps<{
  icon?: string
  isShowDots?: boolean
  title?: string
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()

const classes = computed(() => ({
  '!pr-3': props.isShowDots,
}))
</script>

<template>
  <div class="wrap" :class="classes" @click="emit('click')">
    <div v-if="icon" class="icon" />

    <div v-if="title" class="grow">
      {{ title }}
    </div>

    <div v-if="isShowDots" class="mdi mdi-dots-vertical text-lg" />
  </div>
</template>

<style lang="stylus" scoped>
@import "../assets/stylus/variables"

.wrap
  cursor pointer
  display flex
  align-items center
  width 100%
  min-height 48px
  padding 10px 20px
  color var(--c-text-4)
  font-size 14px
  text-decoration none
  background var(--c-bg-4)
  border 1px solid var(--c-bg-5)
  border-radius 6px
  anim-background()

  +media-hover()
    background var(--c-item-bg-hover)
    border 1px solid var(--accent-4)

.icon
  opacity .85
  margin-right 10px
  margin-left -5px
  font-size 18px
  text-align center

  &:last-child
    margin-right 0
    margin-right -5px
</style>
