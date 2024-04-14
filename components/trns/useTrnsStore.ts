import dayjs from 'dayjs'
import { deepUnref } from 'vue-deepunref'
import localforage from 'localforage'
import { removeTrnToAddLaterLocal, removeTrnToDeleteLaterLocal, saveTrnIDforDeleteWhenClientOnline, saveTrnToAddLaterLocal } from '~/components/trns/helpers'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useFilterStore } from '~/components/filter/useFilterStore'
import { getTrnsIds } from '~/components/trns/getTrns'
import type { TrnId, TrnItem, Trns } from '~/components/trns/types'
import type { CategoryId } from '~/components/categories/types'
import { useUserStore } from '~/components/user/useUser'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import {
  getDataAndWatch,
  removeData,
  saveData,
  unsubscribeData,
  updateData,
} from '~/services/firebase/api'
import { getDate } from '~/components/date/format'

export const useTrnsStore = defineStore('trns', () => {
  const userStore = useUserStore()
  const categoriesStore = useCategoriesStore()
  const filterStore = useFilterStore()

  const items = ref<Trns>({})

  const hasTrns = computed(() => Object.keys(items.value ?? {}).length > 0)

  const filteredTrnsIds = computed(() => {
    const categoriesIds
    = filterStore.catsIds.length > 0
      ? categoriesStore.getTransactibleIds(filterStore.catsIds)
      : false
    const walletsIds
    = filterStore.walletsIds.length > 0 ? filterStore.walletsIds : false

    return getTrnsIds({
      dates: getDate(filterStore.periodNameWithAll, filterStore.date),
      categoriesIds,
      trnsItems: items.value,
      walletsIds,
    })
  })

  const allTrnsIdsWithFilter = computed(() => {
    const categoriesIds: CategoryId[] = filterStore.catsIds.length > 0
      ? categoriesStore.getTransactibleIds(filterStore.catsIds)
      : []

    const walletsIds = filterStore.walletsIds.length > 0
      ? filterStore.walletsIds
      : []

    return getTrnsIds({
      categoriesIds,
      walletsIds,
      trnsItems: items.value,
    })
  })

  const selectedTrnsIdsWithDate = computed(() => {
    if (!hasTrns.value)
      return []

    return getTrnsIds({
      dates: getDate(filterStore.periodNameWithAll, filterStore.date),
      trnsItems: items.value,
    })
  })

  const firstCreatedTrnIdFromSelectedTrns = computed(
    () => allTrnsIdsWithFilter.value[allTrnsIdsWithFilter.value.length - 1],
  )

  const lastCreatedTrnId = computed(() => {
    if (!hasTrns.value)
      return false

    return Object.keys(items.value)
      .sort((a, b) => items.value[b].date - items.value[a].date)
      .find(
        trnId =>
          !categoriesStore.transferCategoriesIds.includes(items.value[trnId].categoryId)
          && items.value[trnId].type !== 2,
      ) ?? false
  })

  const firstCreatedTrnId = computed<TrnItem | false>(() => {
    if (!hasTrns.value)
      return false

    return Object.keys(items.value).sort(
      (a, b) => items.value[a].date - items.value[b].date,
    )[0]
  })

  const lastCreatedTrnItem = computed<TrnItem | false>(
    () => items.value?.[lastCreatedTrnId.value],
  )

  function initTrns() {
    const path = `users/${userStore.uid}/trns`
    getDataAndWatch(path, (values: Trns) => setTrns(values || {}))
  }

  function setTrns(values: Trns) {
    items.value = values
    localforage.setItem('finapp.trns', deepUnref(values))
  }

  function addTrn({ id, values }) {
    let isTrnSavedOnline = false
    const valuesWithEditDate = {
      ...values,
      edited: dayjs().valueOf(),
    }

    localforage.setItem('finapp.trns', deepUnref({
      ...items.value,
      [id]: valuesWithEditDate,
    }))

    setTrns({ ...items.value, [id]: valuesWithEditDate })

    saveData(`users/${userStore.uid}/trns/${id}`, valuesWithEditDate).then(
      () => {
        isTrnSavedOnline = true
        removeTrnToAddLaterLocal(id)
      },
    )

    setTimeout(() => {
      if (!isTrnSavedOnline)
        saveTrnToAddLaterLocal({ id, values })
    }, 1000)

    return true
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

  function deleteTrnsByIds(trnsIds) {
    const trnsForDelete = {}
    for (const trnId of trnsIds) trnsForDelete[trnId] = null

    updateData(`users/${userStore.uid}/trns`, trnsForDelete)
  }

  function unsubscribeTrns() {
    unsubscribeData(`users/${userStore.uid}/trns`)
    setTrns(null)
  }

  function uploadOfflineTrns() {
    getDataAndWatch('.info/connected', async (isConnected) => {
      const walletsStore = useWalletsStore()

      if (isConnected) {
        const trnsArrayForDelete
          = (await localforage.getItem('finapp.trns.offline.delete')) || []
        const trnsItemsForUpdate
          = (await localforage.getItem('finapp.trns.offline.update')) || {}

        // delete trns
        for (const trnId of trnsArrayForDelete) {
          deleteTrn(trnId)
          delete trnsItemsForUpdate[trnId]
        }

        await localforage.setItem(
          'finapp.trns.offline.update',
          deepUnref(trnsItemsForUpdate),
        )

        // add trns
        for (const trnId in trnsItemsForUpdate) {
          const wallet = walletsStore.items[trnsItemsForUpdate[trnId].walletId]
          const category
            = categoriesStore.items[trnsItemsForUpdate[trnId].categoryId]

          // delete trn from local storage if no wallet or category
          if (!wallet || !category) {
            delete trnsItemsForUpdate[trnId]
            await localforage.setItem(
              'finapp.trns.offline.update',
              deepUnref(trnsItemsForUpdate),
            )
          }

          // add
          else if (
            trnsItemsForUpdate[trnId]
            && trnsItemsForUpdate[trnId].amount
          ) {
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
   * Edit
   */
  const editId = ref<TrnId | null>(null)
  function setTrnModalId(id: TrnId) {
    editId.value === id ? (editId.value = null) : (editId.value = id)
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

  return {
    // Trns
    items,

    hasTrns,
    lastCreatedTrnId,
    firstCreatedTrnId,
    lastCreatedTrnItem,
    firstCreatedTrnIdFromSelectedTrns,
    selectedTrnsIdsWithDate,
    filteredTrnsIds,
    allTrnsIdsWithFilter,

    initTrns,
    setTrns,
    addTrn,
    deleteTrn,
    unsubscribeTrns,
    deleteTrnsByIds,
    uploadOfflineTrns,

    // Edit
    editId,
    setTrnModalId,

    // Modal
    isShownModal,
    showTrnModal,
    hideTrnModal,
  }
})
