<script setup lang="ts">
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const trnsStore = useTrnsStore()
const trnsFormStore = useTrnsFormStore()

// TODO: check for 0
const isMath = computed(() => trnsFormStore.getIsShowSum())
const isSubmittable = computed(() => trnsFormStore.values.amount[trnsFormStore.activeAmountIdx] > 0)

async function onClickSubmit() {
  if (isMath.value) {
    trnsFormStore.onChangeCountSum()
    return
  }

  const trnFormData = await trnsFormStore.onSubmit()
  if (!trnFormData)
    return

  await trnsStore.addTrn({
    id: trnFormData.id,
    values: trnFormData.values,
  })
  trnsFormStore.onClear()
}
</script>

<template>
  <div
    :class="{
      '!bg-accent-1/50 hocus:!bg-accent-1/70 !border-transparent': !isMath && isSubmittable,
      '!text-secondary !border-item-4': !isSubmittable,
      '!text-secondary': isMath,
    }"
    class="
      text-1 border-item-5 hocus:bg-item-5
      hocus:border[red] hocus:scale-[1.02] _max-w-[56px]
      flex
      size-full
      items-center justify-center
      rounded-xl border p-1
      py-4 text-center text-4xl
      transition
    "
    @click="onClickSubmit"
  >
    <span v-if="!isMath && isSubmittable" class="mdi:check" />
    <span v-else-if="isMath" class="mdi:equal" />
    <span v-else class="mdi:palm-tree" />
  </div>
</template>
