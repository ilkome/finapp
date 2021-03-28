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
Portal(
  v-if="show"
  to="modal"
)
  ModalBottom(
    :title="$t('base.sure')"
    @onClose="$emit('onClose')"
  )
    template(v-if="description")
      template(slot="description")
        .descError {{ description }}

    template(#btnsTwo="{ closeModal }")
      ModalButton(
        :name="$t('base.no')"
        icon="mdi mdi-close"
        @onClick="closeModal"
      )
      ModalButton(
        :name="$t('base.yes')"
        icon="mdi mdi-check"
        @onClick="$emit('onConfirm')"
      )
</template>

<style lang="stylus">
@import '~assets/stylus/variables/margins'

.descError
  padding-bottom $m8
  color var(--c-expenses-1)
  text-align center
</style>
