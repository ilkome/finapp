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

  await trnsStore.saveTrn({
    id: trnFormData.id,
    values: trnFormData.values,
  })
  trnsFormStore.onClear()
}
</script>

<template>
  <div
    :class="cn(
      'flex size-full items-center justify-center rounded-(--ui-radius) p-1 py-4 text-center transition hover:scale-[1.02]',
      !isMath && isSubmittable
        ? 'bg-(--ui-primary)/60 hover:bg-(--ui-primary) text-icon-primary'
        : 'bg-item-4 text-1 hover:bg-(--item-5)',
      (!isSubmittable || isMath) && 'text-muted',
    )"
    @click="onClickSubmit"
  >
    <Icon :name="isMath ? 'lucide:equal' : 'lucide:check'" size="40" />
  </div>
</template>
