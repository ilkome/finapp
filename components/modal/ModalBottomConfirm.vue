<script>
export default {
  props: {
    description: {
      type: String,
      default: null
    },
    show: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<template lang="pug">
ModalBottom(
  :show="show"
  title="Are you sure?"
  @onClose="$emit('onClose')"
)
  template(v-if="description")
    template(slot="description")
      .descError {{ description }}

  template(slot="btns")
    ModalButton(
      name="Yes"
      icon="mdi mdi-check"
      @onClick="$emit('onConfirm')"
    )
    ModalButton(
      name="Cancel"
      icon="mdi mdi-close-circle"
      @onClick="$emit('onClose')"
    )
</template>

<style lang="stylus">
@import "~assets/stylus/variables/margins"

.descError
  padding-bottom $m7
  color var(--c-expenses-1)
</style>
