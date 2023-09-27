<script setup lang="ts">
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const { $store } = useNuxtApp()
const $trnForm = useTrnFormStore()

const description = ref('')

function handleCancel(close) {
  description.value = ''
  close()
}

function handleSave(close) {
  $trnForm.values.desc = description.value
  close()
}

function afterClose() {
  $store.commit('trnForm/closeTrnFormModal', 'description')
}

onMounted(() => {
  description.value = $trnForm.values.desc ?? ''
})
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

    .pb-4.px-3
      .cursor-pointer.grow.py-3.px-5.flex-center.rounded-full.text-skin-item-base-up.text-sm.bg-skin-accent-base.hocus_bg-skin-accent-down(
        @click="handleSave(close)"
      ) {{ $t('base.save') }}
</template>
