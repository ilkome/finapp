<script setup lang="ts">
import { AnimatePresence, Motion } from 'motion-v'
import pkg from '~~/package.json'

import type { UserMenuPanel } from '~/components/layout/useUserMenuData'

import { useDemo } from '~/components/demo/useDemo'
import {
  USER_MENU_PANEL_CHILDREN,
  USER_MENU_THEME_ICONS,
  useUserMenuData,
} from '~/components/layout/useUserMenuData'
import { isSearchOpen } from '~/components/search/useSearch'
import { capitalize, swatchPalette } from '~/components/theme/useThemeOptions'
import { useUserStore } from '~/components/user/useUserStore'
import { useMenuLabelVisibility } from '~/composables/useMenuLabelVisibility'
import { showSuccessToast } from '~/composables/useStoreSync'

type Panel = UserMenuPanel

const emit = defineEmits<{ close: [] }>()

const PANEL_PARENT: Record<Panel, 'root' | Panel> = {
  appearance: 'root',
  locale: 'root',
  neutral: 'appearance',
  primary: 'appearance',
  radius: 'appearance',
  theme: 'root',
}

const { locale, t } = useI18n()
const userStore = useUserStore()
const isShowMenuLabels = useMenuLabelVisibility()
const { generateDemoData, isDemo } = useDemo()
const config = useRuntimeConfig()
const {
  blackAsPrimary,
  isDark,
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
  toggleTheme,
} = useUserMenuData({ sessionActions: false })

const activePanel = ref<'root' | Panel>('root')
const direction = ref<1 | -1>(1)
const panelTitle = computed(() =>
  activePanel.value === 'root' ? '' : panelMeta.value[activePanel.value].title,
)
const childRows = computed(() =>
  (USER_MENU_PANEL_CHILDREN[activePanel.value] ?? []).map(id => ({ id, ...panelMeta.value[id] })),
)
const rowClass = 'flex min-h-11 w-full items-center gap-3 rounded-sm interactive px-2 py-1.5 text-left text-sm'

const SLIDE_DISTANCE = 8
const panelVariants = {
  center: { opacity: 1, x: 0 },
  enter: (dir: 1 | -1) => ({ opacity: 0, x: dir * SLIDE_DISTANCE }),
  exit: (dir: 1 | -1) => ({ opacity: 0, x: dir * -SLIDE_DISTANCE }),
}
const panelTransition = { duration: 0.12, ease: [0.4, 0, 0.2, 1] as const }

function onSearchClick() {
  emit('close')
  nextTick(() => {
    isSearchOpen.value = true
  })
}

function openPanel(panel: Panel) {
  direction.value = 1
  activePanel.value = panel
}

function backPanel() {
  if (activePanel.value === 'root')
    return

  direction.value = -1
  activePanel.value = PANEL_PARENT[activePanel.value]
}

async function updateDemo() {
  await generateDemoData(locale.value)
  showSuccessToast('demo.updated')
}

async function clearCachesAndReload() {
  if ('serviceWorker' in navigator)
    await navigator.serviceWorker.getRegistration().then(reg => reg?.update())
  if ('caches' in window)
    await caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
  location.reload()
}
</script>

