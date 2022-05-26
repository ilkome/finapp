interface MenuItem {
  icon: string
  name: string
  private?: boolean
}

export default function useMenuData() {
  const { $store, nuxt2Context: { i18n } } = useNuxtApp()
  const route = useRoute()
  const router = useRouter()

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
    menuId === 'trnForm'
      ? $store.dispatch('trnForm/openTrnForm', { action: 'create' })
      : router.push(`/${menuId}`)

    if (menuId === 'history')
      router.push(`/${menuId}`)

    $store.dispatch('ui/setActiveTab', null)
  }

  function checkIsActive(menuId: string) {
    return route.name.includes(menuId)
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
