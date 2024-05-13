<script setup lang="ts">
const props = defineProps<{
  abbr?: string | null
  background?: string
  big?: boolean
  category?: boolean
  color?: string
  icon?: string
  invert?: boolean
  medium?: boolean
  round?: boolean
  small?: boolean
}>()

const classes = computed(() => ({
  _big: props.big,
  _category: props.category,
  _invert: props.invert,
  _round: props.round,
  _medium: props.medium,
  _small: props.small,
}))
</script>

<template>
  <div
    class="icon"
    :class="classes"
    :style="{ background, color }"
  >
    <!-- Wallet -->
    <template v-if="abbr">
      <div class="icon__abbr">
        {{ abbr.substring(0, 2) }}
      </div>
    </template>

    <!-- Category -->
    <template v-else>
      <div class="icon__image">
        <template v-if="icon">
          <div :class="icon" />
        </template>
        <template v-else>
          <div class="mdi mdi-folder-star" />
        </template>
      </div>
    </template>
  </div>
</template>

<style lang="stylus" scoped>
@import '../assets/stylus/variables'

.icon
  display flex
  align-items center
  justify-content center
  width 32px
  height 32px
  color var(--c-font-1)
  border-radius 6px

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
    padding-bottom 6px
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