<template>
  <Teleport to="body">
    <LazyBottomSheet
      isShow
      dragClassesCustom="bottom-sheet-drag-classes-custom"
      @closed="emit('close')"
    >
      <template #handler>
        <BottomSheetHandler />
      </template>

      <div class="bottom-sheet-content">
        <div class="bottom-sheet-content-inside overflow-y-hidden! p-0!">
          <div class="h-full overflow-x-clip">
            <AnimatePresence :custom="direction" mode="wait" :initial="false">
              <Motion
                :key="activePanel"
                :custom="direction"
                :variants="panelVariants"
                initial="enter"
                animate="center"
                exit="exit"
                :transition="panelTransition"
                class="max-h-[98dvh] scroller-block overflow-y-auto px-3 pt-4 pb-2"
              >
                <div v-if="activePanel === 'root'">
                  <div
                    v-if="userStore.currentUser"
                    class="mx-2 flex items-start gap-2 border-b border-default py-2"
                  >
                    <div class="min-w-0 grow">
                      <UserViewLogout />
                    </div>
                    <UiActionButton
                      :ariaLabel="t(isDark ? 'theme.light' : 'theme.dark')"
                      class="shrink-0"
                      @click="toggleTheme"
                    >
                      <Icon
                        :name="isDark ? 'i-lucide-sun' : 'i-lucide-moon'"
                        size="20"
                      />
                    </UiActionButton>
                  </div>

                  <div class="py-4">
                    <div
                      class="flex min-h-11 items-center gap-3 rounded-sm interactive px-2 py-1.5 text-muted md:min-h-9.5"
                      @click="onSearchClick"
                    >
                      <div class="flex min-w-8 items-center justify-center">
                        <Icon name="lucide:search" size="22" class="leading-none" />
                      </div>
                      <div class="text-sm font-medium">
                        {{ t('search.title') }}
                      </div>
                    </div>

                    <LayoutSidebarMenu source="itemsModal" />

                    <div aria-hidden="true" class="mx-2 my-1 h-px bg-elevated/50" />

                    <button
                      v-for="row in childRows"
                      :key="row.id"
                      :class="rowClass"
                      type="button"
                      @click="openPanel(row.id)"
                    >
                      <span class="flex min-w-8 justify-center">
                        <UIcon :name="row.icon" class="size-5 text-muted" />
                      </span>
                      <span class="grow font-medium text-muted">{{ row.title }}</span>
                      <span class="text-xs text-dimmed capitalize">{{ row.value }}</span>
                      <UIcon name="lucide:chevron-right" class="size-4 shrink-0 text-muted" />
                    </button>
                  </div>

                  <div
                    v-if="isDemo"
                    class="grid gap-2 px-3 py-2"
                  >
                    <UiButtonAccent
                      rounded
                      @click="updateDemo"
                    >
                      {{ t('demo.update') }}
                    </UiButtonAccent>

                    <UiButtonAccent
                      rounded
                      variant="outline"
                      @click="userStore.signOut"
                    >
                      {{ t('demo.exit') }}
                    </UiButtonAccent>
                  </div>

                  <div
                    v-if="!config.public.isProd"
                    class="grid justify-items-center gap-1 px-3 pt-2 pb-1"
                  >
                    <UButton
                      :label="t('app.updateCache')"
                      class="text-muted"
                      color="neutral"
                      icon="lucide:refresh-cw"
                      size="xs"
                      variant="ghost"
                      @click="clearCachesAndReload"
                    />

                    <div class="text-center text-xs text-muted">
                      {{ t('app.version') }} {{ pkg.version }}
                    </div>
                  </div>
                </div>

                <div v-else class="py-4">
                  <div
                    :aria-label="t('base.previous')"
                    role="button"
                    tabindex="0"
                    class="mb-1 flex items-center gap-2 rounded-sm interactive p-2"
                    @click="backPanel"
                    @keydown.enter.prevent="backPanel"
                    @keydown.space.prevent="backPanel"
                  >
                    <UIcon name="lucide:chevron-left" class="size-5 text-muted" />
                    <span class="grow text-sm font-medium text-toned">{{ panelTitle }}</span>
                  </div>

                  <div v-if="childRows.length" class="grid gap-0.5">
                    <button
                      v-for="row in childRows"
                      :key="row.id"
                      :class="rowClass"
                      type="button"
                      @click="openPanel(row.id)"
                    >
                      <span class="flex min-w-8 justify-center">
                        <UIcon :name="row.icon" class="size-5 text-muted" />
                      </span>
                      <span class="grow font-medium text-muted">{{ row.title }}</span>
                      <span class="text-xs text-dimmed capitalize">{{ row.value }}</span>
                      <UIcon name="lucide:chevron-right" class="size-4 shrink-0 text-muted" />
                    </button>

                    <UiSwitchItem
                      v-if="activePanel === 'appearance'"
                      :checkboxValue="isShowMenuLabels"
                      :title="t('settings.menuLabels')"
                      class="mt-1"
                      @click="isShowMenuLabels = !isShowMenuLabels"
                    />
                  </div>

                  <div v-else-if="activePanel === 'locale'" class="grid gap-0.5">
                    <button
                      v-for="opt in localeOptions"
                      :key="opt.value"
                      :class="rowClass"
                      type="button"
                      @click="userStore.saveUserLocale(opt.value)"
                    >
                      <span class="grow font-medium text-muted">{{ opt.label }}</span>
                      <UIcon
                        v-if="locale === opt.value"
                        name="lucide:check"
                        class="size-4 shrink-0 text-primary"
                      />
                    </button>
                  </div>

                  <div v-else-if="activePanel === 'theme'" class="grid gap-0.5">
                    <button
                      v-for="opt in themeOptions"
                      :key="opt.value"
                      :class="rowClass"
                      type="button"
                      @click="setTheme(opt.value)"
                    >
                      <span class="flex min-w-8 justify-center">
                        <UIcon :name="USER_MENU_THEME_ICONS[opt.value]" class="size-5 text-muted" />
                      </span>
                      <span class="grow font-medium text-muted">{{ opt.label }}</span>
                      <UIcon
                        v-if="themePreference === opt.value"
                        name="lucide:check"
                        class="size-4 shrink-0 text-primary"
                      />
                    </button>
                  </div>

                  <div v-else-if="activePanel === 'primary'" class="grid gap-0.5">
                    <button
                      :class="rowClass"
                      type="button"
                      @click="setBlackAsPrimary(true)"
                    >
                      <span class="flex min-w-8 justify-center">
                        <span class="size-5 shrink-0 rounded-full bg-black dark:bg-white" />
                      </span>
                      <span class="grow font-medium text-muted">Black</span>
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
                      <span class="flex min-w-8 justify-center">
                        <span
                          class="size-5 shrink-0 rounded-full bg-(--chip-light) dark:bg-(--chip-dark)"
                          :style="{
                            '--chip-light': `var(--color-${color}-500)`,
                            '--chip-dark': `var(--color-${color}-400)`,
                          }"
                        />
                      </span>
                      <span class="grow font-medium text-muted capitalize">{{ capitalize(color) }}</span>
                      <UIcon
                        v-if="!blackAsPrimary && primary === color"
                        name="lucide:check"
                        class="size-4 shrink-0 text-primary"
                      />
                    </button>
                  </div>

                  <div v-else-if="activePanel === 'neutral'" class="grid gap-0.5">
                    <button
                      v-for="color in neutralColors"
                      :key="color"
                      :class="rowClass"
                      type="button"
                      @click="neutral = color"
                    >
                      <span class="flex min-w-8 justify-center">
                        <span
                          class="size-5 shrink-0 rounded-full bg-(--chip-light) dark:bg-(--chip-dark)"
                          :style="{
                            '--chip-light': `var(--color-${swatchPalette(color)}-500)`,
                            '--chip-dark': `var(--color-${swatchPalette(color)}-400)`,
                          }"
                        />
                      </span>
                      <span class="grow font-medium text-muted capitalize">{{ capitalize(color) }}</span>
                      <UIcon
                        v-if="neutral === color"
                        name="lucide:check"
                        class="size-4 shrink-0 text-primary"
                      />
                    </button>
                  </div>

                  <div v-else class="grid gap-0.5">
                    <button
                      v-for="option in radiuses"
                      :key="option"
                      :class="rowClass"
                      type="button"
                      @click="radius = option"
                    >
                      <span class="flex min-w-8 justify-center">
                        <span
                          class="size-5 shrink-0 bg-elevated ring-1 ring-accented"
                          :style="{ borderRadius: `${option}rem` }"
                        />
                      </span>
                      <span class="grow font-medium text-muted">{{ option }}</span>
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
        </div>
      </div>
    </LazyBottomSheet>
  </Teleport>
</template>
