export default ({ store }) => {
  return new Promise((resolve) => {
    store.dispatch('app/initAppFromCache', resolve)
    store.dispatch('app/initApp')
  })
}
