import accounting from '../libs/accounting.min'

accounting.settings = {
  currency: {
    symbol: '₽',
    format: '%v %s',
    decimal: '.',
    thousand: ' ',
    precision: 0
  },
  number: {
    precision: 0,
    thousand: ',',
    decimal: '.'
  }
}

// Format money method
const accountingFormatMoney = accounting.formatMoney

const getSymbol = (currency) => {
  switch (currency) {
    case 'USD':
      return '$'
    case 'EUR':
      return '€'
    case 'IDR':
      return 'Rp'
    case 'THB':
      return '฿'
    default:
      return '₽'
  }
}

const mixin = {
  methods: {
    formatMoney(sum, currency) {
      if (!currency || currency === 'RUB') {
        return accountingFormatMoney(sum)
      }
      const symbol = getSymbol(currency)
      return accountingFormatMoney(sum, { symbol })
    }
  }
}

export default mixin
