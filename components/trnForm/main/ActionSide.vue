<script setup lang="ts">
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const trnsStore = useTrnsStore()
const trnFormStore = useTrnFormStore()

// TODO: check for 0
const isMath = computed(() => trnFormStore.getIsShowSum())
const isSubmittable = computed(() => trnFormStore.values.amount[trnFormStore.activeAmountIdx] > 0)

async function onClickSubmit() {
  console.log('onClickSubmit', isMath.value)

  if (isMath.value) {
    console.log('isMath.value', isMath.value)
    trnFormStore.onChangeCountSum()
    return
  }

  console.log(111)

  const trnFormData = await trnFormStore.onSubmit()
  if (!trnFormData)
    return

  await trnsStore.addTrn({
    id: trnFormData.id,
    values: trnFormData.values,
  })
  trnFormStore.onClear()

  console.log(22)
}
</script>

<template lang="html">
  <div
    :class="{
      '!bg-accent-1/50 border-accent-1/50 hocus_!bg-accent-1/70': !isMath && isSubmittable,
    }"
    class="
      cursor-pointer
      flex items-center justify-center
      min-size-[58px]
      py-4 px-2
      size-full
      text-4xl text-primary text-center
      bg-item-main border border-item-5 rounded-xl
      hocus_bg-item-7 hocus_border[red] hocus_scale-[1.02]
      transition
    "
    @click="onClickSubmit"
  >
    <span v-if="!isMath" class="mdi mdi-check" />
    <span v-if="isMath" class="mdi mdi-equal" />
    <pre>{{ trnFormStore.activeAmountIdx }}</pre>
    <pre>{{ isMath }}</pre>
  </div>
</template>
