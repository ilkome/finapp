<script>
export default {
  props: {
    checkboxValue: { type: Boolean, default: false },
    grow: { type: Boolean, default: true },
    icon: { type: String, default: null },
    selected: { type: Boolean, default: false },
    showCheckbox: { type: Boolean, default: false },
    title: { type: String, required: true },
  },

  methods: {
    handleClick() {
      this.$emit('onClick')
      if (this.$listeners.onClose)
        this.$listeners.onClose()
    },
  },
}
</script>

<template lang="pug">
.item.grow.my-2(
  :class="{ _selected: selected, _grow: grow }"
  @click="handleClick"
)
  .item__icon(v-if="icon"): div(:class="icon")
  .grow.text-item-base {{ title }}

  .item__check(
    v-if="showCheckbox"
    @click.prevent=""
  )
    SharedInputsCheckbox(v-model="checkboxValue")
</template>

<style lang="stylus" scoped>
.item
  cursor pointer
  display flex
  align-items center
  flex-grow 0
  max-width 400px
  min-height 44px
  padding 0 $m6
  font-size 14px
  border-radius $m5

  @media $media-laptop
    max-width 320px
    min-height 38px

  &._grow
    flex-grow 1
    width 100%
    max-width inherit

  &._selected
    background var(--c-bg-2)

  +media-hover()
    background var(--c-item-bg-hover)

  &__icon
    opacity .85
    margin-right $m7
    font-size 22px
    text-align center

  &__title
    flex-grow 1
    color var(--c-font-3)
    font-size 14px

  &__check
    padding-left $m8
</style>
