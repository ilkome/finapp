import dayjs from 'dayjs'
import localforage from 'localforage'
import {
  getTransactibleCategoriesIds,
  getTransferCategoriesIds,
} from '~/components/categories/getCategories'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useFilter } from '~/components/filter/useFilter'
import { getTrnsIds } from '~/components/trns/getTrns'
import {
  removeTrnToAddLaterLocal,
  removeTrnToDeleteLaterLocal,
  saveTrnIDforDeleteWhenClientOnline,
  saveTrnToAddLaterLocal,
} from '~/components/trns/helpers'
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

export const useTrnsStore = defineStore('trns', () => {
  const userStore = useUserStore()
  const categoriesStore = useCategoriesStore()
  const filterStore = useFilter()

  const items = ref<Trns | null>({})

  const hasTrns = computed(() => Object.keys(items.value ?? {}).length > 0)

  const lastCreatedTrnId = computed(() => {
    if (!hasTrns.value)
      return false

    const transferCategoriesIds = getTransferCategoriesIds(
      categoriesStore.items,
    )

    return (
      Object.keys(items.value)
        .sort((a, b) => items.value[b].date - items.value[a].date)
        .find(
          trnId =>
            !transferCategoriesIds.includes(items.value[trnId].categoryId)
            && items.value[trnId].type !== 2,
        ) ?? false
    )
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

  const selectedTrnsIds = computed(() => {
    if (!hasTrns.value)
      return []

    // TODO: move it to a separate function getFilterParams
    const categoriesIds: CategoryId[] | false
      = filterStore.catsIds.length > 0
        ? getTransactibleCategoriesIds(
          filterStore.catsIds,
          categoriesStore.items,
        )
        : false

    const walletsIds
      = filterStore.walletsIds.length > 0 ? filterStore.walletsIds : false

    return (
      getTrnsIds({
        trnsItems: items.value ?? {},
        walletsIds,
        categoriesIds,
      }) || []
    )
  })

  const firstCreatedTrnIdFromSelectedTrns = computed(
    () => selectedTrnsIds.value[selectedTrnsIds.value.length - 1],
  )

  const selectedTrnsIdsWithDate = computed(() => {
    if (!hasTrns.value)
      return []

    const filterDate = dayjs(filterStore.date)
    const startDateValue = filterDate
      .startOf(filterStore.periodWithoutAll)
      .valueOf()
    const endDateValue = filterDate
      .endOf(filterStore.periodWithoutAll)
      .valueOf()
    let trnsIds = selectedTrnsIds.value || []

    // filter date
    if (filterStore.period !== 'all') {
      trnsIds = trnsIds.filter(
        trnId =>
          items.value[trnId].date >= startDateValue
          && items.value[trnId].date <= endDateValue,
      )
    }

    return trnsIds.sort((a, b) => items.value[b].date - items.value[a].date)
  })

  function initTrns() {
    const path = `users/${userStore.uid}/trns`
    getDataAndWatch(path, (values: Trns) => setTrns(values || {}))
  }

  function setTrns(values: Trns | null) {
    items.value = values
    localforage.setItem('finapp.trns', values)
  }

  function getOldestTrnDate() {
    // const startOfToday = dayjs().startOf('day').valueOf()
    // const minDate = Math.min(...Object.values(trnsItems).map(trn => trn.date))
    // return minDate || startOfToday
  }

  function addTrn({ id, values }) {
    let isTrnSavedOnline = false
    const valuesWithEditDate = {
      ...values,
      edited: dayjs().valueOf(),
    }

    localforage.setItem('finapp.trns', {
      ...items.value,
      [id]: valuesWithEditDate,
    })

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

    localforage.setItem('finapp.trns', trns)
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
          trnsItemsForUpdate,
        )

        // add trns
        for (const trnId in trnsItemsForUpdate) {
          const wallet = walletsStore.items[trnsItemsForUpdate[trnId].walletId]
          const category
            = rootState.categories.items[trnsItemsForUpdate[trnId].categoryId]

          // delete trn from local storage if no wallet or category
          if (!wallet || !category) {
            delete trnsItemsForUpdate[trnId]
            await localforage.setItem(
              'finapp.trns.offline.update',
              trnsItemsForUpdate,
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
    selectedTrnsIds,
    firstCreatedTrnIdFromSelectedTrns,
    selectedTrnsIdsWithDate,

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
