<script>
import { ref, computed, watch, useContext } from '@nuxtjs/composition-api'
import useCalculator from '~/components/trnForm/calculator/useCalculator'

export default {
  name: 'TrnFormModalDescription',

  setup () {
    const { store } = useContext()
    const { setKeysActive } = useCalculator()
    const description = ref('')

    const isShow = computed(() => store.state.trnForm.modal.description)

    watch(isShow, (value) => {
      if (value) {
        description.value = store.state.trnForm.values.description
        setKeysActive(false)
      }
      else {
        setKeysActive(true)
      }
    })

    return {
      description,
      isShow
    }
  },

  methods: {
    handleCancel () {
      this.description = null
      this.$store.commit('trnForm/toogleTrnFormModal', 'description')
    },
    handleSave () {
      this.$store.commit('trnForm/setTrnFormValues', { description: this.description })
      this.$store.commit('trnForm/toogleTrnFormModal', 'description')
    }
  }
}
</script>

<template lang="pug">
TrnFormModal(
  v-if="isShow"
  :show="isShow"
  :title="$t('trnForm.description.title')"
  :position="$store.state.ui.mobile ? 'bottom' : null"
  @onClose="$store.commit('trnForm/toogleTrnFormModal', 'description')"
)
  .description
    .description__filed
      textarea.textarea(
        v-model="description"
        :placeholder="$t('trnForm.description.placeholder')"
      )

    .description__action
      .description__action-cancel
        Button(
          className="_grey _inline"
          :title="$t('base.cancel')"
          @onClick="handleCancel"
        )
      .description__action-ok
        Button(
          className="_blue _inline"
          :title="$t('base.save')"
          @onClick="handleSave"
        )
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/media"

.description
  padding 0 $m7

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

  &:focus
    border-color var(--c-blue-1)
</style>
