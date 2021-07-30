import localforage from 'localforage'

export default {
  async initUi ({ commit, dispatch }) {
    const uiLocalStore = await localforage.getItem('finapp.stat')
    const activeTabViewName = await localforage.getItem('finapp.activeTabViewName')

    if (activeTabViewName)
      commit('setActiveTabViewName', activeTabViewName)

    // ui
    if (uiLocalStore) {
      uiLocalStore.activeTabStat &&
        dispatch('setActiveTabStat', uiLocalStore.activeTabStat)

      uiLocalStore.activeTabViewName &&
        dispatch('setActiveTabViewName', uiLocalStore.activeTabViewName)
    }
  },

  setActiveTabViewName ({ state, commit }, value) {
    if (state.activeTabViewName !== value) {
      commit('setActiveTabViewName', value)
      localforage.setItem('finapp.activeTabViewName', value)
      // TODO: save to composition api
    }
  },

  /**
   * Change theme
   * Commit new theme and save to localStorage
   *
   * @param {string} theme - New theme value (light, dark).
   */
  changeTheme (_, theme) {
    // eslint-disable-next-line no-undef
    const currentTheme = $nuxt.$colorMode.value
    let newTheme

    theme
      ? newTheme = theme
      : currentTheme === 'dark' ? newTheme = 'light' : newTheme = 'dark'

    // eslint-disable-next-line no-undef
    $nuxt.$colorMode.preference = newTheme
  },

  /**
    * Set app dimensions
    *
    * @param {number} height
    * @param {number} width
  */
  setAppDimensions ({ commit }, { height, width }) {
    let view = 'mobile'
    if (width >= 1300) view = 'pc'

    commit('setAppDimensions', {
      mobile: view === 'mobile',
      pc: view === 'pc',
      width,
      height
    })
  },

  /**
    * Set active tab
    * Commit new tab and save to localStorage
    *
    * @param {string} nextTab - Next tab name.
  */
  setActiveTab ({ commit, state }, nextTab) {
    if (state.activeTab !== nextTab) {
      commit('setActiveTab', nextTab)
      localforage.setItem('finapp.stat', state)
    }
  },

  /**
    * Set active tab at Stat screen on Mobile
    * Commit new tab and save ui state to localStorage
    *
    * @param {string} nextTab - Next tab name.
  */
  setActiveTabStat ({ commit, state }, nextTab) {
    commit('setActiveTabStat', nextTab)
    localforage.setItem('finapp.stat', state)
  },

  toogleStat ({ commit, dispatch, state }, id) {
    let value
    state.stat[id] === 'visible'
      ? value = 'hidden'
      : value = 'visible'

    commit('ui/setShow', { id, value }, { root: true })
    dispatch('ui/saveUiView', null, { root: true })
  },

  /**
    * Save ui view state to localStorage for selected filter
  */
  async saveUiView ({ rootState }) {
    const localName = 'finapp.statViewConfig'
    const localFilterUi = await localforage.getItem(localName)
    const walletName = rootState.filter.walletId || 'root'
    const periodName = rootState.filter.period || 'month'
    const categoryName = rootState.filter.categoryId || 'root'
    const activeTabViewName = rootState.ui.activeTabViewName || 'expenses'
    const uiItemName = `${walletName}${categoryName}${periodName}${activeTabViewName}`

    await localforage.setItem(localName, {
      ...localFilterUi,
      [uiItemName]: {
        period: rootState.filter.period,
        totalChartPeriods: rootState.chart.periods
      }
    })

    const periods = rootState.chart.periods
    localforage.setItem('finapp.chart.periods', periods)
  }
}
