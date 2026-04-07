/**
 * Returns a localized currency name using Intl.DisplayNames.
 * Capitalizes the first letter for consistent display.
 * Falls back to the currency code for unknown currencies (e.g. crypto).
 */
export function useCurrencyName() {
  const { locale } = useI18n()

  const displayNames = computed(
    () => new Intl.DisplayNames(locale.value, { type: 'currency' }),
  )

  function getCurrencyName(code: string): string {
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
