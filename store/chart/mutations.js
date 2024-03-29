export default {
  setPeriodValues(state, { periodName, values }) {
    state.periods[periodName] = {
      ...state.periods[periodName],
      ...values,
    }
  },

  toggleChartPeriodView(state, { periodName }) {
    state.periods[periodName].grouped = !state.periods[periodName].grouped
  },

  addElementsToChart(state, { periodName, periodType }) {
    state.periods[periodName][periodType] = state.periods[periodName][periodType] + 1
  },

  removeElementsFromChart(state, { periodName, periodType }) {
    state.periods[periodName][periodType] = state.periods[periodName][periodType] - 1
  },

  setElementsToChart(state, { period, value }) {
    state.periods[period].showedPeriods = value
  },
}
