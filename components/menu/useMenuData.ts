/* eslint-disable perfectionist/sort-objects */
import { useAppNav } from '~/components/app/useAppNav'
import { useTrnForm } from '~/components/trnForm/useTrnForm'
import { useUserStore } from '~/components/user/useUser'

interface MenuItem {
  icon: string
  name: string
  private?: boolean
}

// TODO: replace with NuxtLink
export default function useMenuData() {
  const { t } = useI18n()
  const { trnFormCreate } = useTrnForm()
  const route = useRoute()
  const { closeAllModals, openModal } = useAppNav()
  const userStore = useUserStore()

  const items = computed(() => ({
    trnForm: {
      component: 'UiIconAdd',
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
      icon: 'mdi mdi-history',
      name: t('trns.history'),
    },
    settings: {
      icon: 'mdi mdi-cog-outline',
      name: t('settings.title'),
    },
  }))

  const itemsMini = computed(() => ({
    wallets: items.value.wallets,
    categories: items.value.categories,
    trnForm: items.value.trnForm,
    dashboard: items.value.dashboard,
    menu: {
      component: 'UiIconMenu',
      name: '',
    },
  }))

  function onClick(menuId: string) {
    closeAllModals()

    if (menuId === 'trnForm') {
      navigateTo('dashboard')
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

  function checkIsShow(item: MenuItem) {
    if (!item)
      return false

    return !item.private || (item.private && userStore.isDevUser)
  }

  return {
    items,
    itemsMini,
    onClick,
    checkIsShow,
    checkIsActive,
  }
}
