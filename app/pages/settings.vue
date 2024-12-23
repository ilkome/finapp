<script setup lang="ts">
import pkg from '~~/package.json'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useDemo } from '~/components/demo/useDemo'
import { useUserStore } from '~/components/user/useUserStore'

const { $toast } = useNuxtApp()
const { t } = useI18n()
const userStore = useUserStore()
const currenciesStore = useCurrenciesStore()
const { generateDemoData } = useDemo()
const { isDemo } = useDemo()
const isShowBaseCurrencyModal = ref(false)

useSeoMeta({
  ogTitle: t('settings.title'),
  title: t('settings.title'),
})

const version = pkg.version

const confirmRemoveUserData = ref(false)
function removeUserData() {
  confirmRemoveUserData.value = false
  userStore.removeUserData()
  $toast.success(t('alerts.removedUserData'))
}

function onGenerateDemoData() {
  generateDemoData()
  $toast.success(t('demo.updated'))
}
</script>

<template>
  <UiPage>
    <UiHeader>
      <UiHeaderTitle>{{ t("settings.title") }}</UiHeaderTitle>
    </UiHeader>

    <div class="pageWrapper pt-4">
      <div>
        <!-- Locale -->
        <div class="pb-12">
          <div class="grid gap-3">
            <UiTitle3 class="pb-2">
              {{ t("settings.lang") }}
            </UiTitle3>
            <AppLocaleSwitcher />
          </div>
        </div>

        <!-- Theme -->
        <div class="pb-12">
          <UiTitle3 class="pb-2">
            {{ t("theme.title") }}
          </UiTitle3>
          <AppThemeSwitcher
            isShowSystem
            component="UiTabs3"
          />
        </div>

        <!-- Currency -->
        <div class="pb-12">
          <UiItem2 @click="isShowBaseCurrencyModal = true">
            <template #label>
              {{ t('currencies.base') }}
            </template>

            <template #value>
              {{ currenciesStore.base }}
            </template>
          </UiItem2>
        </div>

        <!-- User -->
        <div class="pb-12">
          <UiTitle3 class="pb-2">
            {{ t("user") }}
          </UiTitle3>
          <div
            v-if="userStore.user"
            class="text-item-2 pb-4"
          >
            {{ userStore.user?.email }}
          </div>
          <UiBox1
            class="!flex gap-2"
            @click="userStore.signOut"
          >
            <Icon name="lucide:log-out" />
            <div>{{ t('userLogout') }}</div>
          </UiBox1>
        </div>

        <!-- Delete -->
        <div class="pb-12">
          <UiTitle3 class="pb-2">
            {{ t("settings.caution") }}
          </UiTitle3>
          <div class="leading-1 text-item-2 pb-4 text-xs">
            {{ t("alerts.willDeleteEverything") }}
          </div>
          <div class="grid gap-3 pb-4">
            <UiBox1
              v-if="isDemo"
              class="!flex gap-2"
              @click="onGenerateDemoData"
            >
              <Icon name="lucide:database-backup" />
              <div>{{ t('demo.update') }}</div>
            </UiBox1>

            <UiBox1
              class="!flex gap-2"
              @click="confirmRemoveUserData = true"
            >
              <Icon name="lucide:trash" />
              <div>{{ t('settings.deleteButton') }}</div>
            </UiBox1>
          </div>
        </div>
      </div>

      <!-- About -->
      <div class="pb-12">
        {{ t("app.about") }}
        <div class="text-item-2 pt-4 text-xs">
          {{ t("app.version") }} {{ version }}
        </div>
      </div>
    </div>

    <LayoutConfirmModal
      v-if="confirmRemoveUserData"
      :description="t('alerts.willDeleteEverything')"
      @closed="confirmRemoveUserData = false"
      @onConfirm="removeUserData"
    />

    <CurrenciesModal
      v-if="isShowBaseCurrencyModal"
      :activeCode="currenciesStore.base"
      @onSelect="currenciesStore.setBase"
      @onClose="isShowBaseCurrencyModal = false"
    />
  </UiPage>
</template>

<i18n lang="yaml">
en:
  app:
    about: About
    version: 'Version'
  user: User
  currencyDesc: Transactions in different currencies will be converted to this currency.

ru:
  app:
    about: О приложении
    version: 'Версия'
  user: Пользователь
  currencyDesc: "Основная валюта, в которую будут конвертироваться транзакции в других валютах."
</i18n>
