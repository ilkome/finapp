export default {
  setPeriodValues (state, { periodName, values }) {
    state.periods[periodName] = {
      ...state.periods[periodName],
      ...values
    }
  },

  toogleChartPeriodView (state, { periodName }) {
    state.periods[periodName].grouped = !state.periods[periodName].grouped
  },

  addElementsToChart (state, { periodName, periodType }) {
    state.periods[periodName][periodType] = state.periods[periodName][periodType] + 1
  },
  removeElementsFromChart (state, { periodName, periodType }) {
    state.periods[periodName][periodType] = state.periods[periodName][periodType] - 1
  },

  setHoveredPeriodValues (state, { values, offset }) {
    if (values) { state.hoveredPeriod.values = values }
    if (offset) { state.hoveredPeriod.offset = offset }
  },
  clearHoveredPeriodValues (state) {
    state.hoveredPeriod.values = null
    state.hoveredPeriod.offset = null
  }
}
