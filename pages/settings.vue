<script setup lang="ts">
import { currencies, useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useUserStore } from '~/components/user/useUser'
import pkg from '~/package.json'

const { $i18n } = useNuxtApp()
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const userStore = useUserStore()
const currenciesStore = useCurrenciesStore()

useSeoMeta({
  title: $i18n.t('settings.title'),
})

const version = pkg.version

/**
 * Remove user date
 */
const confirmRemoveUserData = ref(false)

function removeUserData() {
  confirmRemoveUserData.value = false
  userStore.removeUserData()

  if (route.name !== 'welcome')
    router.push('/welcome')
}
</script>

<template>
  <UiPage>
    <UiHeader>
      <UiHeaderTitle>{{ $t("settings.title") }}</UiHeaderTitle>
    </UiHeader>

    <div
      class="grid gap-x-6 gap-y-1 px-3 pb-12 pt-4 md_grid-cols-2 md_gap-x-12"
    >
      <div>
        <!-- Currency -->
        <div class="pb-12">
          <UiTitle>{{ $t("currency.title") }}</UiTitle>
          <div class="leading-1 pb-4 text-xs text-item-2">
            {{ t("currency.descBase") }}
          </div>
          <UiButtonSecond
            :title="
              currencies.find((c) => c.code === currenciesStore.base).name
            "
            isShowDots
            @click="currenciesStore.showBaseCurrenciesModal()"
          />
        </div>

        <!-- Locale -->
        <div class="pb-12">
          <div class="grid gap-3">
            <UiTitle class="pb-2">
              {{ $t("settings.lang") }}
            </UiTitle>
            <AppLocaleSwitcher />
          </div>
        </div>

        <!-- Theme -->
        <div class="pb-12">
          <UiTitle class="pb-2">
            {{ $t("theme.title") }}
          </UiTitle>
          <AppThemeSwitcher />
        </div>

        <!-- User -->
        <div class="pb-12">
          <UiTitle class="pb-2">
            {{ t("user") }}
          </UiTitle>
          <div class="pb-4 text-item-2">
            {{ userStore.user?.email }}
          </div>
          <UiButtonSecond
            :title="$t('userLogout')"
            icon="mdi mdi-logout"
            @click="userStore.signOut()"
          />
        </div>

        <!-- Delete -->
        <div class="pb-12">
          <UiTitle class="pb-2">
            {{ $t("settings.caution") }}
          </UiTitle>
          <div class="leading-1 pb-4 text-xs text-item-2">
            {{ $t("alerts.willDeleteEverything") }}
          </div>
          <div class="pb-4">
            <UiButtonSecond
              :title="$t('settings.deleteButton')"
              icon="mdi mdi-delete-empty-outline"
              @click="confirmRemoveUserData = true"
            />
          </div>
        </div>
      </div>

      <!-- About -->
      <div class="pb-12 md_justify-self-end">
        {{ t("app.about") }}
        <div class="pt-4 text-xs text-item-2">
          {{ t("app.version") }} {{ version }}
        </div>
      </div>
    </div>

    <ModalBottomConfirm
      :description="$t('alerts.willDeleteEverything')"
      :show="confirmRemoveUserData"
      @closed="confirmRemoveUserData = false"
      @onConfirm="removeUserData"
    />
  </UiPage>
</template>

<i18n lang="yaml">
en:
  app:
    about: About
    version: 'Version'

  user: User
  currency:
    descBase: Transactions in different currencies will be converted to this currency.

ru:
  app:
    about: О приложении
    version: 'Версия'

  user: Пользователь
  currency:
    descBase: "Основная валюта, в которую будут конвертироваться транзакции в других валютах."
</i18n>
