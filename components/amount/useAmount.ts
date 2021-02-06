import { ref, computed, useContext } from '@nuxtjs/composition-api'
import currency from 'currency.js'

export default function useAmount () {
  const { store } = useContext()

  const separator = computed(() => store.state.currencies.amountSeparator || ' ')

  function getCurrencySymbol (currency: string) {
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

  function formatAmount (value: string, { symbol = '', precision = 0 }) {
    return currency(value, {
      symbol: symbol,
      precision: precision,
      pattern: '#',
      separator: separator.value
    }).format()
  }

  return {
    formatAmount
  }
}
