export function validate(values: any) {
  if (!values.amount && values.type !== 2) {
    return {
      error: 'Amount can not be empty',
    }
  }

  if (values.amount <= 0 && values.type !== 2) {
    return {
      error: 'Amount can not be negative number',
    }
  }

  if (values.amount === 0 && values.type !== 2) {
    return {
      error: 'Amount can not be equal Zero',
    }
  }

  if (!values.walletId && values.type !== 2) {
    return {
      error: 'Please select wallet',
    }
  }

  if (!values.categoryId && values.type !== 2) {
    return {
      error: 'Please select category',
    }
  }

  // Transfer
  if (values.type === 2) {
    if (Number(values.incomeAmount) === 0 || Number(values.expenseAmount) === 0) {
      return {
        error: 'Transfer amounts can not be empty',
      }
    }

    if (values.incomeWalletId === values.expenseWalletId) {
      return {
        error: 'Transfer in same wallet',
      }
    }
  }

  return {
    valid: true,
  }
}
