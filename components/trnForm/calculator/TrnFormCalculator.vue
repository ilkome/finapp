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
    .trnFormCalculator__group
      .trnFormCalculator__acts
        .calcItem._act(@click="handleTouch('+')")
          .calcItem__in: .mdi.mdi-plus
        .calcItem._act(@click="handleTouch('-')")
          .calcItem__in: .mdi.mdi-minus
        .calcItem._act(@click="handleTouch('*')")
          .calcItem__in: .mdi.mdi-plus(style="transform: rotate(45deg)")
        .calcItem._act(@click="handleTouch('/')")
          .calcItem__in: .mdi.mdi-slash-forward

    .trnFormCalculator__group
      .trnFormCalculator__numbers
        .calcItem._num(@click="handleTouch('7')")
          .calcItem__in 7
        .calcItem._num(@click="handleTouch('8')")
          .calcItem__in 8
        .calcItem._num(@click="handleTouch('9')")
          .calcItem__in 9

        .calcItem._num(@click="handleTouch('4')")
          .calcItem__in 4
        .calcItem._num(@click="handleTouch('5')")
          .calcItem__in 5
        .calcItem._num(@click="handleTouch('6')")
          .calcItem__in 6

        .calcItem._num(@click="handleTouch('1')")
          .calcItem__in 1
        .calcItem._num(@click="handleTouch('2')")
          .calcItem__in 2
        .calcItem._num(@click="handleTouch('3')")
          .calcItem__in 3

        .calcItem._num._grey(@click="handleTouch('.')")
          .calcItem__in .
        .calcItem._num(@click="handleTouch('0')")
          .calcItem__in 0
        .calcItem._clear(
          ref="deleteRef"
          data-long-press-delay="300"
          @click="handleTouch('delete')"
        )
          .calcItem__in C

    .trnFormCalculator__group
      .trnFormCalculator__action
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
  grid-template-columns auto 1fr auto
  align-items stretch
  grid-column-gap $m8
  grid-row-gap $m8
  padding $m7

  &__group
    display flex
    align-items stretch
    justify-content center

  &__action
    display flex
    align-items stretch

  &__acts
    display grid
    grid-template-columns 1fr
    grid-column-gap $m5
    grid-row-gap $m5

  &__numbers
    flex-grow 1
    display grid
    grid-template-columns repeat(3, 1fr)
    grid-column-gap $m5
    grid-row-gap $m5
    align-items space-between
    justify-content space-between

.calcItem
  display flex
  align-items center
  justify-content center
  font-secondary()

  ~/._pc
    padding 0 $m7

  &__in
    display flex
    align-items center
    justify-content center
    width 58px
    height 58px
    padding $m7
    color var(--c-font-3)
    font-size 22px
    border-bottom 0
    border-right 0
    background var(--c-bg-4)
    border-radius 50%
    user-select none
    anim()

    ~/._num &
      background var(--c-bg-5)

    ~/._grey &
      background var(--c-bg-4)

    ~/._clear &
    ~/._dot &
      color var(--c-font-4)

    ~/._sum &
      width 100%
      height 100%
      color var(--c-font-1)
      font-size 40px
      background var(--c-blue-1)
      border-radius 6px

      ~/._expenses &
        background var(--c-expenses-1)

      ~/._incomes &
        background var(--c-incomes-1)

    &:active
      transform scale(1.1)
</style>
