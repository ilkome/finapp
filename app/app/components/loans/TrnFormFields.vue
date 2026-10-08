<script setup lang="ts">
import { formatByLocale } from '~~/utils/date/civil'

import { useLoansStore } from '~/components/loans/useLoansStore'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { TrnType } from '~/components/trns/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const { t } = useI18n()
const dateLocale = useDateLocale()
const trnsFormStore = useTrnsFormStore()
const loansStore = useLoansStore()
const walletsStore = useWalletsStore()

// A new transfer into a loan without its interest is a prepayment: show what it saves before saving.
const prepay = computed(() => {
  const values = trnsFormStore.values
  const walletId = values.incomeWalletId
  if (values.trnId || values.trnType !== TrnType.Transfer || !walletId || values.loanInterest?.isEnabled)
    return null
  const amount = values.amount[2] || values.amount[1] || 0
  const loan = loansStore.byWalletId.get(walletId)?.loan
  if (amount <= 0 || !loan)
    return null
  const result = loansStore.getWhatIf(walletId, amount, loan.overpaymentMode)
  if (!result || result.interestSaved <= 0)
    return null
  return {
    currencyCode: walletsStore.items?.[walletId]?.currency ?? 'USD',
    interestSaved: result.interestSaved,
    newEndDate: result.newEndDate === null ? null : formatByLocale(result.newEndDate, 'dd.MM.yyyy', dateLocale.value),
  }
})
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
