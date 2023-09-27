import { useTrnForm, useTrnFormStore } from '~/components/trnForm/useTrnForm'

interface MenuItem {
  icon: string
  name: string
  private?: boolean
}

export default function useMenuData() {
  const { $store, nuxt2Context: { i18n } } = useNuxtApp()
  const { trnFormCreate } = useTrnForm()
  const route = useRoute()
  const router = useRouter()
  const $trnForm = useTrnFormStore()

  const items = computed(() => ({
    trnForm: {
      icon: 'mdi mdi-plus',
      name: i18n.t('trnForm.createTrn'),
    },
    dashboard: {
      component: 'UiIconStat',
      name: i18n.t('stat.title'),
    },
    wallets: {
      component: 'UiIconWallet',
      name: i18n.t('wallets.name'),
    },
    categories: {
      component: 'UiIconCategory',
      name: i18n.t('categories.name'),
    },
    history: {
      icon: 'mdi mdi-history',
      name: i18n.t('trns.history'),
    },
    settings: {
      icon: 'mdi mdi-cog-outline',
      name: i18n.t('settings.title'),
    },
  }))

  function onClick(menuId: string) {
    $store.dispatch('ui/setActiveTab', null)

    if (menuId === 'trnForm') {
      trnFormCreate()
      return
    }

    router.push(`/${menuId}`)
  }

  function checkIsActive(menuId: string) {
    return route.name?.includes(menuId)
  }

  function checkIsShow(item: MenuItem) {
    return !item.private || (item.private && $store.getters['user/isDevUser'])
  }

  return {
    items,
    onClick,
    checkIsShow,
    checkIsActive,
  }
}
