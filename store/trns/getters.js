import dayjs from 'dayjs'
import { getCategoriesIds, getTransferCategoriesIds } from '~/components/categories/getCategories'
import { getTrnsIds } from '~/components/trns/getTrns'

export default {
  hasTrns(_state, _getters, rootState) {
    if (rootState.trns.items) {
      if (Object.keys(rootState.trns.items).length > 0)
        return true
    }
    return false
  },

  lastCreatedTrnId(_state, getters, rootState) {
    if (!getters.hasTrns)
      return

    const trnsItems = rootState.trns.items
    const categoriesItems = rootState.categories.items
    const transferCategoriesIds = getTransferCategoriesIds(categoriesItems)

    return Object.keys(trnsItems)
      .sort((a, b) => trnsItems[b].date - trnsItems[a].date)
      .some(trnId =>
        !transferCategoriesIds.includes(trnsItems[trnId].categoryId)
        && trnsItems[trnId].type !== 2,
      )
  },

  firstCreatedTrnId(_state, getters, rootState) {
    if (!getters.hasTrns)
      return

    const trnsItems = rootState.trns.items
    const trnsIds = Object.keys(trnsItems)
      .sort((a, b) => trnsItems[b].date - trnsItems[a].date)
      .reverse()

    return trnsIds[0]
  },

  firstCreatedTrnIdFromSelectedTrns(_state, getters) {
    const trnsIds = [...getters.selectedTrnsIds].reverse()
    if (trnsIds.length)
      return trnsIds[0]
  },

  selectedTrnsIds(_state, getters, rootState) {
    if (!getters.hasTrns)
      return []

    const trnsItems = rootState.trns.items
    const categoriesItems = rootState.categories.items
    const storeFilter = rootState.filter

    // TODO: move it to a separate function getFilterParams
    const categoriesIds = rootState.filter.catsIds.length > 0
      ? getCategoriesIds(rootState.filter.catsIds, categoriesItems)
      : null
    const walletsIds = storeFilter.walletsIds.length > 0
      ? storeFilter.walletsIds
      : null

    return getTrnsIds({
      trnsItems,
      walletsIds,
      categoriesIds,
    })
  },

  // TODO: should use components/trns/getTrns when its compatible
  selectedTrnsIdsWithDate(_state, getters, rootState) {
    if (!getters.hasTrns)
      return []

    const trnsItems = rootState.trns.items
    const filterDate = dayjs(rootState.filter.date)
    const filterPeriod = rootState.filter.period
    const startDateValue = filterDate.startOf(filterPeriod).valueOf()
    const endDateValue = filterDate.endOf(filterPeriod).valueOf()
    let trnsIds = getters.selectedTrnsIds

    // filter date
    if (filterPeriod !== 'all') {
      trnsIds = trnsIds.filter(trnId =>
        (trnsItems[trnId].date >= startDateValue)
          && (trnsItems[trnId].date <= endDateValue))
    }

    return trnsIds.sort((a, b) => trnsItems[b].date - trnsItems[a].date)
  },
}
