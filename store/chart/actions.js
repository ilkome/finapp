import localforage from 'localforage'

export default {
  async initChart ({ rootState, commit }) {
    const localPeriods = await localforage.getItem('finapp.chart.periods')
    let showedPeriods

    if (!localPeriods) { return }

    for (const periodName in localPeriods) {
      if (!localPeriods[periodName]) { return }

      Number.isInteger(localPeriods[periodName].showedPeriods)
        ? showedPeriods = localPeriods[periodName].showedPeriods
        : showedPeriods = rootState.chart.periods[periodName].showedPeriods

      const periodValues = {
        ...localPeriods[periodName],
        showedPeriods
      }

      commit('chart/setPeriodValues', { periodName, values: periodValues }, { root: true })
    }
  }
}
