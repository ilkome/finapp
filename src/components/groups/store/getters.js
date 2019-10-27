export default {
  /**
    * Return groups
    *
    * @return {Object} Object
    * @return {String} {}.name
  */
  groups (state, getters, rootState, rootGetters) {
    return rootState.groups.items
  }
}
