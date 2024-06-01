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

export function useToggle({ name }: { name: string }) {
  const isShown = useStorage(name, true)
  const show = () => (isShown.value = true)
  const hide = () => (isShown.value = false)
  const toggle = () => (isShown.value ? hide() : show())

  return {
    hide,
    isShown,
    show,
    toggle,
  }
}
