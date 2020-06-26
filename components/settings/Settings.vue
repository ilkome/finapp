<script>
import Button from '~/components/shared/button/Button'
import ComponentWrap from '~/components/layout/component/Component'
import ModalBottomConfirm from '~/components/modal/ModalBottomConfirm'
import LangDropdown from '~/components/lang/LangDropdown'

export default {
  components: {
    Button,
    ComponentWrap,
    ModalBottomConfirm,
    LangDropdown
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
      this.$store.dispatch('demo/createDemo')
    },

    removeUserData () {
      this.confirmRemoveUserData = false
      this.$store.dispatch('user/removeUserData')
    }
  }
}
</script>

<template lang="pug">
ComponentWrap(:contentPadding="false")
  template(slot="headerLeft") {{ $lang.settings.title }}

  template(slot="content")
    .settings
      .settings__group
        .settings__subHeader {{ $lang.trnForm.title }}
        .settings__item
          Button._bdb(
            :checkboxValue="$store.state.ui.lastUsedCatsInTrnForm === 'visible'"
            :showCheckbox="true"
            :title="$lang.trnForm.lastUsedCats"
            icon="mdi mdi-folder-star"
            v-on:onClick="$store.dispatch('ui/toogleLastUsedCatsInTrnForm')")

      .settings__group
        .settings__subHeader {{ $lang.settings.lang }}
        .settings__item
          LangDropdown

      .settings__group
        .settings__subHeader {{ $lang.settings.app }}
        .settings__item
          Button._bdb(
            icon="mdi mdi-palette"
            title="Change theme"
            v-on:onClick="$store.dispatch('ui/changeTheme')")
        .settings__item
          Button._bdb(
            icon="mdi mdi-logout"
            title="Sign Out"
            v-on:onClick="$store.dispatch('user/signOut')")

      .settings__group._paddingTop
        .settings__subHeader {{ $lang.settings.delete }}
        .settings__desc {{ $lang.alerts.willDeleteEverything }}
        .settings__item
          Button._bdb(
            icon="mdi mdi-delete"
            title="Delete my data"
            v-on:onClick="confirmRemoveUserData = true")

      .settings__group(v-if="$store.state.demo.hasDemo")
        .settings__subHeader {{ $lang.settings.demo }}
        .settings__desc {{ $lang.alerts.willDeleteEverything }}
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
        v-on:onConfirm="removeUserData"
      )
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/fonts"
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/media"

.settings
  padding 16px

  +media-laptop()
    max-width 480px
    padding 32px 60px

  &__group
    padding-bottom 48px
    &._paddingTop
      padding-top 48px

  &__item
    padding-bottom $m7
    &:last-child
      padding-bottom 0

  &__desc
    padding-bottom 8px
    font-size 14px
    color var(--c-red-1)

  &__header
    font-header-4()
    font-weight 500
    font-size 24px
    padding-bottom $mn2

  &__subHeader
    font-header-1()
    font-size 16px
    font-weight 500
    padding-bottom 16px
</style>
