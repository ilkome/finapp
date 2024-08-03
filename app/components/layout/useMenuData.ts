/* eslint-disable perfectionist/sort-objects */
import { useAppNav } from '~/components/app/useAppNav'
import { useTrnForm } from '~/components/trnForm/useTrnForm'

export type MenuItem = {
  component?: string
  icon?: string
  name: string
}

export default function useMenuData() {
  const { t } = useI18n()
  const { trnFormCreate } = useTrnForm()
  const route = useRoute()
  const { closeAllModals, openModal } = useAppNav()

  const items = computed<Record<string, MenuItem>>(() => ({
    trnForm: {
      // component: 'UiIconAdd',
      icon: 'hugeicons:plus-sign-square',
      name: t('trnForm.createTrn'),
    },
    dashboard: {
      component: 'UiIconStat',
      name: t('stat.title'),
    },
    wallets: {
      component: 'UiIconWallet',
      name: t('wallets.name'),
    },
    categories: {
      component: 'UiIconCategory',
      name: t('categories.name'),
    },
    history: {
      component: 'UiIconHistory',
      name: t('trns.history'),
    },
    settings: {
      component: 'UiIconSettings',
      name: t('settings.title'),
    },
  }))

  const itemsBottom = computed(() => ({
    wallets: items.value.wallets,
    categories: items.value.categories,
    trnForm: items.value.trnForm,
    dashboard: items.value.dashboard,
    menu: { component: 'UiIconMenu', name: '' },
  }))

  function onClick(menuId: string) {
    closeAllModals()

    if (menuId === 'trnForm') {
      trnFormCreate()
      return
    }

    if (menuId === 'menu') {
      openModal('menu')
      return
    }

    navigateTo(`/${menuId}`)
  }

  function checkIsActive(menuId: string) {
    return route.name?.includes(menuId)
  }

  return {
    items,
    itemsBottom,
    onClick,
    checkIsActive,
  }
}