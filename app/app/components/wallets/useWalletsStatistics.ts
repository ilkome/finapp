import type { ComputedRef, Ref } from 'vue'

import { useStorage } from '@vueuse/core'

import type { ContextMenuItem } from '#ui/components/ContextMenu.vue'

type CountItem = {
  id: string
  isShow: boolean
  secondValue?: number
  value: number
}

export type StatisticsRow = {
  hint?: string
  id: string
  title: string
}

const ORDERED_KEYS = ['total', 'withdrawal', 'available', 'excludeInTotal', 'archived', 'cash', 'cashless', 'deposit', 'credit', 'crypto', 'debt'] as const

/**
 * Which statistics rows exist, in what order, which are pinned and which are hidden.
 * The wallets page owns it so the ⋮ menu can render the settings panel while the
 * statistics block renders the rows themselves.
 */
export function useWalletsStatistics(storageKey: Ref<string>, counts: ComputedRef<Record<string, CountItem>>) {
  const { t, te } = useI18n()

  const order = useStorage<string[]>(computed(() => `${storageKey.value}.order`), [])
  const hiddenIds = useStorage<string[]>(computed(() => `${storageKey.value}.hidden`), [])
  const pinnedIds = useStorage<string[]>(computed(() => `${storageKey.value}.pins`), ['total', 'isAvailable'])

  // Unknown ids sort last and, since Array.sort is stable, keep their declaration order there.
  function orderIndex(id: string) {
    const index = order.value.indexOf(id)
    return index === -1 ? Number.MAX_SAFE_INTEGER : index
  }

  // Every row with a value, hidden ones included - the settings panel needs them to unhide.
  const allItems = computed(() => ORDERED_KEYS
    .map(key => counts.value[key])
    .filter((i): i is NonNullable<typeof i> => !!i?.isShow)
    .sort((a, b) => orderIndex(a.id) - orderIndex(b.id)))

  const items = computed(() => allItems.value.filter(item => !hiddenIds.value.includes(item.id)))

  // pinnedIds doubles as the strip's order, so pinning appends and sorting rewrites it.
  // Built from allItems: hiding only takes a row out of the list, not off the strip.
  const pinnedItems = computed(() => pinnedIds.value
    .map(id => allItems.value.find(item => item.id === id))
    .filter((i): i is NonNullable<typeof i> => !!i))

  // Only the non-obvious rows carry a hint; the rest are self-explanatory.
  function hint(id: string) {
    const key = `money.typesHint.${id}`
    return te(key) ? t(key) : undefined
  }

  function toRow(item: { id: string }): StatisticsRow {
    return { hint: hint(item.id), id: item.id, title: t(`money.types.${item.id}`) }
  }

  // A row can sit in both the strip and the list, so each keeps its own order.
  const pinnedRows = computed(() => pinnedItems.value.map(toRow))
  const listRows = computed(() => allItems.value.map(toRow))
  const hintRows = computed(() => listRows.value.filter(row => row.hint))

  const reorderPinned = (ids: string[]) => pinnedIds.value = ids
  const reorderList = (ids: string[]) => order.value = ids

  function toggle(list: Ref<string[]>, id: string) {
    list.value = list.value.includes(id)
      ? list.value.filter(item => item !== id)
      : [...list.value, id]
  }

  const togglePinned = (id: string) => toggle(pinnedIds, id)
  const toggleHidden = (id: string) => toggle(hiddenIds, id)

  function menuItems(id: string, openPanel: () => void): ContextMenuItem[][] {
    const isPinned = pinnedIds.value.includes(id)
    const description = hint(id)

    return [...(description
      ? [[{ description, label: t(`money.types.${id}`), type: 'label' as const }]]
      : []), [{
      icon: isPinned ? 'i-lucide-pin-off' : 'i-lucide-pin',
      label: isPinned ? t('base.unpin') : t('base.pin'),
      onSelect: () => togglePinned(id),
    }, {
      icon: 'i-lucide-arrow-down-up',
      label: t('base.sort'),
      onSelect: () => openPanel(),
    }, {
      icon: 'i-lucide-eye-off',
      label: t('base.hide'),
      onSelect: () => toggleHidden(id),
    }]]
  }

  return {
    allItems,
    hiddenIds,
    hintRows,
    items,
    listRows,
    menuItems,
    pinnedIds,
    pinnedItems,
    pinnedRows,
    reorderList,
    reorderPinned,
    toggleHidden,
    togglePinned,
  }
}

export type WalletsStatistics = ReturnType<typeof useWalletsStatistics>
