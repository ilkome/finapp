<script setup lang="ts">
import { AnimatePresence, Motion } from 'motion-v'

import type { LocaleSlug } from '~/components/locale/types'

import { useDemo } from '~/components/demo/useDemo'
import { useTheme } from '~/components/theme/useTheme'
import { useThemeOptions } from '~/components/theme/useThemeOptions'
import { useUserStore } from '~/components/user/useUserStore'

type Panel = 'appearance' | 'locale' | 'neutral' | 'primary' | 'radius' | 'theme'

// Session actions (enable demo / sign out) are only meaningful for an authenticated
// user mid-onboarding; the login page renders this menu without them.
const { sessionActions = false } = defineProps<{ sessionActions?: boolean }>()

const PANEL_CHILDREN: Partial<Record<'root' | Panel, Panel[]>> = {
  appearance: ['primary', 'neutral', 'radius'],
  root: ['locale', 'theme', 'appearance'],
}

const GITHUB_URL = 'https://github.com/ilkome/finapp'
const DOCS_URL = 'https://finapp-docs.ilko.me/'

const THEME_ICONS: Record<string, string> = {
  dark: 'i-lucide-moon',
  light: 'i-lucide-sun',
  system: 'i-lucide-monitor',
}

const { locale, t } = useI18n()
const router = useRouter()
const userStore = useUserStore()
const { generateDemoData, isDemo } = useDemo()
const { options: themeOptions, preference: themePreference, setTheme } = useTheme()
const { blackAsPrimary, neutral, primary, radius } = useThemeOptions()

async function enableDemo() {
  isDemo.value = 'true'
  await generateDemoData(locale.value)
  router.push('/dashboard')
}

const isOpen = ref(false)
const direction = ref<1 | -1>(1)

const panelStack = ref<Panel[]>([])
const activePanel = computed<'root' | Panel>(() => panelStack.value.at(-1) ?? 'root')

const localeOptions = computed(() => [
  { label: t('locale.ru'), value: 'ru' as LocaleSlug },
  { label: t('locale.en'), value: 'en' as LocaleSlug },
])

const localeLabel = computed(() => t(`locale.${locale.value}`))
const themeLabel = computed(() => themeOptions.find(o => o.value === themePreference.value)?.label ?? '')
const primaryLabel = computed(() => blackAsPrimary.value ? 'Black' : primary.value)

const panelMeta = computed<Record<Panel, { icon?: string, title: string, value?: string }>>(() => ({
  appearance: {
    icon: 'i-lucide-paintbrush',
    title: t('theme.title'),
  },
  locale: {
    icon: 'lucide:languages',
    title: t('locale.title'),
    value: localeLabel.value,
  },
  neutral: {
    icon: 'i-lucide-swatch-book',
    title: t('theme.picker.neutral'),
    value: neutral.value,
  },
  primary: {
    icon: 'i-lucide-palette',
    title: t('theme.picker.primary'),
    value: primaryLabel.value,
  },
  radius: {
    icon: 'i-lucide-square-round-corner',
    title: t('theme.picker.radius'),
    value: String(radius.value),
  },
  theme: {
    icon: THEME_ICONS[themePreference.value],
    title: t('theme.picker.theme'),
    value: themeLabel.value,
  },
}))

const panelTitle = computed(() =>
  activePanel.value === 'root' ? '' : panelMeta.value[activePanel.value].title,
)

const childRows = computed(() =>
  (PANEL_CHILDREN[activePanel.value] ?? []).map(id => ({ id, ...panelMeta.value[id] })),
)

function open(panel: Panel) {
  direction.value = 1
  panelStack.value = [...panelStack.value, panel]
}

function back() {
  direction.value = -1
  panelStack.value = panelStack.value.slice(0, -1)
}

// Reopen always lands on the root list, never a stale sub-panel.
function resetToRoot() {
  panelStack.value = []
  direction.value = 1
}

const SLIDE_DISTANCE = 8
const panelVariants = {
  center: { opacity: 1, x: 0 },
  enter: (dir: 1 | -1) => ({ opacity: 0, x: dir * SLIDE_DISTANCE }),
  exit: (dir: 1 | -1) => ({ opacity: 0, x: dir * -SLIDE_DISTANCE }),
}
const panelTransition = { duration: 0.12, ease: [0.4, 0, 0.2, 1] as const }

const rowClass = 'flex min-h-[44px] w-full items-center gap-3 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-elevated/50'
</script>

