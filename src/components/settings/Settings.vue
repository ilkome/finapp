<script>
export default {
}
</script>

<template lang="pug">
div
  .settings
    .control(@click="$store.dispatch('changeTheme')")
      .control__icon: .mdi.mdi-palette
      .control__text Change theme

    .control(@click="$store.dispatch('signOut')")
      .control__icon: .mdi.mdi-logout
      .control__text Sign Out
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"

.settings
  padding-top $m6

.settingItem
  padding-top 20px
</style>
