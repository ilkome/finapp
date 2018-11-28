import localforage from 'localforage'

// changeTheme
// setActiveTab
// setPrevTab
// setAppDimensions
export default {
  async initUi ({ commit, dispatch }) {
    const uiLocalStore = await localforage.getItem('uiLocalStore')

    // stat chats
    const statGraphsVisible = await localforage.getItem('next.statGraphsVisible')
    if (statGraphsVisible === 'visible') commit('showStatGraphs')
    if (statGraphsVisible === 'hidden') commit('hideStatGraphs')

    // visible trnForm last used categories
    const lastUsedCatsInTrnForm = await localforage.getItem('ui.lastUsedCatsInTrnForm')
    if (lastUsedCatsInTrnForm === 'visible') commit('setLastUsedCatsInTrnForm', 'visible')
    if (lastUsedCatsInTrnForm === 'hidden') commit('setLastUsedCatsInTrnForm', 'hidden')

    // visible cats charts
    const catsChart = await localforage.getItem('ui.catsChart')
    if (catsChart === 'visible') commit('setVisibleCatsChart', 'visible')
    if (catsChart === 'hidden') commit('setVisibleCatsChart', 'hidden')

    if (uiLocalStore) {
      if (uiLocalStore.statItems) commit('setVisibilityStatItems', uiLocalStore.statItems)

      uiLocalStore.lastTrns === 'visible'
        ? commit('setVisibleLastTrns', 'visible')
        : commit('setVisibleLastTrns', 'hidden')

      if (uiLocalStore.stat) {
        uiLocalStore.stat.walletsVisibility === 'visible'
          ? commit('setStatWalletsVisibility', 'visible')
          : commit('setStatWalletsVisibility', 'hidden')
      }
    }
  },

  // stat chats
  toogleShowStatGraphs ({ state, dispatch }) {
    if (state.statGraphsVisible) {
      dispatch('hideStatGraphs')
    } else {
      dispatch('showStatGraphs')
    }
  },
  showStatGraphs ({ commit }) {
    commit('showStatGraphs')
    localforage.setItem('next.statGraphsVisible', 'visible')
  },
  hideStatGraphs ({ commit }) {
    commit('hideStatGraphs')
    localforage.setItem('next.statGraphsVisible', 'hidden')
  },

  // change theme
  changeTheme ({ commit, rootState }, theme) {
    const body = document.querySelector('.body')
    let newTheme

    const changeToDark = () => {
      newTheme = 'dark'
      body.classList.add('theme-dark')
      body.classList.remove('theme-light')
    }

    const changeToLight = () => {
      newTheme = 'light'
      body.classList.add('theme-light')
      body.classList.remove('theme-dark')
    }

    if (theme) {
      theme === 'dark' ? changeToDark() : changeToLight()
    } else {
      rootState.ui.theme === 'dark' ? changeToLight() : changeToDark()
    }
    commit('setTheme', newTheme)
    localforage.setItem('next.theme', newTheme)
  },

  // set tab
  setActiveTab ({ commit, state }, nextTab) {
    if (state.activeTab !== nextTab) {
      commit('setActiveTab', nextTab)
      localforage.setItem('next.activeTab', nextTab)
    } else {
      if (nextTab === 'settings') {
        localforage.setItem('next.activeTab', state.prevTab)
        commit('setActiveTab', state.prevTab)
      }
    }
  },
  setPrevTab ({ dispatch, state }) {
    if (state.prevTab) {
      dispatch('setActiveTab', state.prevTab)
    }
  },
  setActiveTabStat ({ commit, state }, nextTab) {
    if (state.stat.activeTab !== nextTab) {
      commit('setActiveTabStat', nextTab)
      localforage.setItem('uiLocalStore', state)
    }
  },

  // setAppDimensions
  setAppDimensions ({ commit }, { height, width }) {
    let view = 'mobile'
    if (width >= 768) view = 'pc'

    commit('setAppDimensions', {
      mobile: view === 'mobile',
      pc: view === 'pc',
      width,
      height
    })
  },

  // toggle last used categories in trnForm
  toogleLastUsedCatsInTrnForm ({ commit, state }) {
    let nextStatus
    state.lastUsedCatsInTrnForm === 'visible'
      ? nextStatus = 'hidden'
      : nextStatus = 'visible'

    localforage.setItem('ui.lastUsedCatsInTrnForm', nextStatus)
    commit('setLastUsedCatsInTrnForm', nextStatus)
  },

  // visible last trns in mobile stat
  tooglevisibleLastTrns ({ commit, state }) {
    let nextStatus
    state.lastTrns === 'visible'
      ? nextStatus = 'hidden'
      : nextStatus = 'visible'

    localforage.setItem('uiLocalStore', state)
    commit('setVisibleLastTrns', nextStatus)
  },

  // visible cats chart
  toogleVisibleCatsChart ({ commit, state }) {
    let nextStatus
    state.catsChart === 'visible'
      ? nextStatus = 'hidden'
      : nextStatus = 'visible'

    localforage.setItem('ui.catsChart', nextStatus)
    commit('setVisibleCatsChart', nextStatus)
  },
  toogleVisibilityStatItems ({ commit, state }) {
    let nextStatus
    state.statItems === 'visible'
      ? nextStatus = 'hidden'
      : nextStatus = 'visible'

    localforage.setItem('uiLocalStore', state)
    commit('setVisibilityStatItems', nextStatus)
  },
  setStatWalletsVisibility ({ commit, state }) {
    let nextStatus
    state.stat.walletsVisibility === 'visible'
      ? nextStatus = 'hidden'
      : nextStatus = 'visible'

    localforage.setItem('uiLocalStore', state)
    commit('setStatWalletsVisibility', nextStatus)
  }
}
