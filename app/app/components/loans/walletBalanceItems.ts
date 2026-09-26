type TranslateFn = (key: string) => string

export function walletBalanceItems({ creditLimit, hasLoan, isCredit, t, total }: {
  creditLimit: number
  hasLoan: boolean
  isCredit: boolean
  t: TranslateFn
  total: number
}): { amount: number, title: string }[] {
  if (isCredit && !hasLoan) {
    return [
      { amount: total, title: t('wallets.form.credit.debt') },
      { amount: creditLimit - (-total), title: t('wallets.form.credit.available') },
      { amount: creditLimit, title: t('wallets.form.credit.limit') },
    ]
  }

  return [{ amount: total, title: t(hasLoan ? 'wallets.form.credit.debt' : 'money.balance') }]
}
