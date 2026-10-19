<script setup lang="ts">
import type { UserMenuPanel } from '~/components/layout/useUserMenuData'

import { useDemo } from '~/components/demo/useDemo'
import UserMenuPanelBody from '~/components/layout/UserMenuPanelBody.vue'
import { useUserMenuData } from '~/components/layout/useUserMenuData'
import { showSuccessToast } from '~/composables/useStoreSync'

// The one user menu body: demo actions or account + sync status, language, appearance and
// session actions. Containers (header popover, sidebar popover, mobile bottom sheet) only pick a trigger
// and fill the `root` / `rootAfter` slots. Panel state lives here, so a container that unmounts
// its content on close reopens on the root list.
// Session actions (enable demo / sign out) only make sense for a signed-in user; the login page
// renders the menu without them.
const { sessionActions = false } = defineProps<{ sessionActions?: boolean }>()
const emit = defineEmits<{ close: [], compact: [value: boolean] }>()

const { locale, t } = useI18n()
const router = useRouter()
const isLaptop = useIsLaptop()
const { generateDemoData, isDemo } = useDemo()
const {
  isDark,
  panelMeta,
  toggleTheme,
  userStore,
} = useUserMenuData()

async function updateDemo() {
  await generateDemoData(locale.value)
  showSuccessToast('demo.updated')
}

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
// Phone colour/radius panels collapse into swatch strips so the page behind the sheet
// stays visible as a live preview; the container drops its overlay to match.
const isCompact = computed(() => ['color', 'radius'].includes(activePanel.value))
watch(isCompact, value => emit('compact', value), { immediate: true })

function open(panel: UserMenuPanel) {
  direction.value = 1
  panelStack.value = [...panelStack.value, panel]
}

function back() {
  direction.value = -1
  panelStack.value = panelStack.value.slice(0, -1)
}

const rowClass = 'flex min-h-10.5 w-full items-center gap-3 rounded-sm interactive py-1.5 pr-2 pl-3 text-left text-sm leading-none font-medium tracking-wide text-toned'
const iconSlotClass = 'flex shrink-0 justify-center'
</script>

<template>
  <div>
    <UiPanelSlide :direction :panelKey="activePanel">
      <UiPanelBack
        v-if="activePanel !== 'root'"
        :title="panelTitle"
        @back="back"
      />

      <div v-if="activePanel === 'root'" class="grid gap-0.5">
        <template v-if="isDemo">
          <button :class="rowClass" type="button" @click="updateDemo">
            <span :class="iconSlotClass">
              <UIcon name="lucide:refresh-cw" class="size-5 text-muted" />
            </span>
            <span class="grow">{{ t('demo.update') }}</span>
          </button>

          <button :class="rowClass" type="button" @click="userStore.signOut()">
            <span :class="iconSlotClass">
              <UIcon name="i-lucide-log-out" class="size-5 text-muted" />
            </span>
            <span class="grow">{{ t('demo.exit') }}</span>
          </button>

          <div aria-hidden="true" class="mx-2 my-1 h-px bg-elevated/50" />
        </template>

        <template v-else-if="userStore.currentUser">
          <div class="mx-2 flex items-start gap-2 py-2">
            <div class="min-w-0 grow">
              <UserViewLogout :compact="isLaptop" hideEmail />
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

        <UserMenuPanelBody panel="root" @open="open" />

        <!-- On the phone the bottom nav's own menu already lists Settings (via itemsModal in its
           #root slot); here it only replaces the sidebar's standalone icon on desktop. -->
        <button
          v-if="isLaptop"
          :class="rowClass"
          type="button"
          @click="router.push('/settings'); emit('close')"
        >
          <span :class="iconSlotClass">
            <UIcon name="hugeicons:settings-01" class="size-5 text-muted" />
          </span>
          <span class="grow">{{ t('settings.title') }}</span>
        </button>

        <template v-if="sessionActions && !isDemo">
          <div aria-hidden="true" class="mx-2 my-1 h-px bg-elevated/50" />

          <button
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
            <span class="grow">{{ t('user.logout') }}</span>
          </button>
        </template>

        <slot name="rootAfter" />
      </div>

      <UserMenuPanelBody v-else :panel="activePanel" @open="open" />
    </UiPanelSlide>
  </div>
</template>
