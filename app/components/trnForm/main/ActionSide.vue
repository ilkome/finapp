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
      '!hover:bg-(--ui-primary) !bg-(--ui-primary)/60 text-icon-primary': !isMath && isSubmittable,
      'text-(--ui-text-muted)': !isSubmittable || isMath,
    }"
    class="flex size-full items-center justify-center rounded-xl bg-item-4 p-1 py-4 text-center text-4xl text-1 transition hover:scale-[1.02] hover:bg-[var(--item-5)]"
    @click="onClickSubmit"
  >
    <Icon :name="isMath ? 'lucide:equal' : 'lucide:check'" size="40" />
  </div>
</template>
