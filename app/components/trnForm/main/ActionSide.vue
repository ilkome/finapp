<script setup lang="ts">
import { useVibrate } from '@vueuse/core'

import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const trnsStore = useTrnsStore()
const trnsFormStore = useTrnsFormStore()
// @ts-expect-error `interval` not optional in VueUse types but has @default 0 — type bug
const { isSupported: isVibrateSupported, vibrate } = useVibrate({ pattern: [50, 50, 50] })

const isMath = computed(() => trnsFormStore.shouldShowSum())
const isSubmittable = computed(() => trnsFormStore.values.amount[trnsFormStore.activeAmountIdx] > 0)

async function onClickSubmit() {
  if (isMath.value) {
    trnsFormStore.onChangeCountSum()
    return
  }

  const trnFormData = await trnsFormStore.onSubmit()
  if (!trnFormData)
    return

  trnsStore.saveTrn({
    id: trnFormData.id,
    values: trnFormData.values,
  })

  if (isVibrateSupported.value)
    vibrate()

  trnsFormStore.onClear()
}
</script>

<template>
  <div
    :class="cn(
      'flex w-12 @xs/trnForm:w-14 @sm/trnForm:w-16 size-full items-center justify-center rounded-sm p-1 py-4 text-center transition hover:scale-[1.02]',
      !isMath && isSubmittable
        ? 'bg-primary/50 hover:bg-primary/80 text-icon-primary'
        : '!bg-elevated text-highlighted hover:bg-elevated/30',
      (!isSubmittable || isMath) && 'text-muted',
    )"
    @click="onClickSubmit"
  >
    <Icon :name="isMath ? 'lucide:equal' : 'lucide:check'" size="40" />
  </div>
</template>
