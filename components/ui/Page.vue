<script setup lang="ts">
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const $trnForm = useTrnFormStore()
const styles = ref({
  paddingBottom: '0px',
})

watch(() => $trnForm.ui.isShow, (value) => {
  if (!value) {
    styles.value.paddingBottom = '0px'
    return
  }

  const form: HTMLElement | null = document.querySelector('#trnForm')
  styles.value.paddingBottom = `${form?.offsetHeight ?? 0}px`
})
</script>

<template lang="pug">
div(
  class=`
    overflow-x-hidden
    overflow-y-auto
    relative
    flex flex-col justify-between
    w-full
    pb-[44px] md_pb-[52px] lg_pb-0
  `
)
  .max-w-5xl.lg_px-8(:style="styles")
    slot

  .max-w-5xl
    slot(name="bottom")
</template>
