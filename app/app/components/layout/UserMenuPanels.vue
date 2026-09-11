<script setup lang="ts">
import { AnimatePresence, Motion } from 'motion-v'

import type { UserMenuPanel } from '~/components/layout/useUserMenuData'

import { useDemo } from '~/components/demo/useDemo'
import {
  USER_MENU_DOCS_URL,
  USER_MENU_GITHUB_URL,
  USER_MENU_PANEL_CHILDREN,
  USER_MENU_THEME_ICONS,
  useUserMenuData,
} from '~/components/layout/useUserMenuData'
import { BLACK_PRIMARY, capitalize, swatchPalette } from '~/components/theme/useThemeOptions'
import { useMenuLabelVisibility } from '~/composables/useMenuLabelVisibility'

// The one user menu body: account + sync status, language, appearance, session actions and
// links. Containers (header popover, sidebar popover, mobile bottom sheet) only pick a trigger
// and fill the `root` / `rootAfter` slots. Panel state lives here, so a container that unmounts
// its content on close reopens on the root list.
// Session actions (enable demo / sign out) only make sense for a signed-in user; the login page
// renders the menu without them.
const { sessionActions = false } = defineProps<{ sessionActions?: boolean }>()
const emit = defineEmits<{ close: [] }>()

const { locale, t } = useI18n()
const router = useRouter()
const isLaptop = useIsLaptop()
const isShowMenuLabels = useMenuLabelVisibility()
const { generateDemoData, isDemo } = useDemo()
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
  userStore,
} = useUserMenuData()

async function enableDemo() {
  isDemo.value = 'true'
  await generateDemoData(locale.value)
  emit('close')
  router.push('/dashboard')
}

const panelStack = ref<UserMenuPanel[]>([])
const direction = ref<1 | -1>(1)
const activePanel = computed<'root' | UserMenuPanel>(() => panelStack.value.at(-1) ?? 'root')
const panelTitle = computed(() => activePanel.value === 'root' ? '' : panelMeta.value[activePanel.value].title)
const childRows = computed(() =>
  (USER_MENU_PANEL_CHILDREN[activePanel.value] ?? []).map(id => ({ id, ...panelMeta.value[id] })),
)

type Option = { checked: boolean, chip?: string, icon?: string, key: string, label: string, radius?: number, select: () => void }

// Leaf panels are all "pick one of N", so one loop renders them.
const options = computed<Option[]>(() => {
  switch (activePanel.value) {
    case 'locale':
      return localeOptions.value.map(o => ({ checked: locale.value === o.value, key: o.value, label: o.label, select: () => userStore.saveUserLocale(o.value) }))
    case 'theme':
      return themeOptions.map(o => ({ checked: themePreference.value === o.value, icon: USER_MENU_THEME_ICONS[o.value], key: o.value, label: o.label, select: () => setTheme(o.value) }))
    case 'primary':
      return [
        { checked: blackAsPrimary.value, chip: BLACK_PRIMARY, key: BLACK_PRIMARY, label: 'Black', select: () => setBlackAsPrimary(true) },
        ...primaryColors.map(c => ({ checked: !blackAsPrimary.value && primary.value === c, chip: c, key: c, label: capitalize(c), select: () => primary.value = c })),
      ]
    case 'neutral':
      return neutralColors.map(c => ({ checked: neutral.value === c, chip: c, key: c, label: capitalize(c), select: () => neutral.value = c }))
    case 'radius':
      return radiuses.map(r => ({ checked: radius.value === r, key: String(r), label: String(r), radius: r, select: () => radius.value = r }))
    default:
      return []
  }
})

function open(panel: UserMenuPanel) {
  direction.value = 1
  panelStack.value = [...panelStack.value, panel]
}

function back() {
  direction.value = -1
  panelStack.value = panelStack.value.slice(0, -1)
}

const SLIDE_DISTANCE = 8
const panelVariants = {
  center: { opacity: 1, x: 0 },
  enter: (dir: 1 | -1) => ({ opacity: 0, x: dir * SLIDE_DISTANCE }),
  exit: (dir: 1 | -1) => ({ opacity: 0, x: dir * -SLIDE_DISTANCE }),
}
const panelTransition = { duration: 0.12, ease: [0.4, 0, 0.2, 1] as const }

const rowClass = 'flex min-h-11 w-full items-center gap-3 rounded-sm interactive px-2 py-1.5 text-left text-sm font-medium'
const iconSlotClass = 'flex min-w-7 justify-center'
</script>

