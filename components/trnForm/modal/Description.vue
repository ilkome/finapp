<script setup lang="ts">
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const { $store } = useNuxtApp()
const $trnForm = useTrnFormStore()

const description = ref('')

function handleCancel(close) {
  description.value = ''
  close()
}

function onSave(close) {
  $trnForm.values.desc = description.value
  close()
}

function closed() {
  $store.commit('trnForm/closeTrnFormModal', 'description')
}

onMounted(() => {
  description.value = $trnForm.values.desc ?? ''
})
</script>

<template lang="pug">
TrnFormModal(@closed="closed")
  template(#header)
    template {{ $t('trnForm.description.title') }}

  template(#default="{ close }")
    .pb-6.px-3
      textarea.w-full.h-28.m-0.py-3.px-4.rounded-lg.text-base.font-normal.text-item-base.bg-item-main-bg.border.border-solid.border-item-main-hover.placeholder_text-item-base-down.transition.ease-in-out.focus_text-item-base-up.focus_bg-item-main-hover.focus_border-blue3.focus_outline-none(
        v-model="description"
        :placeholder="$t('trnForm.description.placeholder')"
      )

    .pb-4.px-3
      UiButtonBlue(
        @click="onSave(close)"
      ) {{ $t('base.save') }}
</template>
