<script setup lang="ts">
const props = defineProps<{
  checkboxValue: boolean
  icon?: string
  showCheckbox: boolean
  title: string
}>()

const emit = defineEmits<{
  (e: 'onClick', value: boolean): void
  (e: 'onClose'): void
}>()

function handleClick() {
  emit('onClick', props.checkboxValue)
  emit('onClose')
}
</script>

<template>
  <div
    class="item my-2 grow"
    @click="handleClick"
  >
    <div v-if="icon" class="item__icon" />
    <div class="grow text-item-base">
      {{ title }}
    </div>

    <div v-if="showCheckbox" class="item__check" @click.prevent="">
      <SharedInputsCheckbox :value="checkboxValue" @click="handleClick" />
    </div>
  </div>
</template>

<style lang="stylus" scoped>
@import "../assets/stylus/variables"

.item
  cursor pointer
  display flex
  align-items center
  max-width 400px
  min-height 44px
  padding 0 10px
  font-size 14px
  border-radius 6px
  flex-grow 1
  width 100%
  max-width inherit

  @media $media-laptop
    max-width 320px
    min-height 38px

  +media-hover()
    background var(--c-item-bg-hover)

  &__icon
    opacity .85
    margin-right 16px
    font-size 22px
    text-align center

  &__title
    flex-grow 1
    color var(--c-font-3)
    font-size 14px

  &__check
    padding-left 20px
</style>
