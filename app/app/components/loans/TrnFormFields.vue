<script setup lang="ts">
import { refDebounced } from '@vueuse/core'
import { formatByLocale } from '~~/utils/date/civil'

import { useLoansStore } from '~/components/loans/useLoansStore'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const { t } = useI18n()
const dateLocale = useDateLocale()
const trnsFormStore = useTrnsFormStore()
const loansStore = useLoansStore()
const walletsStore = useWalletsStore()

// A new transfer into a loan without its interest is a prepayment: show what it saves before saving.
const prepayInput = computed(() => {
  const values = trnsFormStore.values
  const walletId = values.toWalletId
  if (values.trnId || values.trnType !== 'transfer' || !walletId || values.loanInterest?.isEnabled)
    return null
  const amount = values.amount[2] || values.amount[1] || 0
  const loan = loansStore.byWalletId.get(walletId)?.loan
  return amount > 0 && loan ? { amount, mode: loan.prepaymentMode, walletId } : null
})
// Two tail re-solves per run: wait for the user to stop typing the amount.
const prepayInputDebounced = refDebounced(prepayInput, 250)

const prepay = computed(() => {
  const input = prepayInputDebounced.value
  if (!input)
    return null
  const { walletId } = input
  const result = loansStore.getWhatIf(walletId, input.amount, input.mode)
  if (!result || result.interestSaved <= 0)
    return null
  return {
    currencyCode: walletsStore.currencyOf(walletId),
    interestSaved: result.interestSaved,
    newEndDate: result.newEndDate === null ? null : formatByLocale(result.newEndDate, 'dd.MM.yyyy', dateLocale.value),
  }
})
</script>

<template>
  <div
    v-if="trnsFormStore.values.trnType === 'transfer' && trnsFormStore.values.loanInterest"
    class="flex items-center gap-2"
  >
    <UiSwitchItem
      :checkboxValue="trnsFormStore.values.loanInterest.isEnabled"
      :title="t('trnForm.loanOfWhichInterest')"
      @toggle="(isEnabled) => trnsFormStore.values.loanInterest && (trnsFormStore.values.loanInterest.isEnabled = !isEnabled)"
    />

    <FormInput
      v-if="trnsFormStore.values.loanInterest.isEnabled"
      :modelValue="trnsFormStore.values.loanInterest.amountRaw"
      class="w-28 shrink-0"
      inputmode="tel"
      @update:modelValue="trnsFormStore.onChangeLoanInterestAmount"
    />
  </div>

  <div v-if="prepay" class="flex flex-wrap items-baseline gap-x-1.5 px-2" data-loan-prepay-what-if>
    <UiText variant="meta">
      {{ t('loans.interestSaved') }}
    </UiText>
    <Amount
      :amount="prepay.interestSaved"
      :currencyCode="prepay.currencyCode"
      :isShowBaseRate="false"
      align="left"
      variant="secondary"
    />
    <UiText variant="meta">
      · {{ prepay.newEndDate ? t('loans.recommendation.closesOn', { date: prepay.newEndDate }) : t('loans.recommendation.closesNow') }}
    </UiText>
  </div>
</template>
