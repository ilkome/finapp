const DOCS_URL = 'https://finapp-docs.ilko.me'

/**
 * Builds links into the documentation site. In-app screens carry only a short
 * label and defer the full explanation to the docs, so `?` buttons open the
 * matching guide page in the user's language.
 */
export function useDocsLink() {
  const { locale } = useI18n()

  function docsHref(path: string) {
    const lang = locale.value.startsWith('ru') ? 'ru' : 'en'
    return `${DOCS_URL}/${lang}/${path.replace(/^\/+/, '')}`
  }

  function openDocs(path: string) {
    window.open(docsHref(path), '_blank', 'noopener')
  }

  return { docsHref, openDocs }
}
