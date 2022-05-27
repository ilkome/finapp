<script lang="ts">
import useCalculator from './useCalculator'
import './long-press-event'

export default {
  name: 'TrnFormCalculator',

  setup() {
    const { $store } = useNuxtApp()
    const amountType = computed(() => $store.state.trnForm.values.amountType)

    const deleteRef = ref(document.createElement('div'))

    const {
      clearExpression,
      handleTouch,
      isSum,
      keyboardHandler,
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
      amountType,

      isSum,
      deleteRef,
      handleTouch,
    }
  },
}
</script>

<template lang="pug">
.trnFormCalculator.px-4.pb-4
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
      .calcItem(@click="handleTouch('7')")
        .calcItem__in 7
      .calcItem(@click="handleTouch('8')")
        .calcItem__in 8
      .calcItem(@click="handleTouch('9')")
        .calcItem__in 9

      .calcItem(@click="handleTouch('4')")
        .calcItem__in 4
      .calcItem(@click="handleTouch('5')")
        .calcItem__in 5
      .calcItem(@click="handleTouch('6')")
        .calcItem__in 6

      .calcItem(@click="handleTouch('1')")
        .calcItem__in 1
      .calcItem(@click="handleTouch('2')")
        .calcItem__in 2
      .calcItem(@click="handleTouch('3')")
        .calcItem__in 3

      .calcItem(@click="handleTouch('.')")
        .calcItem__in .
      .calcItem(@click="handleTouch('0')")
        .calcItem__in 0
      .calcItem(
        ref="deleteRef"
        data-long-press-delay="300"
        @click="handleTouch('delete')"
      )
        .calcItem__in C

  .trnFormCalculator__group
    .grid.gap-2(class="grid-rows-[auto,1fr]")
      .p-3.text-center.rounded-full.opacity-80.hocus_bg-neutral-700(
        :class="['h-[58px]', { 'text-blue1': $store.state.trnForm.values.description }]"
        @click="$store.commit('trnForm/showTrnFormModal', 'description')"
      )
        .mdi.mdi-comment-text-outline.text-2xl

      .trnFormCalculator__action
        .calcItem._sum(@click="isSum ? $emit('onSubmit') : handleTouch('=')")
          .calcItem__in
            template(v-if="isSum")
              .mdi.mdi-check
            template(v-else)
              .mdi.mdi-equal
</template>

<style lang="stylus" scoped>
.trnFormCalculator
  display grid
  grid-template-columns auto 1fr auto
  align-items stretch
  grid-column-gap $m8
  grid-row-gap $m8

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
    max-width 240px

.calcItem
  display flex
  align-items center
  justify-content center
  font-secondary()

  &._sum
    max-width 58px

  &__in
    cursor pointer
    display flex
    align-items center
    justify-content center
    width 44px
    height 44px
    padding $m7
    color var(--c-font-3)
    font-size 22px
    background var(--c-item-bg-main)
    border 1px solid var(--c-item-bd-main)
    border-radius 50%
    user-select none
    anim(100ms)

    +media(360px)
      width 58px
      height 58px

    ~/._sum &
      width 100%
      height 100%
      color var(--c-font-1)
      font-size 40px
      background var(--c-blue-1) !important
      border-color transparent !important
      border none
      border-radius 6px
      +media-hover()
        transform scale(1.04)

    +media-hover()
      background var(--c-bg-7)
      border 1px solid var(--c-bg-8)
</style>
