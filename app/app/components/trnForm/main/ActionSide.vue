<script setup lang="ts">
import { useVibrate } from '@vueuse/core'

import { occurrenceTrnId } from '~/components/recurrences/occurrences'
import { useRecurrencesStore } from '~/components/recurrences/useRecurrencesStore'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const trnsStore = useTrnsStore()
const trnsFormStore = useTrnsFormStore()
const recurrencesStore = useRecurrencesStore()
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

  const occ = trnsFormStore.occurrenceContext
  const rep = trnsFormStore.repeat
  // Paying a recurrence occurrence early: settle it under the deterministic occurrence id (+ link)
  // so that day flips to "paid". Takes priority over Repeat (which stays off in this flow).
  if (occ && trnFormData.values.type !== TrnType.Transfer) {
    trnsStore.saveTrn({
      id: occurrenceTrnId(occ.ruleId, occ.day),
      values: { ...trnFormData.values, recurrenceId: occ.ruleId },
    })
  }
  else if (rep.enabled && trnFormData.values.type !== TrnType.Transfer) {
    const config = {
      autoCreate: rep.autoCreate,
      backfill: rep.backfill,
      endCount: rep.endMode === 'count' ? rep.endCount : null,
      endDate: rep.endMode === 'date' ? rep.endDate : null,
      endMode: rep.endMode,
      freq: rep.freq,
      interval: rep.interval,
      monthLastDay: rep.monthLastDay,
    }
    // Editing an existing trn with "Repeat" on: convert it into a recurring series (keeps its id).
    // Otherwise create a fresh series whose first occurrence is this trn (shared deterministic id).
    if (trnsFormStore.values.trnId) {
      const ruleId = recurrencesStore.createFromExistingTrn(trnFormData.id, trnFormData.values, config)
      // Offer to adopt the already-created past look-alikes of this series (drift-tolerant match).
      if (ruleId)
        recurrencesStore.openAdoption(ruleId, trnFormData.id)
    }
    else {
      recurrencesStore.createFromTrn(trnFormData.values, config)
    }
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
      'hover:scale-1.02 flex size-full w-12 items-center justify-center rounded-sm p-1 py-4 text-center transition @xs/trnForm:w-14 @sm/trnForm:w-16',
      !isMath && isSubmittable
        ? 'bg-primary/50 text-icon-primary hover:bg-primary/80'
        : 'bg-elevated! text-highlighted hover:bg-elevated/30',
      (!isSubmittable || isMath) && 'text-muted',
    )"
    @click="onClickSubmit"
  >
    <Icon :name="isMath ? 'lucide:equal' : 'lucide:check'" size="40" />
  </div>
</template>
