type TranslateFn = (key: string) => string

export function walletBalanceItems({ creditLimit, hasLoan, isCredit, t, total }: {
  creditLimit: number
  hasLoan: boolean
  isCredit: boolean
  t: TranslateFn
  total: number
}): { amount: number, title: string }[] {
  // A zero limit (instalment card) has nothing to show beyond the debt.
  if (isCredit && !hasLoan && creditLimit > 0) {
    return [
      { amount: total, title: t('wallets.form.credit.debt') },
      { amount: creditLimit - (-total), title: t('wallets.form.credit.available') },
      { amount: creditLimit, title: t('wallets.form.credit.limit') },
    ]
  }

  return [{ amount: total, title: t(hasLoan || isCredit ? 'wallets.form.credit.debt' : 'money.balance') }]
}
