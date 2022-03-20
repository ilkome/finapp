<script lang="ts">
import useCalculator from '~/components/trnForm/calculator/useCalculator'

export default {
  name: 'TrnFormModalDescription',

  setup() {
    const { $store } = useNuxtApp()
    const { setKeysActive } = useCalculator()
    const description = ref('')

    onMounted(() => {
      description.value = $store.state.trnForm.values.description
      setKeysActive(false)
    })

    return {
      description,
      setKeysActive,
    }
  },

  methods: {
    handleCancel(close) {
      this.description = null
      close()
    },

    handleSave(close) {
      this.$store.commit('trnForm/setTrnFormValues', { description: this.description })
      close()
    },

    afterClose() {
      this.setKeysActive(true)
      this.$store.commit('trnForm/closeTrnFormModal', 'description')
    },
  },
}
</script>

<template lang="pug">
TrnFormModal(@closed="afterClose")
  template(#header)
    template {{ $t('trnForm.description.title') }}

  template(#default="{ close }")
    .pb-6.px-3
      textarea.w-full.h-28.m-0.py-3.px-4.rounded-lg.text-base.font-normal.text-skin-item-base.bg-skin-item-main-bg.border.border-solid.border-skin-item-main-hover.placeholder_text-skin-item-base-down.transition.ease-in-out.focus_text-skin-item-base-up.focus_bg-skin-item-main-hover.focus_border-blue3.focus_outline-none(
        v-model="description"
        :placeholder="$t('trnForm.description.placeholder')"
      )

    .pb-4.px-3.flex.justify-evenly.gap-6
      .cursor-pointer.grow.py-3.px-5.flex-center.rounded-full.text-skin-item-base-down.text-sm.bg-skin-item-main-bg.hocus_bg-skin-item-main-hover(
        class="basis-1/2 max-w-[280px]"
        @click="handleCancel(close)"
      ) {{ $t('close') }}

      .cursor-pointer.grow.py-3.px-5.flex-center.rounded-full.text-skin-item-base-up.text-sm.bg-skin-accent-base.hocus_bg-skin-accent-down(
        class="basis-1/2 max-w-[280px]"
        @click="handleSave(close)"
      ) {{ $t('base.save') }}
</template>
