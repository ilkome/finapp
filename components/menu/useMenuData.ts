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
  const { $i18n } = useNuxtApp()
  const { trnFormCreate } = useTrnForm()
  const route = useRoute()
  const { closeAllModals } = useAppNav()
  const userStore = useUserStore()

  const items = computed(() => ({
    trnForm: {
      icon: 'mdi mdi-plus',
      name: $i18n.t('trnForm.createTrn'),
    },
    dashboard: {
      component: 'UiIconStat',
      name: $i18n.t('stat.title'),
    },
    wallets: {
      component: 'UiIconWallet',
      name: $i18n.t('wallets.name'),
    },
    categories: {
      component: 'UiIconCategory',
      name: $i18n.t('categories.name'),
    },
    history: {
      icon: 'mdi mdi-history',
      name: $i18n.t('trns.history'),
    },
    settings: {
      icon: 'mdi mdi-cog-outline',
      name: $i18n.t('settings.title'),
    },
  }))

  function onClick(menuId: string) {
    closeAllModals()

    if (menuId === 'trnForm') {
      trnFormCreate()
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
    onClick,
    checkIsShow,
    checkIsActive,
  }
}
