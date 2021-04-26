<script lang="ts">
import { ref, onMounted, onUnmounted } from '@nuxtjs/composition-api'
import useCalculator from './useCalculator'
import './long-press-event'

export default {
  name: 'TrnFormCalculator',

  props: {
    pc: {
      type: Boolean,
      default: false
    }
  },

  setup () {
    const deleteRef = ref(document.createElement('div'))

    const {
      clearExpression,
      handleTouch,
      isSum,
      keyboardHandler
    } = useCalculator()

    // Mounted
    onMounted(() => {
      document.addEventListener('keydown', keyboardHandler)

      // Long press for delete
      const element: HTMLElement = deleteRef.value
      element.addEventListener('long-press', clearExpression)
    })

    // Unmounted
    onUnmounted(() => {
      document.removeEventListener('keydown', keyboardHandler)
    })

    return {
      isSum,
      deleteRef,
      handleTouch
    }
  }
}
</script>

<template lang="pug">
div
  .trnFormSharedButton(v-if="pc")
    .calcItem._sum._pc(
      @click="isSum ? $emit('onSubmit') : handleTouch('=')"
    )
      SharedButton(
        :title="isSum ? $t('trnForm.saveTrnButton') : $t('trnForm.calcTrnButton')"
        className="_blue2 _text-center _ttu"
      )

  .trnFormCalculator(v-if="!pc")
    .calcItem._act(@click="handleTouch('+')")
      .calcItem__in +
    .calcItem._num(@click="handleTouch('7')")
      .calcItem__in 7
    .calcItem._num(@click="handleTouch('8')")
      .calcItem__in 8
    .calcItem._num(@click="handleTouch('9')")
      .calcItem__in 9

    .calcItem._act(@click="handleTouch('-')")
      .calcItem__in -
    .calcItem._num(@click="handleTouch('4')")
      .calcItem__in 4
    .calcItem._num(@click="handleTouch('5')")
      .calcItem__in 5
    .calcItem._num(@click="handleTouch('6')")
      .calcItem__in 6

    .calcItem._act(@click="handleTouch('*')")
      .calcItem__in *
    .calcItem._num(@click="handleTouch('1')")
      .calcItem__in 1
    .calcItem._num(@click="handleTouch('2')")
      .calcItem__in 2
    .calcItem._num(@click="handleTouch('3')")
      .calcItem__in 3

    .calcItem._act(@click="handleTouch('/')")
      .calcItem__in /
    .calcItem._dot(@click="handleTouch('.')")
      .calcItem__in .
    .calcItem._num(@click="handleTouch('0')")
      .calcItem__in 0
    .calcItem._clear(
      ref="deleteRef"
      data-long-press-delay="300"
      @click="handleTouch('delete')"
    )
      .calcItem__in <

    .calcItem._sum(
      @click="isSum ? $emit('onSubmit') : handleTouch('=')"
    )
      .calcItem__in
        template(v-if="isSum")
          .mdi.mdi-check
        template(v-else)
          .mdi.mdi-equal
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.trnFormButton
  padding $m7

.trnFormCalculator
  display grid
  grid-template-columns repeat(5, minmax(10px, 1fr))
  grid-template-rows repeat(4, minmax(10px, 1fr))
  grid-column-gap 8px
  grid-row-gap 8px
  padding $m7

.calcItem
  display flex
  align-items center
  justify-content center
  font-secondary()
  anim()

  ~/._sum
    grid-column 5 / 6
    grid-row 1 / -1
    align-items stretch
    padding-left 4px
    color var(--c-font-1)

  ~/._pc
    padding 0 $m7

  &__in
    display flex
    align-items center
    justify-content center
    width 40px
    height 40px
    font-size 26px
    border-bottom 0
    border-right 0
    background var(--c-bg-4)
    border-radius 50%
    user-select none

    @media $media-phone-normal
      padding $m8

    ~/._num &
      color var(--c-font-3)
      font-size 22px
      background var(--c-bg-5)

    ~/._act &
      color var(--c-font-4)

    ~/._clear &
    ~/._dot &
      color var(--c-font-5)

    ~/._sum &
      width 100%
      height 100%
      font-size 40px
      background var(--c-blue-1)
      border-radius 6px

      ~/._expenses &
        background var(--c-expenses-1)

      ~/._incomes &
        background var(--c-incomes-1)

    &:active
      background var(--c-bg-3)
      transform scale(1.1)
</style>
