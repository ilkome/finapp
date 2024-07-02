<script setup lang="ts">
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const trnsStore = useTrnsStore()
const trnFormStore = useTrnFormStore()

// TODO: check for 0
const isMath = computed(() => trnFormStore.getIsShowSum())
const isSubmittable = computed(() => trnFormStore.values.amount[trnFormStore.activeAmountIdx] > 0)

async function onClickSubmit() {
  if (isMath.value) {
    trnFormStore.onChangeCountSum()
    return
  }

  const trnFormData = await trnFormStore.onSubmit()
  if (!trnFormData)
    return

  await trnsStore.addTrn({
    id: trnFormData.id,
    values: trnFormData.values,
  })
  trnFormStore.onClear()
}
</script>

<template lang="html">
  <div
    :class="{
      '!bg-accent-1/50 border-accent-1/50 hocus:!bg-accent-1/70': !isMath && isSubmittable,
    }"
    class="
      flex items-center justify-center
      max-w-[56px] p-1 text-2xl
      py-4
      size-full
      text-prima text-center
      bg-item-main border border-item-5 rounded-xl
      hocus:bg-item-7 hocus:border[red] hocus:scale-[1.02]
      transition
    "
    @click="onClickSubmit"
  >
    <span v-if="!isMath" class="mdi mdi-check" />
    <span v-if="isMath" class="mdi mdi-equal" />
    <!-- <pre>{{ trnFormStore.activeAmountIdx }}</pre>
    <pre>{{ isMath }}</pre> -->
  </div>
</template>
