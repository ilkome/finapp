export const initStatus = {
  loading: true,
  login: false,
  ready: false,
}

export const state = () => ({
  status: {
    ...initStatus,
    loading: true,
  },
})
