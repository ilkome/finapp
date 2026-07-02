<script setup lang="ts">
import { useVibrate } from '@vueuse/core'

import { useRecurrencesStore } from '~/components/recurrences/useRecurrencesStore'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const trnsStore = useTrnsStore()
const trnsFormStore = useTrnsFormStore()
const recurrencesStore = useRecurrencesStore()
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

  const rep = trnsFormStore.repeat
  if (rep.enabled && trnFormData.values.type !== TrnType.Transfer) {
    const config = {
      autoCreate: rep.autoCreate,
      endCount: rep.endMode === 'count' ? rep.endCount : null,
      endDate: rep.endMode === 'date' ? rep.endDate : null,
      endMode: rep.endMode,
      freq: rep.freq,
      interval: rep.interval,
      monthLastDay: rep.monthLastDay,
    }
    // Editing an existing trn with "Repeat" on: convert it into a recurring series (keeps its id).
    // Otherwise create a fresh series whose first occurrence is this trn (shared deterministic id).
    if (trnsFormStore.values.trnId)
      recurrencesStore.createFromExistingTrn(trnFormData.id, trnFormData.values, config)
    else
      recurrencesStore.createFromTrn(trnFormData.values, config)
  }
  else {
    trnsStore.saveTrn({
      id: trnFormData.id,
      values: trnFormData.values,
    })
  }

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
