/* eslint-disable perfectionist/sort-objects */
import { useAppNav } from '~/components/app/useAppNav'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

export type MenuItem = {
  icon: string
  name: string
}

export default function useMenuData() {
  const { t } = useI18n()
  const { trnFormCreate } = useTrnsFormStore()
  const walletsStore = useWalletsStore()
  const categoriesStore = useCategoriesStore()
  const route = useRoute()
  const { closeAllModals, openModal } = useAppNav()

  const items = computed<Record<string, MenuItem>>(() => {
    const list = {
      trnForm: {
        icon: 'hugeicons:plus-sign-square',
        name: t('trnForm.createTrn'),
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
      history: {
        icon: 'hugeicons:archive-01',
        name: t('trns.history'),
      },
      settings: {
        icon: 'hugeicons:settings-01',
        name: t('settings.title'),
      },
    }

    if (process.env.NODE_ENV === 'development') {
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
    trnForm: items.value.trnForm!,
    dashboard: items.value.dashboard!,
    menu: { icon: 'hugeicons:menu-01', name: '' },
  }))

  function onClick(menuId: string) {
    closeAllModals()

    if (menuId === 'trnForm') {
      if (walletsStore.hasItems && categoriesStore.hasItems) {
        trnFormCreate()
      }
      return
    }

    if (menuId === 'menu') {
      openModal('menu')
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
    onClick,
    checkIsActive,
  }
}
