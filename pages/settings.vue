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
  .mb-6.py-6.px-3.text-skin-item-base-up.text-2xl.leading-none.font-nunito.font-semibold
    | {{ $t('settings.title') }}

  .pb-12.px-3.grid.gap-y-1.gap-x-6.md_grid-cols-2.md_gap-x-12
    div
      //- Currency
      .pb-12
        .pb-3.text-skin-item-base.text-lg.leading-none.font-nunito.font-semibold
          | {{ $t('currency.title') }}
        .pb-4.text-skin-item-base-down.text-xs.leading-1 {{ $t('currency.descBase') }}

        SharedButton._bdb(
          :title="currencies.find(c => c.code === $store.state.currencies.base).name"
          isShowDots
          @onClick="$store.commit('currencies/showBaseCurrenciesModal')"
        )

      .pb-12
        //- Locale
        .pb-3.text-skin-item-base.text-lg.leading-none.font-nunito.font-semibold
          | {{ $t('settings.app') }}
        .pb-4
          LangDropdown

        //- Theme
        SharedButton._bdb(
          icon="mdi mdi-palette"
          :title="$t('theme.change')"
          @onClick="$store.dispatch('ui/changeTheme')"
        )

      //- User
      .pb-12(v-if="user")
        .pb-3.text-skin-item-base.text-lg.leading-none.font-nunito.font-semibold
          | {{ $t('user') }}
        .pb-3.text-neutral-400
          .text-lg {{ user.displayName }}
          .text-sm {{ user.email }}

        SharedButton._bdb(
          :title="$t('userLogout')"
          icon="mdi mdi-logout"
          @onClick="$store.dispatch('user/signOut')"
        )

      .pb-12
        .pb-3.text-skin-item-base.text-lg.leading-none.font-nunito.font-semibold
          | {{ $t('settings.caution') }}
        .pb-4.text-skin-item-base-down.text-xs.leading-1 {{ $t('alerts.willDeleteEverything') }}

        //- Delete
        .pb-4
          SharedButton._bdb(
            :title="$t('settings.deleteButton')"
            icon="mdi mdi-delete-empty-outline"
            @onClick="confirmRemoveUserData = true"
          )

    //- About
    .pb-12.md_justify-self-end
      About
      .pt-4.text-skin-item-base-down.text-xs {{ $t('app.version') }} {{ version }}

  ModalBottomConfirm(
    :description="$t('alerts.willDeleteEverything')"
    :show="confirmRemoveUserData"
    @onClose="confirmRemoveUserData = false"
    @onConfirm="removeUserData"
  )
</template>

<i18n lang="json5">
{
  "en": {
    "user": "User",
    "currency": {
      "descBase": "Transactions in different currencies will be converted to this currency."
    }
  },

  "ru": {
    "user": "Пользователь",
    "currency": {
      "descBase": "Основная валюта, в которую будут конвертироваться транзакции в других валютах."
    }
  }
}
</i18n>
