/* eslint-disable perfectionist/sort-objects */
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

export type MenuItem = {
  icon: string
  name: string
  tooltip?: {
    kbds: string[]
    text: string
  }
}

// Module-level ref: shared across all useMenuData() callers so that
// SidebarMenuItem (sets true) and default.vue (reads) use the same state.
const isMenuOpen = ref(false)

export function useMenuData() {
  const { t } = useI18n()
  const trnsFormStore = useTrnsFormStore()
  const walletsStore = useWalletsStore()
  const categoriesStore = useCategoriesStore()
  const route = useRoute()

  const items = computed<Record<string, MenuItem>>(() => {
    const list: Record<string, MenuItem> = {
      trnForm: {
        icon: 'hugeicons:plus-sign-square',
        name: t('trnForm.createTrn'),
        tooltip: {
          text: t('trnForm.createTrn'),
          kbds: ['meta', 'G'],
        },
      },
      dashboard: {
        icon: 'lucide:chart-no-axes-combined',
        name: t('stat.title'),
      },
      wallets: {
        icon: 'hugeicons:wallet-01',
        name: t('wallets.name'),
      },
      categories: {
        icon: 'hugeicons:folder-library',
        name: t('categories.name'),
      },
      currencies: {
        icon: 'hugeicons:money-exchange-01',
        name: t('currencies.page.title'),
      },
      history: {
        icon: 'hugeicons:archive-01',
        name: t('trns.history'),
      },
      settings: {
        icon: 'hugeicons:settings-01',
        name: t('settings.title'),
      },
    }

    if (import.meta.dev) {
      list.dev = {
        icon: 'hugeicons:laptop-programming',
        name: t('dev.menu.title'),
      }
    }

    return list
  })

  const itemsBottom = computed<Record<string, MenuItem>>(() => ({
    wallets: items.value.wallets!,
    categories: items.value.categories!,
    trnForm: { ...items.value.trnForm!, name: t('base.add') },
    dashboard: items.value.dashboard!,
    menu: { icon: 'hugeicons:menu-01', name: t('base.menu') },
  }))

  const bottomKeys = new Set(['wallets', 'categories', 'trnForm', 'dashboard'])
  const itemsModal = computed<Record<string, MenuItem>>(() =>
    Object.fromEntries(
      Object.entries(items.value).filter(([key]) => !bottomKeys.has(key)),
    ),
  )

  function onClick(menuId: string) {
    if (menuId === 'menu') {
      isMenuOpen.value = true
      return
    }

    isMenuOpen.value = false

    if (menuId === 'trnForm') {
      if (trnsFormStore.ui.isShow) {
        trnsFormStore.onClose()
      }
      else if (walletsStore.hasItems && categoriesStore.hasItems) {
        trnsFormStore.openFormForCreate()
      }
      return
    }

    navigateTo(`/${menuId}`)
  }

  function checkIsActive(menuId: string) {
    return (route.name as string).includes(menuId)
  }

  return {
    items,
    itemsBottom,
    itemsModal,
    onClick,
    checkIsActive,
    isMenuOpen,
  }
}
