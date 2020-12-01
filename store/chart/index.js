import actions from './actions'
import mutations from './mutations'

const state = () => ({
  hoveredPeriod: {
    values: null,
    position: null
  },

  periods: {
    day: {
      groupedBy: 'month',
      showedGroups: 1,
      showedPeriods: 14,
      grouped: false
    },
    week: {
      groupedBy: 'month',
      showedGroups: 3,
      showedPeriods: 6,
      grouped: false
    },
    month: {
      groupedBy: 'year',
      showedGroups: 1,
      showedPeriods: 6,
      grouped: false
    },
    year: {
      groupedBy: 'year',
      showedGroups: 2,
      showedPeriods: 3,
      grouped: false
    }
  }
})

export default {
  state,
  actions,
  mutations
}
