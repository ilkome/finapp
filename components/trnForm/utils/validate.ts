export function validate(values: any) {
  const errorTitle = '😮'

  if (!values.amount && values.type !== 2) {
    return {
      error: {
        text: 'Amount can not be empty',
        title: errorTitle,
      },
    }
  }

  if (values.amount <= 0 && values.type !== 2) {
    return {
      error: {
        text: 'Amount can not be negative number',
        title: errorTitle,
      },
    }
  }

  if (values.amount === 0 && values.type !== 2) {
    return {
      error: {
        text: 'Amount can not be equal Zero',
        title: errorTitle,
      },
    }
  }

  if (!values.walletId && values.type !== 2) {
    return {
      error: {
        text: 'Please select wallet',
        title: errorTitle,
      },
    }
  }

  if (!values.categoryId && values.type !== 2) {
    return {
      error: {
        text: 'Please select category',
        title: errorTitle,
      },
    }
  }

  // Transfer
  if (values.type === 2) {
    if (Number(values.incomeAmount) === 0 || Number(values.expenseAmount) === 0) {
      return {
        error: {
          text: 'Transfer amounts can not be empty',
          title: errorTitle,
        },
      }
    }

    if (values.incomeWalletId === values.expenseWalletId) {
      return {
        error: {
          text: 'Transfer in same wallet',
          title: errorTitle,
        },
      }
    }
  }

  return {
    valid: true,
  }
}
