<script setup lang="ts">
import { AnimatePresence, Motion } from 'motion-v'

import { useDemo } from '~/components/demo/useDemo'
import {
  USER_MENU_DOCS_URL,
  USER_MENU_GITHUB_URL,
  USER_MENU_PANEL_CHILDREN,
  USER_MENU_THEME_ICONS,
  useUserMenuData,
  type UserMenuPanel,
} from '~/components/layout/useUserMenuData'
import { capitalize, swatchPalette } from '~/components/theme/useThemeOptions'

type Panel = UserMenuPanel

// Session actions (enable demo / sign out) are only meaningful for an authenticated
// user mid-onboarding; the login page renders this menu without them.
const { sessionActions = false } = defineProps<{ sessionActions?: boolean }>()

const { locale, t } = useI18n()
const router = useRouter()
const { generateDemoData, isDemo } = useDemo()
const {
  blackAsPrimary,
  localeOptions,
  neutral,
  neutralColors,
  panelMeta,
  primary,
  primaryColors,
  radius,
  radiuses,
  setBlackAsPrimary,
  setTheme,
  themeOptions,
  themePreference,
  userStore,
} = useUserMenuData()

async function enableDemo() {
  isDemo.value = 'true'
  await generateDemoData(locale.value)
  router.push('/dashboard')
}

const isOpen = ref(false)
const direction = ref<1 | -1>(1)

const panelStack = ref<Panel[]>([])
const activePanel = computed<'root' | Panel>(() => panelStack.value.at(-1) ?? 'root')

const panelTitle = computed(() =>
  activePanel.value === 'root' ? '' : panelMeta.value[activePanel.value].title,
)

