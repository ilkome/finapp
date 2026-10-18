<script setup lang="ts">
import Swiper from 'swiper'
import pkg from '~~/package.json'
import 'swiper/css'

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

type Section = 'general' | 'appearance' | 'sidebar' | 'account' | 'beta' | 'about'

const SECTION_ICONS: Record<Section, string> = {
  about: 'lucide:info',
  account: 'lucide:user',
  appearance: 'lucide:palette',
  beta: 'lucide:flask-conical',
  general: 'lucide:settings',
  sidebar: 'lucide:panel-left',
}

const { locale, t } = useI18n()
const userStore = useUserStore()
const currenciesStore = useCurrenciesStore()
const { generateDemoData, isDemo } = useDemo()
const features = useFeatures()
const isLaptop = useIsLaptop()
const isShowBaseCurrencyModal = ref(false)

useSeoMeta({
  ogTitle: t('settings.title'),
  title: t('settings.title'),
})

const confirm = useConfirm()
const route = useRoute()
const router = useRouter()

// Beta disappears with the last flag instead of showing an empty card.
// The sidebar exists only on the laptop layout.
const sections = computed<Section[]>(() => [
  'general',
  'appearance',
  ...(isLaptop.value ? ['sidebar' as const] : []),
  'account',
  ...(featureIds.length ? ['beta' as const] : []),
  'about',
])

// In the query, so a reload or a shared link reopens the same section.
const activeSection = computed<Section>({
  get: () => sections.value.find(id => id === route.query.tab) ?? 'general',
  set: tab => router.replace({ query: { ...route.query, tab } }),
})

// Phones get every section as a slide; the laptop shows only the picked one beside its nav.
const renderedSections = computed(() => isLaptop.value ? [activeSection.value] : sections.value)

const sliderRef = useTemplateRef<HTMLElement>('sliderRef')
// shallowRef: a deep-reactive proxy breaks Swiper's internal state (see useSwiperTabs).
const slider = shallowRef<Swiper | null>(null)

watch(sliderRef, (el) => {
  slider.value?.destroy(true, true)
  slider.value = el
    ? new Swiper(el, {
        // The page scrolls, so its length follows the shown slide, not the tallest one.
        autoHeight: true,
        initialSlide: sections.value.indexOf(activeSection.value),
        longSwipesMs: 60,
        longSwipesRatio: 0.1,
        on: { slideChange: sw => activeSection.value = sections.value[sw.activeIndex] ?? 'general' },
        shortSwipes: false,
      })
    : null
}, { flush: 'post' })

const tabsRef = useTemplateRef<HTMLElement>('tabsRef')

// Centers the active tab in the strip; scrollIntoView would also scroll the page.
function scrollTabIntoView() {
  const strip = tabsRef.value
  const tab = strip?.querySelector<HTMLElement>('[aria-current="page"]')
  if (strip && tab)
    strip.scrollTo({ behavior: 'smooth', left: tab.offsetLeft - (strip.clientWidth - tab.clientWidth) / 2 })
}

watch(activeSection, (id) => {
  const idx = sections.value.indexOf(id)
  if (slider.value && slider.value.activeIndex !== idx)
    slider.value.slideTo(idx)
  nextTick(scrollTabIntoView)
})

onMounted(scrollTabIntoView)
onBeforeUnmount(() => slider.value?.destroy(true, true))

