import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'

/**
 * The user's own name for a currency, else the localized `Intl` name with its first letter capitalized, else the
 * code (crypto and custom currencies have no `Intl` name).
 */
export function useCurrencyName() {
  const { locale } = useI18n()
  const currenciesStore = useCurrenciesStore()

  const displayNames = computed(
    () => new Intl.DisplayNames(locale.value, { type: 'currency' }),
  )

  function getCurrencyName(code: string): string {
    const own = currenciesStore.items[code]?.name
    if (own)
      return own
    try {
      const name = displayNames.value.of(code)
      if (!name || name === code)
        return code

      return name.charAt(0).toUpperCase() + name.slice(1)
    }
    catch {
      return code
    }
  }

  return { getCurrencyName }
}