<template>
  <div class="overflow-x-clip">
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
        <div
          v-if="activePanel !== 'root'"
          :aria-label="t('base.previous')"
          role="button"
          tabindex="0"
          class="mb-1 flex items-center gap-2 rounded-sm interactive p-2"
          @click="back"
          @keydown.enter.prevent="back"
          @keydown.space.prevent="back"
        >
          <UIcon name="lucide:chevron-left" class="size-5 text-muted" />
          <span class="grow text-sm font-medium text-toned">{{ panelTitle }}</span>
        </div>

        <div v-if="activePanel === 'root'" class="grid gap-0.5">
          <template v-if="userStore.currentUser">
            <div class="mx-2 flex items-start gap-2 py-2">
              <div class="min-w-0 grow">
                <UserViewLogout />
              </div>
              <UiActionButton
                :ariaLabel="t(isDark ? 'theme.light' : 'theme.dark')"
                class="shrink-0"
                @click="toggleTheme"
              >
                <Icon :name="isDark ? 'i-lucide-sun' : 'i-lucide-moon'" size="20" />
              </UiActionButton>
            </div>
            <div aria-hidden="true" class="mx-2 my-1 h-px bg-elevated/50" />
          </template>

          <slot name="root" />

          <button
            v-for="row in childRows"
            :key="row.id"
            :class="rowClass"
            type="button"
            @click="open(row.id)"
          >
            <span :class="iconSlotClass">
              <UIcon :name="row.icon" class="size-5 text-muted" />
            </span>
            <span class="grow">{{ row.title }}</span>
            <span class="text-xs font-normal text-dimmed capitalize">{{ row.value }}</span>
            <UIcon name="lucide:chevron-right" class="size-4 shrink-0 text-muted" />
          </button>

          <template v-if="sessionActions">
            <div aria-hidden="true" class="mx-2 my-1 h-px bg-elevated/50" />

            <button
              v-if="!isDemo"
              :class="rowClass"
              type="button"
              @click="enableDemo"
            >
              <span :class="iconSlotClass">
                <UIcon name="mdi:play-box-outline" class="size-5 text-muted" />
              </span>
              <span class="grow">{{ t('login.openDemo') }}</span>
            </button>

            <button
              :class="rowClass"
              type="button"
              @click="userStore.signOut()"
            >
              <span :class="iconSlotClass">
                <UIcon name="i-lucide-log-out" class="size-5 text-muted" />
              </span>
              <span class="grow">{{ isDemo ? t('demo.exit') : t('user.logout') }}</span>
            </button>
          </template>

          <div aria-hidden="true" class="mx-2 my-1 h-px bg-elevated/50" />

          <a
            v-for="link in [{ href: USER_MENU_GITHUB_URL, icon: 'mdi:github', label: 'GitHub' }, { href: USER_MENU_DOCS_URL, icon: 'lucide:book-open', label: t('login.menu.documentation') }]"
            :key="link.href"
            :class="rowClass"
            :href="link.href"
            rel="noopener"
            target="_blank"
            @click="emit('close')"
          >
            <span :class="iconSlotClass">
              <UIcon :name="link.icon" class="size-5 text-muted" />
            </span>
            <span class="grow">{{ link.label }}</span>
            <UIcon name="lucide:external-link" class="size-4 shrink-0 text-dimmed" />
          </a>

          <slot name="rootAfter" />
        </div>

        <div v-else-if="childRows.length" class="grid gap-0.5">
          <button
            v-for="row in childRows"
            :key="row.id"
            :class="rowClass"
            type="button"
            @click="open(row.id)"
          >
            <span :class="iconSlotClass">
              <UIcon :name="row.icon" class="size-5 text-muted" />
            </span>
            <span class="grow">{{ row.title }}</span>
            <span class="text-xs font-normal text-dimmed capitalize">{{ row.value }}</span>
            <UIcon name="lucide:chevron-right" class="size-4 shrink-0 text-muted" />
          </button>

          <!-- Bottom-nav labels only exist on the phone layout. -->
          <UiSwitchItem
            v-if="activePanel === 'appearance' && !isLaptop"
            :checkboxValue="isShowMenuLabels"
            :title="t('settings.menuLabels')"
            class="mt-1"
            @click="isShowMenuLabels = !isShowMenuLabels"
          />
        </div>

        <div v-else class="grid gap-0.5">
          <button
            v-for="option in options"
            :key="option.key"
            :class="rowClass"
            type="button"
            @click="option.select"
          >
            <span v-if="option.icon || option.chip || option.radius != null" :class="iconSlotClass">
              <UIcon v-if="option.icon" :name="option.icon" class="size-5 text-muted" />
              <span v-else-if="option.chip === BLACK_PRIMARY" class="size-5 shrink-0 rounded-full bg-black dark:bg-white" />
              <span
                v-else-if="option.chip"
                class="size-5 shrink-0 rounded-full bg-(--chip-light) dark:bg-(--chip-dark)"
                :style="{
                  '--chip-light': `var(--color-${swatchPalette(option.chip)}-500)`,
                  '--chip-dark': `var(--color-${swatchPalette(option.chip)}-400)`,
                }"
              />
              <span
                v-else
                class="size-5 shrink-0 bg-elevated ring-1 ring-accented"
                :style="{ borderRadius: `${option.radius}rem` }"
              />
            </span>
            <span class="grow">{{ option.label }}</span>
            <UIcon v-if="option.checked" name="lucide:check" class="size-4 shrink-0 text-primary" />
          </button>
        </div>
      </Motion>
    </AnimatePresence>
  </div>
</template>
