import type { TrnId, TrnItemFull } from '~/components/trns/types'

import { filterKey } from '~/components/filter/injectionKeys'
import { statDateKey } from '~/components/stat/injectionKeys'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

// Row actions shared by the context menu and the preview. Must be called in the row's setup:
// filters narrow the surrounding stat page through its injected filter.
export function useTrnActions() {
  const { t } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const filter = inject(filterKey, null)
  const statDate = inject(statDateKey, null)
  const trnsStore = useTrnsStore()
  const confirm = useConfirm()
  const { openFormForDuplicate, openFormForEdit } = useTrnsFormStore()

  const isCategoryPage = computed(() => /^\/categories\/[^/]+$/.test(route.path))
  const isWalletPage = computed(() => /^\/wallets\/[^/]+$/.test(route.path))

  function canFilterCategory(trnItem: TrnItemFull) {
    return !isCategoryPage.value && trnItem.categoryId !== 'transfer'
  }

  // On a stat page the day goes into the URL only, so Back restores the period the user had.
  function filterByDate(date: number) {
    if (statDate) {
      router.push({ query: { ...route.query, customDate: `${date}` } })
      return
    }

    router.push({ path: '/dashboard', query: { customDate: `${date}` } })
  }

  function filterByCategory(categoryId: string) {
    if (filter?.canFilterCategories) {
      filter.setCategoryId(categoryId)
      return
    }

    return router.push(`/categories/${categoryId}`)
  }

  function filterByWallet(walletId: string) {
    if (filter?.canFilterWallets) {
      filter.setWallets([walletId])
      return
    }

    return router.push(`/wallets/${walletId}`)
  }

  function openWallet(walletId: string) {
    return router.push(`/wallets/${walletId}`)
  }

  function edit(trnId: TrnId) {
    openFormForEdit(trnId)
  }

  function duplicate(trnId: TrnId) {
    openFormForDuplicate(trnId)
  }

  async function deleteWithConfirm(trnId: TrnId) {
    if (!await confirm.ask({ title: t('trnForm.delete.alert') }))
      return false
    trnsStore.deleteTrn(trnId)
    return true
  }

  return {
    canFilterCategory,
    deleteWithConfirm,
    duplicate,
    edit,
    filterByCategory,
    filterByDate,
    filterByWallet,
    isWalletPage,
    openWallet,
  }
}
