export function validate(values: any) {
  if (!values.amount && values.type !== 2) {
    return {
      error: 'trnForm.errors.amountEmpty',
    }
  }

  if (values.amount <= 0 && values.type !== 2) {
    return {
      error: 'trnForm.errors.amountNegative',
    }
  }

  if (values.amount === 0 && values.type !== 2) {
    return {
      error: 'trnForm.errors.amountZero',
    }
  }

  if (!values.walletId && values.type !== 2) {
    return {
      error: 'trnForm.errors.selectWallet',
    }
  }

  if (!values.categoryId && values.type !== 2) {
    return {
      error: 'trnForm.errors.selectCategory',
    }
  }

  // Transfer
  if (values.type === 2) {
    if (Number(values.incomeAmount) === 0 || Number(values.expenseAmount) === 0) {
      return {
        error: 'trnForm.errors.transferAmountEmpty',
      }
    }

    if (values.incomeWalletId === values.expenseWalletId) {
      return {
        error: 'trnForm.errors.transferSameWallet',
      }
    }
  }

  return {
    valid: true,
  }
}
