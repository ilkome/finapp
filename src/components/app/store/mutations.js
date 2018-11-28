import { initStatus } from './'

export default {
  setAppStatus (state, status) {
    if (!state.status[status]) {
      state.status = {
        ...initStatus,
        [status]: true
      }
    }
  }
}
