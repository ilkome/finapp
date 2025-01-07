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
      '!border-transparent !bg-accent-1/50 hocus:!bg-accent-1/70': !isMath && isSubmittable,
      '!border-item-4 !text-2': !isSubmittable,
      '!text-2': isMath,
    }"
    class="flex size-full items-center justify-center rounded-xl border border-item-5 p-1 py-4 text-center text-4xl text-1 transition hocus:scale-[1.02] hocus:bg-item-5"
    @click="onClickSubmit"
  >
    <Icon v-if="!isMath && isSubmittable" name="mdi:check" />
    <Icon v-else-if="isMath" name="mdi:equal" />
    <Icon v-else name="mdi:palm-tree" />
  </div>
</template>
