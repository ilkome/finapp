<script>
import pkg from '~/package'

export default {
  name: 'SettingsPage',

  data() {
    return {
      confirmCreateDemo: false,
      confirmRemoveUserData: false,
      version: pkg.version,
    }
  },

  head() {
    return {
      title: this.$t('settings.title'),
    }
  },

  methods: {
    removeUserData() {
      this.confirmRemoveUserData = false
      this.$store.dispatch('user/removeUserData')

      if (this.$route.name !== 'welcome')
        this.$router.push('/welcome')
    },
  },
}
</script>

<template lang="pug">
.h-full.overflow.overflow-x-auto
  .py-6.px-3.font-nunito.text-neutral-800.dark_text-white.text-2xl.leading-none.font-semibold
    | {{ $t('settings.title') }}

  .settings.px-3.pt-5
    .settings__column
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
            :title="$t('currency.selectBaseTitle')"
            icon="mdi mdi-currency-usd"
            @onClick="$store.commit('currencies/showBaseCurrenciesModal')"
          )

      .settings__group
        .settings__subHeader {{ $t('user') }}
        .pb-3.text-neutral-400
          .text-lg {{ $store.state.user.user.displayName }}
          .text-sm {{ $store.state.user.user.email }}

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

    .settings__column
      .settings__group
        About
        .appVersion {{ $t('app.version') }} {{ version }}

  ModalBottomConfirm(
    :description="$t('alerts.willDeleteEverything')"
    :show="confirmRemoveUserData"
    @onClose="confirmRemoveUserData = false"
    @onConfirm="removeUserData"
  )
</template>

<style lang="stylus" scoped>
.settings
  width 100%
  flex-grow 1
  max-width 660px

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

.appVersion
  padding-top $m10
  color var(--c-font-3)
  font-size 10px
</style>

<i18n lang="json5">
{
  "en": {
    "user": "User"
  },

  "ru": {
    "user": "Пользователь"
  }
}
</i18n>
