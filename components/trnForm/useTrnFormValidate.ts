export default function useTrnFormValidate () {
  function validate (values: any) {
    const errorTitle = '😮'

    if (!values.amount) {
      return {
        error: {
          title: errorTitle,
          text: 'Amount can not be empty'
        }
      }
    }

    if (values.amount <= 0) {
      return {
        error: {
          title: errorTitle,
          text: 'Amount can not be negative number'
        }
      }
    }

    if (values.amount === 0) {
      return {
        error: {
          title: errorTitle,
          text: 'Amount can not be equal Zero'
        }
      }
    }

    if (!values.walletId) {
      return {
        error: {
          title: errorTitle,
          text: 'Please select wallet'
        }
      }
    }

    if (!values.categoryId) {
      return {
        error: {
          title: errorTitle,
          text: 'Please select category'
        }
      }
    }

    // Transfer
    if (values.amountType === 2) {
      if (values.walletFromId === values.walletToId) {
        return {
          error: {
            title: errorTitle,
            text: 'Transfer in same wallet'
          }
        }
      }

      if (values.walletFrom.currency !== values.walletTo.currency) {
        return {
          error: {
            title: errorTitle,
            text: 'Sorry, transfer between wallets with different currency in development'
          }
        }
      }
    }

    return {
      valid: true
    }
  }

  return {
    validate
  }
}
