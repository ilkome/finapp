<script setup lang="ts">
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const trnsStore = useTrnsStore()
const $trnForm = useTrnFormStore()
// TODO: check for 0
const isMath = computed(() => $trnForm.getIsShowSum($trnForm.activeAmountIdx, true))
const isSubmittable = computed(() => $trnForm.values.amount[$trnForm.activeAmountIdx] > 0)

async function onClickSubmit() {
  if (isMath.value) {
    $trnForm.onChangeCountSum()
    return
  }

  const trnFormData = await $trnForm.onSubmit()
  if (!trnFormData)
    return

  await trnsStore.addTrn({
    id: trnFormData.id,
    values: trnFormData.values,
  })
  $trnForm.onClear()
}
</script>

<template lang="pug">
div(
  :class=`{
    '!bg-accent-1/50 border-accent-1/50 hocus_!bg-accent-1/70': !isMath && isSubmittable,
  }`
  class=`
    cursor-pointer
    flex items-center justify-center
    min-w-[58px]
    py-4 px-2
    h-full
    text-4xl text-primary text-center
    bg-item-main border border-item-5 rounded-xl
    hocus_bg-item-7 hocus_border[red] hocus_scale-[1.02]
    transition
  `
  @click="onClickSubmit"
)
  .mdi.mdi-check(v-if="!isMath")
  .mdi.mdi-equal(v-if="isMath")
</template>
