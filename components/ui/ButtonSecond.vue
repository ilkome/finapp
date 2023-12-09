<script setup lang="ts">
const props = defineProps<{
  icon?: string
  isShowDots?: boolean
  title?: string
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()

const classNames = computed(() => ({
  '!pr-3': props.isShowDots,
}))
</script>

<template lang="pug">
.wrap(
  :class="classNames"
  @click="emit('click')"
)
  .icon(v-if="icon")
    div(:class="icon")

  .grow(v-if="title") {{ title }}

  .check(
    v-if="showCheckbox"
    @click.prevent=""
  )
    SharedInputsCheckbox(v-model="checkboxValue")

  .mdi.mdi-dots-vertical.text-lg(v-if="isShowDots")
</template>

<style lang="stylus" scoped>
.wrap
  cursor pointer
  display flex
  align-items center
  width 100%
  min-height 48px
  padding $m6 $m8
  color var(--c-text-4)
  font-size 14px
  text-decoration none
  background var(--c-bg-4)
  border 1px solid var(--c-bg-5)
  border-radius $m5
  anim-background()

  +media-hover()
    background var(--c-item-bg-hover)
    border 1px solid var(--c-item-bd-hover)

.icon
  opacity .85
  margin-right $m6
  margin-left -5px
  font-size 18px
  text-align center

  &:last-child
    margin-right 0
    margin-right -5px

.check
  margin-left auto
  padding-left 32px
</style>
