<script setup lang="ts">
import pkg from '~~/package.json'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useDemo } from '~/components/demo/useDemo'
import { useUserStore } from '~/components/user/useUserStore'

const { locale, t } = useI18n()
const userStore = useUserStore()
const currenciesStore = useCurrenciesStore()
const { generateDemoData } = useDemo()
const { isDemo } = useDemo()
const isShowBaseCurrencyModal = ref(false)
const toast = useToast()

useSeoMeta({
  ogTitle: t('settings.title'),
  title: t('settings.title'),
})

const version = pkg.version

const confirmRemoveUserData = ref(false)
function removeUserData() {
  confirmRemoveUserData.value = false
  userStore.removeUserData()
  toast.add({ color: 'success', description: t('alerts.removedUserData') })
}

function onGenerateDemoData() {
  generateDemoData(locale.value)
  toast.add({ color: 'success', description: t('demo.updated') })
}
</script>

<template>
  <UiPage>
    <UiHeader>
      <UiHeaderTitle>{{ t('settings.title') }}</UiHeaderTitle>

      <div class="flex items-center gap-1">
        <ThemeSwitcher />
        <ThemePicker />
      </div>
    </UiHeader>

    <div class="pageWrapper">
      <div class="grid gap-8 @3xl/main:max-w-md pt-2">
        <!-- User -->
        <div class="pb-6">
          <UserViewLogout isShowSignOut />
        </div>

        <LocaleSwitcher isShowTitle />

        <!-- Currency -->
        <UiButtonWithRight
          isShowTitle
          @click="isShowBaseCurrencyModal = true"
        >
          <template #label>
            {{ t('currencies.base') }}
          </template>

          <template #value>
            {{ currenciesStore.base }}
          </template>
        </UiButtonWithRight>

        <!-- Delete -->
        <div class="py-8">
          <UiTitle3 class="pb-2">
            {{ t('settings.caution') }}
          </UiTitle3>
          <div class="pb-4 text-xs leading-none text-alert-1">
            {{ t('alerts.willDeleteEverything') }}
          </div>

          <div class="grid gap-2 pb-4">
            <UiElement
              v-if="isDemo"
              class="group"
              insideClasses="min-h-[44px] bg-item-3 max-w-lg"
              @click="onGenerateDemoData"
            >
              <template #leftIcon>
                <Icon name="lucide:database-backup" size="20" />
              </template>
              <div>{{ t('demo.update') }}</div>
            </UiElement>

            <UiElement
              class="group"
              insideClasses="min-h-[44px] bg-item-3 max-w-lg"
              @click="confirmRemoveUserData = true"
            >
              <template #leftIcon>
                <Icon name="lucide:trash" size="20" />
              </template>
              <div>{{ t('settings.deleteButton') }}</div>
            </UiElement>
          </div>
        </div>

        <!-- About -->
        <div class="pb-12">
          {{ t('app.about') }}
          <div class="pt-4 text-xs text-muted">
            {{ t('app.version') }} {{ version }}
            <!-- <About /> -->
          </div>
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
      @onSelect="currenciesStore.updateBase"
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
