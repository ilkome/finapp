<script>
import { ref, computed, onMounted, useContext } from '@nuxtjs/composition-api'
import useCalculator from '~/components/trnForm/calculator/useCalculator'

export default {
  name: 'TrnFormModalDescription',

  setup () {
    const { store } = useContext()
    const { setKeysActive } = useCalculator()
    const description = ref('')

    onMounted(() => {
      description.value = store.state.trnForm.values.description
      setKeysActive(false)
    })

    return {
      description,
      setKeysActive
    }
  },

  methods: {
    handleCancel (close) {
      this.description = null
      close()
    },

    handleSave (close) {
      this.$store.commit('trnForm/setTrnFormValues', { description: this.description })
      close()
    },

    afterClose () {
      this.setKeysActive(true)
      this.$store.commit('trnForm/closeTrnFormModal', 'description')
    }
  }
}
</script>

<template lang="pug">
TrnFormModal(@closed="afterClose")
  template(#header)
    template {{ $t('trnForm.description.title') }}

  template(#default="{ close }")
    .description
      .description__filed
        textarea.textarea(
          v-model="description"
          :placeholder="$t('trnForm.description.placeholder')"
        )

      .description__action
        .description__action-cancel
          SharedButton(
            className="_grey _inline"
            :title="$t('base.cancel')"
            @onClick="handleCancel(close)"
          )
        .description__action-ok
          SharedButton(
            className="_blue _inline"
            :title="$t('base.save')"
            @onClick="handleSave(close)"
          )
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.description
  padding 0 $m7
  padding-bottom 16px

  &__filed
    padding-bottom $m9

  &__action
    display flex
    align-items center

    &-ok
      margin-left $m9

.btnTrans
  padding $m7 $m9
  border-radius $m3

.textarea
  width 100%
  min-height 100px
  padding $m7
  color var(--color-white)
  font-size 16px
  background var(--c-bg-2)
  border 1px solid var(--c-bg-5)
  border-radius $borderRadiusMd
  anim()

  &:focus
    border-color var(--c-blue-1)
</style>
