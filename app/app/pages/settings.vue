<script setup lang="ts">
import pkg from '~~/package.json'

import type { LocaleSlug } from '~/components/locale/types'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useDemo } from '~/components/demo/useDemo'
import { useUserStore } from '~/components/user/useUserStore'
import { featureIds, useFeatures } from '~/composables/useFeatures'
import { showSuccessToast } from '~/composables/useStoreSync'

const LINKS = [
  { href: 'https://github.com/ilkome/finapp', icon: 'mdi:github', labelKey: 'settings.github' },
  { href: 'https://finapp-docs.ilko.me/', icon: 'lucide:book-open', labelKey: 'login.menu.documentation' },
]

const { locale, t } = useI18n()
const userStore = useUserStore()
const currenciesStore = useCurrenciesStore()
const { generateDemoData } = useDemo()
const { isDemo } = useDemo()
const features = useFeatures()
const isShowBaseCurrencyModal = ref(false)

useSeoMeta({
  ogTitle: t('settings.title'),
  title: t('settings.title'),
})

const confirmRemoveUserData = ref(false)
const route = useRoute()
const router = useRouter()

const sections = ['general', 'appearance', 'account', 'beta', 'about'] as const
type Section = typeof sections[number]

// In the query, so a reload or a shared link reopens the same section.
const activeSection = computed<Section>({
  get: () => sections.find(id => id === route.query.tab) ?? 'general',
  set: tab => router.replace({ query: { ...route.query, tab } }),
})

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

    <div class="page-wrapper">
      <div class="grid gap-4 px-2 pt-2 pb-12 @2xl/page:grid-cols-[12rem_minmax(0,32rem)] @2xl/page:gap-8">
        <nav
          :aria-label="t('settings.title')"
          class="-mx-2 scroll-strip flex snap-x snap-mandatory scroll-px-2 gap-1 overflow-x-auto px-2 @2xl/page:mx-0 @2xl/page:flex-col @2xl/page:self-start @2xl/page:overflow-visible @2xl/page:px-0"
        >
          <button
            v-for="id in sections"
            :key="id"
            :aria-current="activeSection === id ? 'page' : undefined"
            :class="cn(
              'shrink-0 snap-start theme-rounded-control border border-transparent px-3 py-1.5 text-left text-sm text-muted transition-colors hover:text-highlighted',
              activeSection === id && 'border-accented text-highlighted',
            )"
            type="button"
            @click="activeSection = id"
          >
            {{ t(`settings.sections.${id}`) }}
          </button>
        </nav>

        <div class="grid content-start gap-4">
          <template v-if="activeSection === 'general'">
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
                class="group relative inline-flex min-h-10.5 min-w-40 items-center gap-2 rounded-md bg-elevated/30 px-4 py-2 pe-10 text-sm text-highlighted ring ring-accented transition-colors ring-inset hover:bg-elevated/50! focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                @click="isShowBaseCurrencyModal = true"
              >
                <span class="truncate">{{ currenciesStore.base }}</span>
                <span class="absolute inset-y-0 inset-e-0 flex items-center pe-3">
                  <UIcon name="i-lucide-chevrons-up-down" class="size-5 shrink-0 text-dimmed" />
                </span>
              </button>
            </UiSettingsCard>

            <!-- Notifications -->
            <NotificationsSettings />

            <!-- Extension point for layers (e.g. premium Telegram card) -->
            <ExtensionSlot name="settings" />
          </template>

          <ThemePicker v-else-if="activeSection === 'appearance'" />

          <template v-else-if="activeSection === 'account'">
            <!-- User -->
            <UiSettingsCard
              danger
              :title="t('user.title')"
            >
              <UserViewLogout isShowSignOut />
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
          </template>

          <!-- Features in development -->
          <UiSettingsCard
            v-else-if="activeSection === 'beta'"
            :title="t('settings.features.title')"
            :description="t('settings.features.description')"
          >
            <UiSwitchItem
              v-for="id in featureIds"
              :key="id"
              :checkboxValue="features[id]"
              :title="t(`settings.features.${id}`)"
              @click="features[id] = !features[id]"
            />
          </UiSettingsCard>

          <template v-else>
            <UiSettingsCard :title="t('settings.links')">
              <div class="flex flex-wrap gap-2">
                <UButton
                  v-for="link in LINKS"
                  :key="link.href"
                  :href="link.href"
                  :icon="link.icon"
                  :label="t(link.labelKey)"
                  color="neutral"
                  rel="noopener"
                  size="md"
                  target="_blank"
                  trailingIcon="lucide:external-link"
                  variant="outline"
                />
              </div>
            </UiSettingsCard>

            <div class="text-xs text-muted">
              {{ t('app.version') }} {{ pkg.version }}
            </div>
          </template>
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
