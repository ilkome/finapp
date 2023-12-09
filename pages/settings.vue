<script setup lang="ts">
import pkg from '~/package.json'
import { currencies } from '~/components/currencies/currencies'

const { $store } = useNuxtApp()
const route = useRoute()
const router = useRouter()

const version = pkg.version

/**
 * Remove user date
 */
const confirmRemoveUserData = ref(false)
function removeUserData() {
  confirmRemoveUserData.value = false
  $store.dispatch('user/removeUserData')

  if (route.name !== 'welcome')
    router.push('/welcome')
}

const user = computed(() => $store.state.user?.user)
</script>

<script lang="ts">
export default defineComponent({
  head() {
    return {
      title: this.$t('settings.title'),
    }
  },
})
</script>

<template lang="pug">
UiPage
  UiHeader
    UiHeaderTitle {{ $t('settings.title') }}

  .pt-4.pb-12.px-3.grid.gap-y-1.gap-x-6.md_grid-cols-2.md_gap-x-12
    div
      //- Currency
      .pb-12
        UiTitle {{ $t('currency.title') }}
        .pb-4.text-item-base-down.text-xs.leading-1 {{ $t('currency.descBase') }}

        UiButtonSecond(
          :title="currencies.find(c => c.code === $store.state.currencies.base).name"
          isShowDots
          @click="$store.commit('currencies/showBaseCurrenciesModal')"
        )

      .pb-12
        //- Locale
        UiTitle.pb-2 {{ $t('settings.app') }}
        LangDropdown.pb-2

        UiButtonSecond(
          :title="$t('theme.change')"
          icon="mdi mdi-palette"
          @click="$store.dispatch('ui/changeTheme')"
        )

      //- User
      .pb-12(v-if="user")
        UiTitle.pb-2 {{ $t('user') }}
        .pb-3.text-item-base-down
          .text-lg {{ user.displayName }}
          .text-sm {{ user.email }}

        UiButtonSecond(
          :title="$t('userLogout')"
          icon="mdi mdi-logout"
          @click="$store.dispatch('user/signOut')"
        )

      //- Delete
      .pb-12
        UiTitle.pb-2 {{ $t('settings.caution') }}
        .pb-4.text-item-base-down.text-xs.leading-1 {{ $t('alerts.willDeleteEverything') }}

        .pb-4
          UiButtonSecond(
            :title="$t('settings.deleteButton')"
            icon="mdi mdi-delete-empty-outline"
            @click="confirmRemoveUserData = true"
          )

    //- About
    .pb-12.md_justify-self-end
      About
      .pt-4.text-item-base-down.text-xs {{ $t('app.version') }} {{ version }}

  ModalBottomConfirm(
    :description="$t('alerts.willDeleteEverything')"
    :show="confirmRemoveUserData"
    @closed="confirmRemoveUserData = false"
    @onConfirm="removeUserData"
  )
</template>

<i18n lang="yaml">
en:
  user: User
  currency:
    descBase: Transactions in different currencies will be converted to this currency.

ru:
  user: Пользователь
  currency:
    descBase: 'Основная валюта, в которую будут конвертироваться транзакции в других валютах.'
</i18n>
