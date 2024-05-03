import { useStorage } from '@vueuse/core'

export function useSimpleTabs(id: string, items: {
  localeKey: string
  slug: string
}[]) {
  const active = useStorage(id, items.at(0)?.slug)
  const set = (item: string) => active.value = item

  return {
    active,
    items,
    set,
  }
}
