import { roundTo } from '~~/utils/amount/round'

import type { TrnFormValuesWithLoan } from '~/components/loans/types'
import type { WalletId } from '~/components/wallets/types'

import { getAmountInRate } from '~/components/amount/getTotal'
import { currencyMinorUnit } from '~/components/currencies/currencies'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { evaluateExpression, formatInput } from '~/components/trnForm/utils/calculate'
import { TrnType } from '~/components/trns/types'
import { isCreditProduct } from '~/components/wallets/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

/**
 * Loan-specific slice of the transaction form: the interest the bank takes out of a payment
 * transfer into a credit wallet, written as that credit wallet's own expense.
 */
export function useLoanPaymentDraft(
  values: TrnFormValuesWithLoan,
  helpers: { openFormForCreate: () => void },
) {
  const walletsStore = useWalletsStore()
  const currenciesStore = useCurrenciesStore()

  const nonCreditWalletsIds = computed<WalletId[]>(
    () => walletsStore.sortedIds.filter(id => !isCreditProduct(walletsStore.items?.[id]?.type)),
  )

  const isTransferIntoCredit = computed(() => values.trnType === TrnType.Transfer
    && !!values.incomeWalletId
    && isCreditProduct(walletsStore.items?.[values.incomeWalletId]?.type))

  // Any new transfer into a credit wallet can carry its interest; off until the user turns it on.
  // Sync flush so `openFormForLoanPayment` can overwrite the draft in the same tick.
  watch(isTransferIntoCredit, (isCredit) => {
    if (!isCredit || values.trnId)
      values.loanInterest = undefined
    else
      values.loanInterest ??= { amount: 0, amountRaw: '', isEnabled: false }
  }, { flush: 'sync' })

  function onChangeLoanInterestAmount(amountRaw: string) {
    if (!values.loanInterest)
      return

    values.loanInterest.amount = evaluateExpression(amountRaw)
    values.loanInterest.amountRaw = formatInput(amountRaw)
  }

  /**
   * Loan repayment: the whole payment as a transfer into the credit wallet, and the interest the
   * bank took out of it as an expense of the credit wallet. Both are written by a single submit.
   */
  function openFormForLoanPayment(params: {
    date: number
    debitWalletId?: WalletId
    interest: number
    principal: number
    walletId: WalletId
  }) {
    const recentNonCreditWalletId = walletsStore.recentWalletIds.find(id => nonCreditWalletsIds.value.includes(id))
    const sourceWalletId = params.debitWalletId ?? recentNonCreditWalletId ?? nonCreditWalletsIds.value[0]

    helpers.openFormForCreate()

    values.trnType = TrnType.Transfer
    values.transferType = 'expense'
    values.categoryId = 'transfer'
    values.date = params.date
    values.expenseWalletId = sourceWalletId ?? null
    values.incomeWalletId = params.walletId
    // The schedule is in the loan currency; a payment from another currency starts at the current
    // rate, and the user corrects it to what the bank actually charged.
    const loanCurrency = walletsStore.items?.[params.walletId]?.currency
    const sourceCurrency = sourceWalletId ? walletsStore.items?.[sourceWalletId]?.currency : undefined
    const total = roundTo(params.principal + params.interest, currencyMinorUnit(loanCurrency))
    const spent = loanCurrency && sourceCurrency
      ? roundTo(getAmountInRate(total, loanCurrency, sourceCurrency, currenciesStore.rates), currencyMinorUnit(sourceCurrency))
      : total
    values.amount = [0, spent, total]
    // An early repayment opens with no amount: the user types it.
    const raw = (amount: number) => amount ? formatInput(amount) : ''
    values.amountRaw = ['', raw(spent), raw(total)]
    values.loanInterest = params.interest > 0
      ? { amount: params.interest, amountRaw: formatInput(params.interest), isEnabled: true }
      : undefined
  }

  return {
    onChangeLoanInterestAmount,
    openFormForLoanPayment,
  }
}