<template>
  <BottomSheetOrDropdown
    align="end"
    :isOpen="isOpen"
    @openModal="() => { resetToRoot(); isOpen = true }"
    @closeModal="isOpen = false"
  >
    <!-- On desktop BottomSheetOrDropdown drives UPopover's own open state and never
         emits openModal, so the reset has to hang off the trigger's click. A custom
         trigger must bind resetToRoot too, or reopening lands on a stale sub-panel. -->
    <template #trigger="{ isActive }">
      <slot name="trigger" :isActive :resetToRoot>
        <UButton
          :aria-label="t('login.menu.title')"
          :variant="isActive ? 'soft' : 'ghost'"
          class="text-muted max-md:border-default/80 max-md:bg-default/20 max-md:size-12 max-md:justify-center max-md:rounded-2xl max-md:border max-md:shadow-lg max-md:backdrop-blur-xl max-md:dark:bg-neutral-800/50"
          color="neutral"
          icon="i-lucide-menu"
          size="lg"
          square
          @click="resetToRoot"
        />
      </slot>
    </template>

    <template #content="{ close }">
      <div class="w-full overflow-hidden py-2 max-md:pt-6">
        <AnimatePresence :custom="direction" mode="wait" :initial="false">
          <Motion
            :key="activePanel"
            :custom="direction"
            :variants="panelVariants"
            initial="enter"
            animate="center"
            exit="exit"
            :transition="panelTransition"
          >
            <div v-if="childRows.length" class="grid gap-0.5">
              <div
                v-if="activePanel !== 'root'"
                :aria-label="t('base.previous')"
                role="button"
                tabindex="0"
                class="hover:bg-elevated/50 mb-1 flex items-center gap-2 rounded-sm p-2"
                @click="back"
                @keydown.enter.prevent="back"
                @keydown.space.prevent="back"
              >
                <UIcon name="lucide:chevron-left" class="text-muted size-5" />
                <span class="text-toned grow text-sm font-medium">{{ panelTitle }}</span>
              </div>

              <button
                v-for="row in childRows"
                :key="row.id"
                :class="rowClass"
                type="button"
                @click="open(row.id)"
              >
                <span class="flex min-w-7 justify-center">
                  <UIcon :name="row.icon" class="text-muted size-5" />
                </span>
                <span class="grow font-medium">{{ row.title }}</span>
                <span class="text-dimmed text-xs capitalize">{{ row.value }}</span>
                <UIcon name="lucide:chevron-right" class="text-muted size-4 shrink-0" />
              </button>

              <template v-if="activePanel === 'root' && sessionActions">
                <div aria-hidden="true" class="bg-elevated/50 mx-2 my-1 h-px" />

                <button
                  :class="rowClass"
                  type="button"
                  @click="() => { enableDemo(); close() }"
                >
                  <span class="flex min-w-7 justify-center">
                    <UIcon name="mdi:play-box-outline" class="text-muted size-5" />
                  </span>
                  <span class="grow font-medium">{{ t('login.openDemo') }}</span>
                </button>

                <button
                  :class="rowClass"
                  type="button"
                  @click="userStore.signOut()"
                >
                  <span class="flex min-w-7 justify-center">
                    <UIcon name="i-lucide-log-out" class="text-muted size-5" />
                  </span>
                  <span class="grow font-medium">{{ t('user.logout') }}</span>
                </button>
              </template>

              <template v-if="activePanel === 'root'">
                <div aria-hidden="true" class="bg-elevated/50 mx-2 my-1 h-px" />

                <a
                  :class="rowClass"
                  :href="GITHUB_URL"
                  rel="noopener"
                  target="_blank"
                  @click="close"
                >
                  <span class="flex min-w-7 justify-center">
                    <UIcon name="mdi:github" class="text-muted size-5" />
                  </span>
                  <span class="grow font-medium">GitHub</span>
                  <UIcon name="lucide:external-link" class="text-dimmed size-4 shrink-0" />
                </a>

                <a
                  :class="rowClass"
                  :href="DOCS_URL"
                  rel="noopener"
                  target="_blank"
                  @click="close"
                >
                  <span class="flex min-w-7 justify-center">
                    <UIcon name="lucide:book-open" class="text-muted size-5" />
                  </span>
                  <span class="grow font-medium">{{ t('login.menu.documentation') }}</span>
                  <UIcon name="lucide:external-link" class="text-dimmed size-4 shrink-0" />
                </a>
              </template>
            </div>

            <div v-else>
              <div
                :aria-label="t('base.previous')"
                role="button"
                tabindex="0"
                class="hover:bg-elevated/50 mb-1 flex items-center gap-2 rounded-sm p-2"
                @click="back"
                @keydown.enter.prevent="back"
                @keydown.space.prevent="back"
              >
                <UIcon name="lucide:chevron-left" class="text-muted size-5" />
                <span class="text-toned grow text-sm font-medium">{{ panelTitle }}</span>
              </div>

              <!-- Language -->
              <div v-if="activePanel === 'locale'" class="grid gap-0.5">
                <button
                  v-for="opt in localeOptions"
                  :key="opt.value"
                  :class="rowClass"
                  type="button"
                  @click="userStore.saveUserLocale(opt.value)"
                >
                  <span class="grow font-medium">{{ opt.label }}</span>
                  <UIcon
                    v-if="locale === opt.value"
                    name="lucide:check"
                    class="text-primary size-4 shrink-0"
                  />
                </button>
              </div>

              <!-- Theme -->
              <div v-else-if="activePanel === 'theme'" class="grid gap-0.5">
                <button
                  v-for="opt in themeOptions"
                  :key="opt.value"
                  :class="rowClass"
                  type="button"
                  @click="setTheme(opt.value)"
                >
                  <span class="flex min-w-7 justify-center">
                    <UIcon :name="THEME_ICONS[opt.value]" class="text-muted size-5" />
                  </span>
                  <span class="grow font-medium">{{ opt.label }}</span>
                  <UIcon
                    v-if="themePreference === opt.value"
                    name="lucide:check"
                    class="text-primary size-4 shrink-0"
                  />
                </button>
              </div>

              <!-- Primary color -->
              <div v-else-if="activePanel === 'primary'" class="px-2 pb-1">
                <ThemePickerPrimary />
              </div>

              <!-- Background color -->
              <div v-else-if="activePanel === 'neutral'" class="px-2 pb-1">
                <ThemePickerNeutral />
              </div>

              <!-- Rounding -->
              <div v-else class="px-2 pb-1">
                <ThemePickerRadius />
              </div>
            </div>
          </Motion>
        </AnimatePresence>
      </div>
    </template>
  </BottomSheetOrDropdown>
</template>
