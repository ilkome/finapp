<script>
import pkg from '~/package'

export default {
  name: 'SettingsPage',

  data () {
    return {
      confirmCreateDemo: false,
      confirmRemoveUserData: false,
      version: pkg.version
    }
  },

  head () {
    return {
      title: this.$t('settings.title')
    }
  },

  methods: {
    async generateDemo () {
      this.confirmCreateDemo = false
      await this.$store.dispatch('demo/createDemo')

      if (this.$route.name !== 'index')
        this.$router.push('/')
    },

    removeUserData () {
      this.confirmRemoveUserData = false
      this.$store.dispatch('user/removeUserData')

      if (this.$route.name !== 'welcome')
        this.$router.push('/welcome')
    }
  }
}
</script>

<template lang="pug">
LayoutBaseWrap(:contentPadding="false")
  template(slot="content")
    .header {{ $t('settings.title') }}

    .settings
      .settings__column
        .settings__group
          .settings__subHeader {{ $t('currency.title') }}
          .settings__item
            SharedButton._bdb(
              :title="$t('currency.selectBaseTitle')"
              icon="mdi mdi-currency-usd"
              @onClick="$store.commit('currencies/showBaseCurrenciesModal')"
            )

        .settings__group
          .settings__subHeader {{ $t('settings.app') }}
          .settings__item
            LangDropdown
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

        .settings__group
          .settings__subHeader {{ $t('settings.caution') }}
          .settings__desc {{ $t('alerts.willDeleteEverything') }}
          .settings__item
            SharedButton._bdb(
              :title="$t('settings.deleteButton')"
              icon="mdi mdi-delete-empty-outline"
              @onClick="confirmRemoveUserData = true"
            )
          .settings__item(v-if="$store.state.demo.hasDemo")
            SharedButton._bdb(
              :title="$t('settings.loadDemoButton')"
              icon="mdi mdi-gamepad-variant-outline"
              @onClick="confirmCreateDemo = true"
            )
      .settings__column
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
@import '~assets/stylus/variables'

.button
  button-base-1()

.header
  header-title()

.settings
  width 100%
  flex-grow 1
  max-width 660px
  margin 0 auto
  padding 0 $m7
  padding-top 0

  +media-laptop()
    display grid
    grid-template-columns repeat(auto-fill, minmax(280px, 1fr))
    grid-column-gap $mb2
    grid-row-gap $m10

  &__group
    padding-bottom 56px

  &__item
    padding-bottom $m7
    &:last-child
      padding-bottom 0

  &__desc
    padding-bottom $m7
    color var(--c-red-1)
    font-size 14px

  &__subHeader
    padding-bottom $m7
    font-h1()
    font-size 18px

.thanksTo
  color var(--c-font-2)
  font-size 14px

.appVersion
  padding-top $m10
  color var(--c-font-3)
  font-size 10px
</style>
