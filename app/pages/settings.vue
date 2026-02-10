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
      <div class="grid gap-8 pt-2 @3xl/main:max-w-md">
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
          <div class="text-alert-1 pb-4 text-xs leading-none">
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
          <div class="text-muted pt-4 text-xs">
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
