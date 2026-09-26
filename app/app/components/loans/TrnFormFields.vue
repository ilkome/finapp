<script setup lang="ts">
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { TrnType } from '~/components/trns/types'

const { t } = useI18n()
const trnsFormStore = useTrnsFormStore()
</script>

<template>
  <div
    v-if="trnsFormStore.values.trnType === TrnType.Transfer && trnsFormStore.values.loanInterest"
    class="flex items-center gap-2"
  >
    <UiSwitchItem
      :checkboxValue="trnsFormStore.values.loanInterest.isEnabled"
      :title="t('trnForm.loanOfWhichInterest')"
      @click="(isEnabled) => trnsFormStore.values.loanInterest && (trnsFormStore.values.loanInterest.isEnabled = !isEnabled)"
    />

    <FormInput
      v-if="trnsFormStore.values.loanInterest.isEnabled"
      :modelValue="trnsFormStore.values.loanInterest.amountRaw"
      class="w-28 shrink-0"
      inputmode="tel"
      @update:modelValue="trnsFormStore.onChangeLoanInterestAmount"
    />
  </div>
</template>
