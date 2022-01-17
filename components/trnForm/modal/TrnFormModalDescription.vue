<script lang="ts">
import useCalculator from '~/components/trnForm/calculator/useCalculator'

export default {
  name: 'TrnFormModalDescription',

  setup () {
    const { $store } = useNuxtApp()
    const { setKeysActive } = useCalculator()
    const description = ref('')

    onMounted(() => {
      description.value = $store.state.trnForm.values.description
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
    .p-4.pb-2
      .relative.pb-6
        textarea.textarea.rounded-md(
          v-model="description"
          :placeholder="$t('trnForm.description.placeholder')"
        )

      .gap-4.items-center.justify-end.flex
        .text-neutral-500.py-4.px-3.items-center.justify-center.flex(
          class="dark:text-neutral-400"
          @click="handleCancel(close)"
        ) {{ $t('close') }}
        .shame1.py-4.px-6.rounded-full.items-center.justify-center.flex(
          class="min-w-[120px]"
          @click="handleSave(close)"
        ) {{ $t('base.save') }}
</template>

<style lang="stylus" scoped>
.shame1
  background var(--c-blue-3)
  media-hover()
    background var(--c-blue-3)

.textarea
  width 100%
  min-height 100px
  padding $m7
  color var(--color-white)
  font-size 16px
  background var(--c-bg-2)
  border 1px solid var(--c-bg-5)
  anim()

  &:focus
    border-color var(--c-blue-1)

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
