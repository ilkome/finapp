import currency from 'currency.js'

function getCurrencySymbol (currency) {
  switch (currency) {
    case 'USD':
      return '$'
    case 'RUB':
      return '₽'
    case 'EUR':
      return '€'
    case 'IDR':
      return 'Rp'
    case 'THB':
      return '฿'
    default:
      return currency
  }
}

const formatAmount = (value, separator = ' ') =>
  currency(value, {
    symbol: '',
    precision: 0,
    pattern: '#',
    separator
  }).format()

export default function useAmount () {
  const { $store } = useNuxtApp()

  function getAmountInBaseCurrency ({ amount, currency, noFormat }) {
    const fixed = $store.state.currencies.base === 'RUB' ? 0 : 2
    const baseValue = (amount / $store.state.currencies.rates[currency]).toFixed(fixed)
    if (!baseValue) return
    if (noFormat) return Number(baseValue)
    return formatAmount(Number(baseValue))
  }

  const baseCurrency = computed(() => $store.state.currencies.base)

  return {
    baseCurrency,

    formatAmount,
    getCurrencySymbol,
    getAmountInBaseCurrency
  }
}
