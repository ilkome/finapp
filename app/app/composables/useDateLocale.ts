import type { LocaleSlug } from '~/components/locale/types'

export function useDateLocale() {
  const { locale } = useI18n()
  return computed<LocaleSlug>(() => locale.value.startsWith('ru') ? 'ru' : 'en')
}