const childRows = computed(() =>
  (USER_MENU_PANEL_CHILDREN[activePanel.value] ?? []).map(id => ({ id, ...panelMeta.value[id] })),
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

const rowClass = 'flex min-h-11 w-full items-center gap-3 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-elevated/50'
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
          class="text-muted max-md:size-12 max-md:justify-center max-md:rounded-2xl max-md:border max-md:border-default/80 max-md:bg-default/20 max-md:shadow-lg max-md:backdrop-blur-xl max-md:dark:bg-neutral-800/50"
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
                class="mb-1 flex items-center gap-2 rounded-sm p-2 hover:bg-elevated/50"
                @click="back"
                @keydown.enter.prevent="back"
                @keydown.space.prevent="back"
              >
                <UIcon name="lucide:chevron-left" class="size-5 text-muted" />
                <span class="grow text-sm font-medium text-toned">{{ panelTitle }}</span>
              </div>

              <button
                v-for="row in childRows"
                :key="row.id"
                :class="rowClass"
                type="button"
                @click="open(row.id)"
              >
                <span class="flex min-w-7 justify-center">
                  <UIcon :name="row.icon" class="size-5 text-muted" />
                </span>
                <span class="grow font-medium">{{ row.title }}</span>
                <span class="text-xs text-dimmed capitalize">{{ row.value }}</span>
                <UIcon name="lucide:chevron-right" class="size-4 shrink-0 text-muted" />
              </button>

              <template v-if="activePanel === 'root' && sessionActions">
                <div aria-hidden="true" class="mx-2 my-1 h-px bg-elevated/50" />

                <button
                  :class="rowClass"
                  type="button"
                  @click="() => { enableDemo(); close() }"
                >
                  <span class="flex min-w-7 justify-center">
                    <UIcon name="mdi:play-box-outline" class="size-5 text-muted" />
                  </span>
                  <span class="grow font-medium">{{ t('login.openDemo') }}</span>
                </button>

                <button
                  :class="rowClass"
                  type="button"
                  @click="userStore.signOut()"
                >
                  <span class="flex min-w-7 justify-center">
                    <UIcon name="i-lucide-log-out" class="size-5 text-muted" />
                  </span>
                  <span class="grow font-medium">{{ t('user.logout') }}</span>
                </button>
              </template>

              <template v-if="activePanel === 'root'">
                <div aria-hidden="true" class="mx-2 my-1 h-px bg-elevated/50" />

                <a
                  :class="rowClass"
                  :href="USER_MENU_GITHUB_URL"
                  rel="noopener"
                  target="_blank"
                  @click="close"
                >
                  <span class="flex min-w-7 justify-center">
                    <UIcon name="mdi:github" class="size-5 text-muted" />
                  </span>
                  <span class="grow font-medium">GitHub</span>
                  <UIcon name="lucide:external-link" class="size-4 shrink-0 text-dimmed" />
                </a>

                <a
                  :class="rowClass"
                  :href="USER_MENU_DOCS_URL"
                  rel="noopener"
                  target="_blank"
                  @click="close"
                >
                  <span class="flex min-w-7 justify-center">
                    <UIcon name="lucide:book-open" class="size-5 text-muted" />
                  </span>
                  <span class="grow font-medium">{{ t('login.menu.documentation') }}</span>
                  <UIcon name="lucide:external-link" class="size-4 shrink-0 text-dimmed" />
                </a>
              </template>
            </div>

            <div v-else>
              <div
                :aria-label="t('base.previous')"
                role="button"
                tabindex="0"
                class="mb-1 flex items-center gap-2 rounded-sm p-2 hover:bg-elevated/50"
                @click="back"
                @keydown.enter.prevent="back"
                @keydown.space.prevent="back"
              >
                <UIcon name="lucide:chevron-left" class="size-5 text-muted" />
                <span class="grow text-sm font-medium text-toned">{{ panelTitle }}</span>
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
                    class="size-4 shrink-0 text-primary"
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
                    <UIcon :name="USER_MENU_THEME_ICONS[opt.value]" class="size-5 text-muted" />
                  </span>
                  <span class="grow font-medium">{{ opt.label }}</span>
                  <UIcon
                    v-if="themePreference === opt.value"
                    name="lucide:check"
                    class="size-4 shrink-0 text-primary"
                  />
                </button>
              </div>

              <!-- Primary color -->
              <div v-else-if="activePanel === 'primary'" class="grid gap-0.5">
                <button
                  :class="rowClass"
                  type="button"
                  @click="setBlackAsPrimary(true)"
                >
                  <span class="flex min-w-7 justify-center">
                    <span class="size-5 shrink-0 rounded-full bg-black dark:bg-white" />
                  </span>
                  <span class="grow font-medium">Black</span>
                  <UIcon
                    v-if="blackAsPrimary"
                    name="lucide:check"
                    class="size-4 shrink-0 text-primary"
                  />
                </button>

                <button
                  v-for="color in primaryColors"
                  :key="color"
                  :class="rowClass"
                  type="button"
                  @click="primary = color"
                >
                  <span class="flex min-w-7 justify-center">
                    <span
                      class="size-5 shrink-0 rounded-full bg-(--chip-light) dark:bg-(--chip-dark)"
                      :style="{
                        '--chip-light': `var(--color-${color}-500)`,
                        '--chip-dark': `var(--color-${color}-400)`,
                      }"
                    />
                  </span>
                  <span class="grow font-medium capitalize">{{ capitalize(color) }}</span>
                  <UIcon
                    v-if="!blackAsPrimary && primary === color"
                    name="lucide:check"
                    class="size-4 shrink-0 text-primary"
                  />
                </button>
              </div>

              <!-- Background color -->
              <div v-else-if="activePanel === 'neutral'" class="grid gap-0.5">
                <button
                  v-for="color in neutralColors"
                  :key="color"
                  :class="rowClass"
                  type="button"
                  @click="neutral = color"
                >
                  <span class="flex min-w-7 justify-center">
                    <span
                      class="size-5 shrink-0 rounded-full bg-(--chip-light) dark:bg-(--chip-dark)"
                      :style="{
                        '--chip-light': `var(--color-${swatchPalette(color)}-500)`,
                        '--chip-dark': `var(--color-${swatchPalette(color)}-400)`,
                      }"
                    />
                  </span>
                  <span class="grow font-medium capitalize">{{ capitalize(color) }}</span>
                  <UIcon
                    v-if="neutral === color"
                    name="lucide:check"
                    class="size-4 shrink-0 text-primary"
                  />
                </button>
              </div>

              <!-- Rounding -->
              <div v-else class="grid gap-0.5">
                <button
                  v-for="option in radiuses"
                  :key="option"
                  :class="rowClass"
                  type="button"
                  @click="radius = option"
                >
                  <span class="flex min-w-7 justify-center">
                    <span
                      class="size-5 shrink-0 bg-elevated ring-1 ring-accented"
                      :style="{ borderRadius: `${option}rem` }"
                    />
                  </span>
                  <span class="grow font-medium">{{ option }}</span>
                  <UIcon
                    v-if="radius === option"
                    name="lucide:check"
                    class="size-4 shrink-0 text-primary"
                  />
                </button>
              </div>
            </div>
          </Motion>
        </AnimatePresence>
      </div>
    </template>
  </BottomSheetOrDropdown>
</template>
