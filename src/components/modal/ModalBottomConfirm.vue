<script>
import ModalBottom from '@/components/modal/ModalBottom'
import ModalButton from '@/components/modal/ModalButton'

export default {
  components: {
    ModalBottom,
    ModalButton
  },

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
  v-on:onClose="$emit('onClose')"
)
  template(v-if="description")
    template(slot="description")
      .descError {{ description }}

  template(slot="btns")
    ModalButton(
      name="Yes"
      icon="mdi mdi-check"
      v-on:onClick="$emit('onConfirm')"
    )
    ModalButton(
      name="Cancel"
      icon="mdi mdi-close-circle"
      v-on:onClick="$emit('onClose')"
    )
</template>

<style lang="stylus">
@import "~@/stylus/variables/margins"

.descError
  padding-bottom $m7
  color var(--c-expenses-1)
</style>
