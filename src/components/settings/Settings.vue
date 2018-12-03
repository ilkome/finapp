<script>
import Button from '@/components/shared/button/Button'

export default {
  components: {
    Button
  }
}
</script>

<template lang="pug">
.settings
  .settings__header Settings

  .settings__item
    Button._grey._inline(
      icon="mdi mdi-palette"
      title="Change theme"
      v-on:onClick="$store.dispatch('changeTheme')")

  .settings__item
    Button._grey._inline(
      icon="mdi mdi-logout"
      title="Sign Out"
      v-on:onClick="$store.dispatch('signOut')")
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/fonts"
@import "~@/stylus/variables/margins"

.settings
  padding-top $m6

  &__header
    font-header-4()
    padding-bottom $m9

  &__item
    padding-bottom $m8
</style>
