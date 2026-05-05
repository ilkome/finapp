<script setup lang="ts">
import { useStorage } from '@vueuse/core'
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
const isShowMenuLabels = useStorage('finapp.isShowMenuLabels', true)

useSeoMeta({
  ogTitle: t('settings.title'),
  title: t('settings.title'),
})

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
      <div class="grid gap-4 px-2 pt-2 pb-12 @3xl/main:max-w-lg">
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

        <!-- Menu labels -->
        <UiSettingsCard :title="t('settings.mobileMenu')" class="md:hidden">
          <UiSwitchItem
            :checkboxValue="isShowMenuLabels"
            :title="t('settings.menuLabels')"
            @click="isShowMenuLabels = !isShowMenuLabels"
          />
        </UiSettingsCard>

        <!-- Currency -->
        <UiSettingsCard :title="t('currencies.base')">
          <button
            class="text-highlighted bg-elevated/30 ring-accented hover:!bg-elevated/50 focus-visible:ring-primary group relative inline-flex min-h-[42px] min-w-[160px] cursor-pointer items-center gap-2 rounded-md px-4 py-2 pe-10 text-sm ring transition-colors ring-inset focus:outline-none focus-visible:ring-2 focus-visible:ring-inset"
            @click="isShowBaseCurrencyModal = true"
          >
            <span class="truncate">{{ currenciesStore.base }}</span>
            <span class="absolute inset-y-0 end-0 flex items-center pe-3">
              <UIcon name="i-lucide-chevrons-up-down" class="text-dimmed size-5 shrink-0" />
            </span>
          </button>
        </UiSettingsCard>

        <!-- Demo -->
        <UiSettingsCard
          v-if="isDemo"
          :title="t('demo.update')"
        >
          <UButton
            variant="outline"
            color="secondary"
            size="md"
            @click="onGenerateDemoData"
          >
            {{ t('demo.update') }}
          </UButton>
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
        <UiSettingsCard
          danger
          :title="t('user.title')"
        >
          <UserViewLogout isShowSignOut />
        </UiSettingsCard>

        <!-- About -->
        <div class="text-muted pt-4 text-xs">
          {{ t('app.version') }} {{ pkg.version }}
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
