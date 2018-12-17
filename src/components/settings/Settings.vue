<script>
import Button from '@/components/shared/button/Button'
import ModalBottomConfirm from '@/components/modal/ModalBottomConfirm'

export default {
  components: {
    Button,
    ModalBottomConfirm
  },

  data () {
    return {
      confirmCreateDemo: false,
      confirmRemoveUserData: false
    }
  },

  methods: {
    generateDemo () {
      this.confirmCreateDemo = false
      this.$store.dispatch('createDemo')
    },

    removeUserData () {
      this.confirmRemoveUserData = false
      this.$store.dispatch('removeUserData')
    }
  }
}
</script>

<template lang="pug">
.settings
  .settings__header Settings

  .settings__group(v-if="$store.state.ui.mobile")
    .settings__subHeader Transaction form
    .settings__item
      Button._bdb(
        icon="mdi mdi-chart-bubble"
        :title="$store.state.ui.lastUsedCatsInTrnForm === 'visible' ? 'Show last used categories' : 'Hide last used categories'"
        v-on:onClick="$store.dispatch('toogleLastUsedCatsInTrnForm')")

  .settings__group
    .settings__subHeader Application
    .settings__item
      Button._bdb(
        icon="mdi mdi-palette"
        title="Change theme"
        v-on:onClick="$store.dispatch('changeTheme')")
    .settings__item
      Button._bdb(
        icon="mdi mdi-logout"
        title="Sign Out"
        v-on:onClick="$store.dispatch('signOut')")

  .settings__group
    .settings__subHeader Delete
    .settings__desc This will delete all your wallets, categories and trns
    .settings__item
      Button._bdb(
        icon="mdi mdi-delete"
        title="Delete my data"
        v-on:onClick="confirmRemoveUserData = true")

  .settings__group(v-if="$store.state.demo.hasDemo")
    .settings__subHeader Demo
    .settings__desc This will delete all your wallets, categories and trns
    .settings__item
      Button._bdb(
        icon="mdi mdi-test-tube"
        title="Load demo"
        v-on:onClick="confirmCreateDemo = true")

  ModalBottomConfirm(
    description="This will delete all your wallets, categories and trns"
    :show="confirmCreateDemo"
    v-on:onClose="confirmCreateDemo = false"
    v-on:onConfirm="generateDemo")
  ModalBottomConfirm(
    description="This will delete all your wallets, categories and trns"
    :show="confirmRemoveUserData"
    v-on:onClose="confirmRemoveUserData = false"
    v-on:onConfirm="removeUserData")
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/fonts"
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/media"

.settings
  @media $media-phone
    padding $m7

  @media $media-laptop
    max-width 380px

  &__group
    padding-bottom $m10

  &__desc
    padding-bottom $m5
    font-size 14px
    color var(--c-red-1)

  &__header
    font-header-4()
    padding-bottom $mn2

  &__subHeader
    font-header-1()
    padding-bottom $m7
</style>
