<script>
import pkg from '~/package'

export default {
  data () {
    return {
      confirmCreateDemo: false,
      confirmRemoveUserData: false,
      version: pkg.version
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
LayoutComponentWrap(:contentPadding="false")
  template(slot="headerLeft") {{ $t('settings.title') }}

  template(slot="content")
    .settings
      .settings__group
        .settings__subHeader {{ $t('settings.lang') }}
        .settings__item
          LangDropdown

      .settings__group
        .settings__subHeader {{ $t('settings.app') }}
        .settings__item
          SharedButton._bdb(
            icon="mdi mdi-palette"
            :title="$t('theme.change')"
            @onClick="$store.dispatch('ui/changeTheme')"
          )

        .settings__item
          SharedButton._bdb(
            :title="$t('userLogout')"
            icon="mdi mdi-logout"
            @onClick="$store.dispatch('user/signOut')"
          )

      .settings__group._paddingTop
        .settings__subHeader {{ $t('settings.delete') }}
        .settings__desc {{ $t('alerts.willDeleteEverything') }}
        .settings__item
          SharedButton._bdb(
            :title="$t('settings.deleteButton')"
            icon="mdi mdi-delete"
            @onClick="confirmRemoveUserData = true"
          )

      .settings__group(v-if="$store.state.demo.hasDemo")
        .settings__subHeader {{ $t('settings.demo') }}
        .settings__desc {{ $t('alerts.willDeleteEverything') }}
        .settings__item
          SharedButton._bdb(
            :title="$t('settings.loadDemoButton')"
            icon="mdi mdi-test-tube"
            @onClick="confirmCreateDemo = true"
          )

      .settings__group
        About
        .appVersion {{ $t('app.version') }} {{ version }}

      ModalBottomConfirm(
        :description="$t('alerts.willDeleteEverything')"
        :show="confirmCreateDemo"
        @onClose="confirmCreateDemo = false"
        @onConfirm="generateDemo"
      )

      ModalBottomConfirm(
        :description="$t('alerts.willDeleteEverything')"
        :show="confirmRemoveUserData"
        @onClose="confirmRemoveUserData = false"
        @onConfirm="removeUserData"
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

.thanksTo
  color var(--c-font-2)
  font-size 14px

.appVersion
  padding-top $m10
  color var(--c-font-3)
  font-size 10px
</style>
