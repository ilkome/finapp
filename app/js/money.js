import accounting from './libs/accounting.min'

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
const money = accounting.formatMoney

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

export {
  getSymbol,
  money
}
