<script setup lang="ts">
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const $trnForm = useTrnFormStore()

const description = ref('')
onMounted(() => description.value = $trnForm.values.desc ?? '')

function onSave(close: () => void) {
  $trnForm.values.desc = description.value
  close()
}
</script>

<template lang="pug">
TrnFormModal(@closed="$trnForm.closeTrnFormModal('description')")
  template(#header)
    template {{ $t('trnForm.description.title') }}

  template(#default="{ close }")
    .pb-6.px-3
      textarea.w-full.h-28.m-0.py-3.px-4.rounded-lg.text-base.font-normal.text-item-base.bg-item-4.border.border-solid.border-item-5.placeholder_text-item-2.transition.ease-in-out.focus_text-item-1.focus_bg-item-5.focus_border-accent-4.focus_outline-none(
        v-model="description"
        :placeholder="$t('trnForm.description.placeholder')"
      )

    .pb-4.px-3
      UiButtonBlue(
        @click="onSave(close)"
      ) {{ $t('base.save') }}
</template>
