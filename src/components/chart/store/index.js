import actions from './actions'
import getters from './getters'
import mutations from './mutations'

const state = {
  hoveredPeriod: {
    values: null,
    position: null
  },

  periods: {
    day: {
      groupedBy: 'month',
      showedGroups: 2,
      showedPeriods: 14,
      grouped: true
    },
    week: {
      groupedBy: 'month',
      showedGroups: 5,
      showedPeriods: 8,
      grouped: true
    },
    month: {
      groupedBy: 'year',
      showedGroups: 2,
      showedPeriods: 8,
      grouped: true
    },
    year: {
      groupedBy: 'year',
      showedGroups: 3,
      showedPeriods: 3,
      grouped: false
    }
  }
}

export default {
  state,
  actions,
  getters,
  mutations
}
