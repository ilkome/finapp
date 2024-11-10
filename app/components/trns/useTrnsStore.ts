import dayjs from 'dayjs'
import localforage from 'localforage'
import { deepUnref } from 'vue-deepunref'
import type { Range } from '~/components/date/types'
import type {
  TrnId,
  TrnItem,
  TrnItemFull,
  Trns,
  TrnsGetterProps,
} from '~/components/trns/types'
import {
  getDataAndWatch,
  removeData,
  saveData,
  unsubscribeData,
  updateData,
} from '~~/services/firebase/api'
import { getTrnsIds } from '~/components/trns/getTrns'
import {
  removeTrnToAddLaterLocal,
  removeTrnToDeleteLaterLocal,
  saveTrnIDforDeleteWhenClientOnline,
  saveTrnToAddLaterLocal,
} from '~/components/trns/helpers'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useUserStore } from '~/components/user/useUserStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useDemo } from '~/components/demo/useDemo'

type TrnsGetterParams = {
  includesChildCategories?: boolean
}

export const useTrnsStore = defineStore('trns', () => {
  const userStore = useUserStore()
  const categoriesStore = useCategoriesStore()
  const walletsStore = useWalletsStore()
  const { deleteDemoTrns, isDemo } = useDemo()

  const items = shallowRef<Trns | null>(null)

  function getStoreTrnsIds(props: TrnsGetterProps, params?: TrnsGetterParams) {
    if (params?.includesChildCategories) {
      const categoriesIds = categoriesStore.getTransactibleIds(props.categoriesIds)
      return getTrnsIds({ ...props, categoriesIds, trnsItems: items.value! })
    }

    return getTrnsIds({ ...props, trnsItems: items.value! })
  }

  function getRange(trnsIds: TrnId[]): Range {
    if (!items.value) {
      return {
        end: dayjs().endOf('day').valueOf(),
        start: dayjs().startOf('day').valueOf(),
      }
    }

    return {
      end: items.value[trnsIds.at(0)!]?.date ?? dayjs().endOf('day').valueOf(),
      start:
        items.value[trnsIds.at(-1)!]?.date ?? dayjs().startOf('day').valueOf(),
    }
  }

  const hasItems = computed(() => Object.keys(items.value ?? {}).length > 0)

  const lastCreatedTrnId = computed(() => {
    if (!hasItems.value)
      return false

    return (
      Object.keys(items.value)
        .sort((a, b) => items.value[b].date - items.value[a].date)
        .find(
          trnId =>
            !categoriesStore.transferCategoriesIds.includes(
              items.value[trnId].categoryId,
            ) && items.value[trnId].type !== 2,
        ) ?? false
    )
  })

  const lastCreatedTrnItem = computed<TrnItem | false>(
    () => items.value?.[lastCreatedTrnId.value],
  )

  function initTrns() {
    const path = `users/${userStore.uid}/trns`
    getDataAndWatch(path, (values: Trns) => setTrns(values || {}))
  }

  function setTrns(values: Trns | null) {
    items.value = values
    localforage.setItem('finapp.trns', deepUnref(values))
  }

  function addTrn({ id, values }: { id: TrnId, values: TrnItem }) {
    let isTrnSavedOnline = false
    const valuesWithEditDate = {
      ...values,
      edited: dayjs().valueOf(),
    }

    localforage.setItem('finapp.trns', deepUnref({ ...items.value, [id]: valuesWithEditDate }))
    setTrns({ ...items.value, [id]: valuesWithEditDate })

    saveData(`users/${userStore.uid}/trns/${id}`, valuesWithEditDate).then(() => {
      isTrnSavedOnline = true
      removeTrnToAddLaterLocal(id)
    })

    setTimeout(() => {
      if (!isTrnSavedOnline)
        saveTrnToAddLaterLocal({ id, values })
    }, 1000)
  }

  function deleteTrn(id: TrnId) {
    const trns = { ...items.value }

    delete trns[id]
    setTrns(trns)

    localforage.setItem('finapp.trns', deepUnref(trns))
    saveTrnIDforDeleteWhenClientOnline(id)

    removeData(`users/${userStore.uid}/trns/${id}`).then(() =>
      removeTrnToDeleteLaterLocal(id),
    )
  }

  function deleteTrnsByIds(trnsIds: TrnId[]) {
    const trnsForDelete: Trns = {}
    if (isDemo.value) {
      deleteDemoTrns(trnsIds)
      return
    }

    for (const trnId of trnsIds) trnsForDelete[trnId] = null

    updateData(`users/${userStore.uid}/trns`, trnsForDelete)
  }

  function unsubscribeTrns() {
    unsubscribeData(`users/${userStore.uid}/trns`)
    setTrns(null)
  }

  function uploadOfflineTrns() {
    getDataAndWatch('.info/connected', async (isConnected: boolean) => {
      const walletsStore = useWalletsStore()

      if (isConnected) {
        const trnsArrayForDelete = (await localforage.getItem('finapp.trns.offline.delete')) || []
        const trnsItemsForUpdate = (await localforage.getItem('finapp.trns.offline.update')) || {}

        // delete trns
        for (const trnId of trnsArrayForDelete) {
          deleteTrn(trnId)
          delete trnsItemsForUpdate[trnId]
        }

        await localforage.setItem('finapp.trns.offline.update', deepUnref(trnsItemsForUpdate))

        // add trns
        for (const trnId in trnsItemsForUpdate) {
          const wallet = walletsStore.items[trnsItemsForUpdate[trnId].walletId]
          const category = categoriesStore.items[trnsItemsForUpdate[trnId].categoryId]

          // delete trn from local storage if no wallet or category
          if (!wallet || !category) {
            delete trnsItemsForUpdate[trnId]
            await localforage.setItem('finapp.trns.offline.update', deepUnref(trnsItemsForUpdate))
          }

          // add
          else if (trnsItemsForUpdate[trnId] && trnsItemsForUpdate[trnId].amount) {
            addTrn({
              id: trnId,
              values: trnsItemsForUpdate[trnId],
            })
          }
        }
      }
    })
  }

  /**
   * Modal
   */
  const isShownModal = ref<boolean>(false)
  function showTrnModal() {
    isShownModal.value = true
  }

  function hideTrnModal() {
    isShownModal.value = false
  }

  function computeTrnItem(id: TrnId): TrnItemFull | string {
    if (!items.value || !walletsStore?.items || !categoriesStore?.items)
      return 'Something missing'

    // Trn
    const trn = items.value[id]
    if (!trn)
      return 'Trn not found'

    // Category
    const category = categoriesStore.items[trn.categoryId]
    if (!category)
      return 'Category not found'

    // Parent category
    let categoryParent
    if (category.parentId) {
      categoryParent = categoriesStore.items[category.parentId]
      if (!categoryParent)
        return 'Parent Category not found'
    }

    // Transaction
    if (trn.type !== 2) {
      // Wallet
      const wallet = walletsStore.items[trn.walletId]
      if (!wallet)
        return 'Wallet not found'

      return {
        id,
        ...trn,
        category,
        categoryParent,
        wallet,
      }
    }

    if (trn.type === 2) {
      const expenseWalletId = trn.expenseWalletId || trn.walletFromId
      const expenseWallet = walletsStore.items[expenseWalletId]
      if (!expenseWallet)
        return 'Transfer expense Wallet not found'

      const incomeWalletId = trn.incomeWalletId || trn.walletToId
      const incomeWallet = walletsStore.items[incomeWalletId]
      if (!incomeWallet)
        return 'Transfer income Wallet not found'

      return {
        id,
        ...trn,
        category,
        categoryParent,
        expenseWallet,
        incomeWallet,
      }
    }

    return 'Trn type not found'
  }

  return {
    addTrn,
    computeTrnItem,
    deleteTrn,
    deleteTrnsByIds,
    getRange,
    getStoreTrnsIds,
    hasItems,
    hideTrnModal,
    initTrns,
    isShownModal,
    items,
    lastCreatedTrnId,
    lastCreatedTrnItem,
    setTrns,
    showTrnModal,
    unsubscribeTrns,
    uploadOfflineTrns,
  }
})
