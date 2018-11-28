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
      showedPeriods: 5,
      grouped: true
    },
    week: {
      groupedBy: 'month',
      showedGroups: 6,
      showedPeriods: 5,
      grouped: true
    },
    month: {
      groupedBy: 'year',
      showedGroups: 2,
      showedPeriods: 5,
      grouped: false
    },
    year: {
      groupedBy: 'year',
      showedGroups: 5,
      showedPeriods: 5,
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
