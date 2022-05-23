<script>
export default {
  props: {
    description: {
      type: String,
      default: null,
    },
    show: {
      type: Boolean,
      default: false,
    },
  },
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

    template(#default="{ closeModal }")
      .pb-8.text-skin-red-base.text-center(v-if="description") {{ description }}

      .pb-4.px-2.flex.justify-evenly.gap-6
        ModalButton.grow(
          :name="$t('base.no')"
          icon="mdi mdi-close"
          @onClick="closeModal"
        )
        ModalButton.grow(
          :name="$t('base.yes')"
          icon="mdi mdi-check"
          @onClick="$emit('onConfirm')"
        )
</template>

<style lang="stylus">
@import '~assets/stylus/variables/margins'

.descError
  padding-bottom $m8
  color var(--c-expense-1)
  text-align center
</style>
