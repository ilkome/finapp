export function validate(values: any) {
  const errorTitle = '😮'

  if (!values.amount && values.type !== 2) {
    return {
      error: {
        title: errorTitle,
        text: 'Amount can not be empty',
      },
    }
  }

  if (values.amount <= 0 && values.type !== 2) {
    return {
      error: {
        title: errorTitle,
        text: 'Amount can not be negative number',
      },
    }
  }

  if (values.amount === 0 && values.type !== 2) {
    return {
      error: {
        title: errorTitle,
        text: 'Amount can not be equal Zero',
      },
    }
  }

  if (!values.walletId && values.type !== 2) {
    return {
      error: {
        title: errorTitle,
        text: 'Please select wallet',
      },
    }
  }

  if (!values.categoryId && values.type !== 2) {
    return {
      error: {
        title: errorTitle,
        text: 'Please select category',
      },
    }
  }

  // Transfer
  if (values.type === 2) {
    if (Number(values.incomeAmount) === 0 || Number(values.expenseAmount) === 0) {
      return {
        error: {
          title: errorTitle,
          text: 'Transfer amounts can not be empty',
        },
      }
    }

    if (values.incomeWalletId === values.expenseWalletId) {
      return {
        error: {
          title: errorTitle,
          text: 'Transfer in same wallet',
        },
      }
    }
  }

  return {
    valid: true,
  }
}
