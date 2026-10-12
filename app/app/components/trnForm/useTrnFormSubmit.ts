import { useVibrate } from '@vueuse/core'

import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

/** Shared by the check button and Enter in the amount field: "=" while a sum is pending, save otherwise. */
export function useTrnFormSubmit() {
  const trnsStore = useTrnsStore()
  const trnsFormStore = useTrnsFormStore()
  const { isSupported: isVibrateSupported, vibrate } = useVibrate({ pattern: [50, 50, 50] })

  const isMath = computed(() => trnsFormStore.shouldShowSum())
  const isSubmittable = computed(() => trnsFormStore.values.amount[trnsFormStore.activeAmountIdx] > 0)

  async function submit() {
    if (isMath.value) {
      trnsFormStore.onChangeCountSum()
      return
    }

    const trnFormData = await trnsFormStore.onSubmit()
    if (!trnFormData)
      return

    if (trnFormData.extra) {
      // One write transaction: the transfer and its interest land or roll back together.
      void trnsStore.saveTrns({
        [trnFormData.extra.id]: trnFormData.extra.values,
        [trnFormData.id]: { ...trnFormData.values, updatedAt: Date.now() },
      })
    }
    else {
      trnsStore.saveTrn({ id: trnFormData.id, values: trnFormData.values })
    }

    if (isVibrateSupported.value)
      vibrate()

    trnsFormStore.onClear()
  }

  return { isMath, isSubmittable, submit }
}
