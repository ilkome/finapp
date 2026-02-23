<script setup lang="ts">
import pkg from '~~/package.json'

import type { LocaleSlug } from '~/components/locale/types'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useDemo } from '~/components/demo/useDemo'
import { useUserStore } from '~/components/user/useUserStore'
import { showSuccessToast } from '~/composables/useStoreSync'

const { locale, t } = useI18n()
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
const router = useRouter()

function removeAllUserData() {
  confirmRemoveUserData.value = false
  userStore.removeAllUserData()
  showSuccessToast('alerts.removedUserData')
  router.replace('/dashboard')
}

function onGenerateDemoData() {
  generateDemoData(locale.value)
  showSuccessToast('demo.updated')
}
</script>

<template>
  <UiPage>
    <UiHeader>
      <UiHeaderTitle>{{ t('settings.title') }}</UiHeaderTitle>
    </UiHeader>

    <div class="pageWrapper">
      <div class="grid gap-4 pt-2 pb-12 @3xl/main:max-w-lg">
        <!-- Theme -->
        <ThemePicker inline />

        <!-- Language -->
        <UiSettingsCard :title="t('locale.title')">
          <FormSelect
            :options="[
              { label: t('locale.ru'), value: 'ru' },
              { label: t('locale.en'), value: 'en' },
            ]"
            :value="locale"
            @change="(loc: string) => userStore.saveUserLocale(loc as LocaleSlug)"
          />
        </UiSettingsCard>

        <!-- Currency -->
        <UiSettingsCard :title="t('currencies.base')">
          <button
            class="bg-item-3 block min-h-[42px] w-full cursor-pointer items-center overflow-hidden rounded-md border border-transparent px-4 py-2 pr-10 text-left outline-none hover:bg-(--item-5) focus:border-(--ui-primary)"
            style="appearance: none; background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM4MDgwODAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb25zLXVwLWRvd24iPjxwYXRoIGQ9Im03IDE1IDUgNSA1LTUiLz48cGF0aCBkPSJtNyA5IDUtNSA1IDUiLz48L3N2Zz4='); background-position: right 0.7rem center; background-repeat: no-repeat; background-size: 1.25em 1.25em;"
            @click="isShowBaseCurrencyModal = true"
          >
            {{ currenciesStore.base }}
          </button>
        </UiSettingsCard>

        <!-- Demo -->
        <UiSettingsCard
          v-if="isDemo"
          :title="t('demo.update')"
        >
          <template #content>
            <UButton
              variant="outline"
              color="secondary"
              size="md"
              @click="onGenerateDemoData"
            >
              {{ t('demo.update') }}
            </UButton>
          </template>
        </UiSettingsCard>

        <!-- Delete -->
        <UiSettingsCard
          danger
          :title="t('settings.deleteButton')"
          :description="t('alerts.willDeleteEverything')"
        >
          <template #footer>
            <UButton
              variant="soft"
              color="error"
              size="md"
              @click="confirmRemoveUserData = true"
            >
              {{ t('settings.deleteButton') }}
            </UButton>
          </template>
        </UiSettingsCard>

        <!-- User -->
        <div class="py-4">
          <UserViewLogout isShowSignOut />
        </div>

        <!-- About -->
        <div class="text-muted pt-4 text-xs">
          {{ t('app.version') }} {{ version }}
        </div>
      </div>
    </div>

    <LayoutConfirmModal
      v-if="confirmRemoveUserData"
      :title="t('settings.deleteButton')"
      :description="t('alerts.willDeleteEverything')"
      @closed="confirmRemoveUserData = false"
      @confirm="removeAllUserData"
    />

    <CurrenciesModal
      v-if="isShowBaseCurrencyModal"
      :activeCode="currenciesStore.base"
      @select="userStore.saveUserBaseCurrency"
      @close="isShowBaseCurrencyModal = false"
    />
  </UiPage>
</template>