async function removeAllUserData() {
  if (!await confirm.ask({ description: t('alerts.willDeleteEverything'), title: t('settings.deleteButton') }))
    return
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
  <UiPage :class="!isLaptop && 'flex min-h-[calc(100dvh-64px-env(safe-area-inset-bottom))] flex-col'">
    <!-- Phones: the slider fills at least the height between the header and the bottom menu, so a swipe works on empty space
         too; the page itself scrolls, so content passes under the blurred header and menu. -->
    <UiHeader>
      <UiHeaderTitle>{{ t('settings.title') }}</UiHeaderTitle>

      <template v-if="!isLaptop" #selected>
        <nav
          ref="tabsRef"
          :aria-label="t('settings.title')"
          class="-mx-2 scroll-strip flex gap-2 overflow-x-auto px-2 pt-1 pb-2"
        >
          <button
            v-for="id in sections"
            :key="id"
            :aria-current="activeSection === id ? 'page' : undefined"
            :class="cn(
              'flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm ring transition-colors ring-inset',
              activeSection === id
                ? 'bg-primary/10 text-primary ring-transparent'
                : 'bg-elevated/30 text-muted ring-accented',
            )"
            type="button"
            @click="activeSection = id"
          >
            <Icon :name="SECTION_ICONS[id]" size="18" />
            {{ t(`settings.sections.${id}`) }}
          </button>
        </nav>
      </template>
    </UiHeader>

    <div
      v-if="!isLaptop"
      ref="sliderRef"
      class="swiper min-h-0 w-full flex-1"
    >
      <div class="swiper-wrapper">
        <div
          v-for="id in renderedSections"
          :key="id"
          class="swiper-slide px-2 pt-2 pb-12"
        >
          <div class="grid content-start gap-8">
            <template v-if="id === 'general'">
              <!-- Language -->
              <UiSettingsCard :title="t('locale.title')">
                <UiOptionGrid
                  :items="[
                    { label: t('locale.ru'), value: 'ru' },
                    { label: t('locale.en'), value: 'en' },
                  ]"
                  :modelValue="locale"
                  @update:modelValue="(loc: string) => userStore.saveUserLocale(loc as LocaleSlug)"
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
            </template>

            <ThemePicker v-else-if="id === 'appearance'" />

            <div v-else-if="id === 'sidebar'" class="grid gap-8">
              <LayoutSidebarListPicker kind="wallet" />
              <LayoutSidebarListPicker kind="category" />
            </div>

            <template v-else-if="id === 'account'">
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
                  class="min-h-10.5 rounded-md px-4"
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
                    class="min-h-10.5 rounded-md px-4"
                    variant="soft"
                    color="error"
                    size="md"
                    @click="removeAllUserData"
                  >
                    {{ t('settings.deleteButton') }}
                  </UButton>
                </template>
              </UiSettingsCard>
            </template>

            <!-- Features in development -->
            <UiSettingsCard
              v-else-if="id === 'beta'"
              :title="t('settings.features.title')"
              :description="t('settings.features.description')"
            >
              <UiSwitchItem
                v-for="featureId in featureIds"
                :key="featureId"
                class="min-h-10.5 rounded-md!"
                :checkboxValue="features[featureId]"
                :title="t(`settings.features.${featureId}`)"
                @toggle="features[featureId] = !features[featureId]"
              />
            </UiSettingsCard>

            <template v-else>
              <UiSettingsCard :title="t('settings.links')">
                <div class="flex flex-wrap gap-2">
                  <UButton
                    v-for="link in LINKS"
                    :key="link.href"
                    class="min-h-10.5 rounded-md px-4"
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
    </div>

    <div v-else class="grow px-2 lg:px-4 2xl:px-8">
      <!-- Color swatches use the full width; other sections keep a readable column. -->
      <div
        :class="activeSection === 'appearance' ? '@2xl/page:grid-cols-[12rem_minmax(0,1fr)]' : '@2xl/page:grid-cols-[12rem_minmax(0,32rem)]'"
        class="grid gap-4 pt-2 pb-12 @2xl/page:gap-8"
      >
        <nav
          :aria-label="t('settings.title')"
          class="-mx-2 scroll-strip flex snap-x snap-mandatory scroll-px-2 gap-1 overflow-x-auto px-2 @2xl/page:mr-0 @2xl/page:-ml-2 @2xl/page:flex-col @2xl/page:self-start @2xl/page:overflow-visible @2xl/page:px-0"
        >
          <button
            v-for="id in sections"
            :key="id"
            :aria-current="activeSection === id ? 'page' : undefined"
            :class="cn(
              'flex min-h-11 shrink-0 snap-start items-center gap-3 rounded-md interactive px-2 py-1.5 text-left text-muted md:min-h-9.5',
              activeSection === id && 'text-primary',
            )"
            type="button"
            @click="activeSection = id"
          >
            <span class="flex min-w-8 items-center justify-center">
              <Icon :name="SECTION_ICONS[id]" size="22" />
            </span>
            <UiText variant="navigation">
              {{ t(`settings.sections.${id}`) }}
            </UiText>
          </button>
        </nav>

        <div
          v-for="id in renderedSections"
          :key="id"
          class="grid content-start gap-8"
        >
          <template v-if="id === 'general'">
            <!-- Language -->
            <UiSettingsCard :title="t('locale.title')">
              <UiOptionGrid
                :items="[
                  { label: t('locale.ru'), value: 'ru' },
                  { label: t('locale.en'), value: 'en' },
                ]"
                :modelValue="locale"
                @update:modelValue="(loc: string) => userStore.saveUserLocale(loc as LocaleSlug)"
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
          </template>

          <ThemePicker v-else-if="id === 'appearance'" />

          <div v-else-if="id === 'sidebar'" class="grid gap-8">
            <LayoutSidebarListPicker kind="wallet" />
            <LayoutSidebarListPicker kind="category" />
          </div>

          <template v-else-if="id === 'account'">
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
                class="min-h-10.5 rounded-md px-4"
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
                  class="min-h-10.5 rounded-md px-4"
                  variant="soft"
                  color="error"
                  size="md"
                  @click="removeAllUserData"
                >
                  {{ t('settings.deleteButton') }}
                </UButton>
              </template>
            </UiSettingsCard>
          </template>

          <!-- Features in development -->
          <UiSettingsCard
            v-else-if="id === 'beta'"
            :title="t('settings.features.title')"
            :description="t('settings.features.description')"
          >
            <UiSwitchItem
              v-for="featureId in featureIds"
              :key="featureId"
              class="min-h-10.5 rounded-md!"
              :checkboxValue="features[featureId]"
              :title="t(`settings.features.${featureId}`)"
              @toggle="features[featureId] = !features[featureId]"
            />
          </UiSettingsCard>

          <template v-else>
            <UiSettingsCard :title="t('settings.links')">
              <div class="flex flex-wrap gap-2">
                <UButton
                  v-for="link in LINKS"
                  :key="link.href"
                  class="min-h-10.5 rounded-md px-4"
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

    <CurrenciesModal
      v-if="isShowBaseCurrencyModal"
      :activeCode="currenciesStore.base"
      @select="userStore.saveUserBaseCurrency"
      @close="isShowBaseCurrencyModal = false"
    />
  </UiPage>
</template>
