import type { TrnFormValuesWithLoan } from '~/components/loans/types'
import type { WalletId } from '~/components/wallets/types'

import { getAmountInRate } from '~/components/amount/getTotal'
import { amountToMinor, minorToAmount } from '~/components/amount/utils'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { evaluateExpression, formatInput } from '~/components/trnForm/utils/calculate'
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

  const isTransferIntoCredit = computed(() => values.trnType === 'transfer'
    && !!values.toWalletId
    && isCreditProduct(walletsStore.items?.[values.toWalletId]?.type))

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

    values.loanInterest.amount = amountToMinor(evaluateExpression(amountRaw), values.toWalletId ? walletsStore.currencyOf(values.toWalletId) : undefined)
    values.loanInterest.amountRaw = formatInput(amountRaw)
  }

  /**
   * Loan repayment: the whole payment as a transfer into the credit wallet, and the interest the
   * bank took out of it as an expense of the credit wallet. Both are written by a single submit.
   */
  function openFormForLoanPayment(params: {
    date: number
    interest: number
    paymentWalletId?: WalletId
    principal: number
    walletId: WalletId
  }) {
    const recentNonCreditWalletId = walletsStore.recentWalletIds.find(id => nonCreditWalletsIds.value.includes(id))
    const sourceWalletId = params.paymentWalletId ?? recentNonCreditWalletId ?? nonCreditWalletsIds.value[0]

    helpers.openFormForCreate()

    values.trnType = 'transfer'
    values.transferType = 'from'
    values.categoryId = null
    values.date = params.date
    values.fromWalletId = sourceWalletId ?? null
    values.toWalletId = params.walletId
    // The schedule is in the loan currency; a payment from another currency starts at the current
    // rate, and the user corrects it to what the bank actually charged.
    const loanCurrency = walletsStore.items?.[params.walletId]?.currencyCode
    const sourceCurrency = sourceWalletId ? walletsStore.items?.[sourceWalletId]?.currencyCode : undefined
    const total = params.principal + params.interest
    const spent = loanCurrency && sourceCurrency
      ? Math.round(getAmountInRate(total, loanCurrency, sourceCurrency, currenciesStore.rates))
      : total
    values.amount = [0, spent, total]
    // An early repayment opens with no amount: the user types it.
    const raw = (amount: number, currencyCode?: string) => amount ? formatInput(minorToAmount(amount, currencyCode)) : ''
    values.amountRaw = ['', raw(spent, sourceCurrency), raw(total, loanCurrency)]
    values.loanInterest = params.interest > 0
      ? { amount: params.interest, amountRaw: formatInput(minorToAmount(params.interest, loanCurrency)), isEnabled: true }
      : undefined
  }

  return {
    onChangeLoanInterestAmount,
    openFormForLoanPayment,
  }
}
