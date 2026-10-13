<script setup lang="ts">
import { AnimatePresence, Motion } from 'motion-v'

import { isStatConfigRuleNav, statConfigNavTitleKey, useStatConfigNav } from '~/components/stat/config/useStatConfigNav'
import { useStatConfigOverlay } from '~/components/stat/config/useStatConfigOverlay'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const props = defineProps<{
  labelMode?: boolean
}>()

const { t } = useI18n()
const { width } = useWindowSize()
const trnsFormStore = useTrnsFormStore()
const { close: closeOverlay, isOpen, open: openOverlay } = useStatConfigOverlay()
const { activePanel, back, direction } = useStatConfigNav()

const panelTitle = computed(() => {
  const panel = activePanel.value
  if (!panel)
    return ''
  return isStatConfigRuleNav(panel)
    ? t('stat.views.blockRules.settings')
    : t(statConfigNavTitleKey(panel))
})

// Desktop only: the sidebar slides between the block list and one section, mirroring the
// bottom menu. Mobile stacks a second sheet instead, so Back is handled by the sheet stack.
const SLIDE_DISTANCE = 8
const panelVariants = {
  center: { opacity: 1, x: 0 },
  enter: (dir: 1 | -1) => ({ opacity: 0, x: dir * SLIDE_DISTANCE }),
  exit: (dir: 1 | -1) => ({ opacity: 0, x: dir * -SLIDE_DISTANCE }),
}
const panelTransition = { duration: 0.12, ease: [0.4, 0, 0.2, 1] as const }

function onClose() {
  back()
  closeOverlay()
}

// The sheet animates out before the overlay closes: closing it saves the config and re-renders the
// whole dashboard, which would drop the exit frames.
const isSheetOpen = ref(isOpen.value)
watch(isOpen, value => isSheetOpen.value = value)
function closeSheet() {
  isSheetOpen.value = false
}

function onSidebarKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' && event.key !== 'Backspace')
    return
  // Backspace must stay an edit key while typing inside the sidebar.
  const target = event.target as HTMLElement | null
  if (event.key === 'Backspace' && (target?.isContentEditable || /^(?:INPUT|TEXTAREA|SELECT)$/.test(target?.tagName ?? '')))
    return
  if (back())
    event.preventDefault()
  else if (event.key === 'Escape')
    onClose()
}

function onOpen() {
  trnsFormStore.ui.isShow = false
  openOverlay()
  // Reopened during the exit: the overlay never closed, so its watcher stays quiet.
  isSheetOpen.value = true
}

onDeactivated(onClose)
onBeforeUnmount(onClose)
</script>

<template>
  <DrawerOrDropdown
    v-if="width < 767"
    :open="isSheetOpen"
    :title="t('stat.config.menu.label')"
    :unmountOnHide="false"
    @closed="onClose"
    @update:open="value => value ? onOpen() : closeSheet()"
  >
    <template #trigger>
      <UiTriggerButton
        icon="lucide:settings-2"
        :labelMode="props.labelMode"
        :title="t('stat.config.menu.label')"
      />
    </template>

    <template #custom>
      <div class="drawer-body gap-4 pb-0!">
        <div class="grid min-w-0 gap-4">
          <slot :close="closeSheet" />
        </div>
      </div>
    </template>
  </DrawerOrDropdown>

  <template v-if="width < 767">
    <LazyDrawer v-if="isOpen && activePanel" :title="panelTitle" @closed="back()">
      <div class="drawer-body">
        <StatConfigPanelScreen :panel="activePanel" />
      </div>
    </LazyDrawer>
  </template>

  <template v-else>
    <UTooltip :text="t('stat.config.menu.label')">
      <UiActionButton :ariaLabel="t('stat.config.menu.label')" @click="onOpen">
        <Icon name="lucide:settings-2" size="20" />
      </UiActionButton>
    </UTooltip>

    <Teleport to="body">
      <Transition name="statConfigSidebar" appear>
        <aside
          v-if="isOpen"
          class="@container/statConfig fixed inset-y-0 right-0 z-50 h-dvh w-100 py-4"
          tabindex="-1"
          @keydown="onSidebarKeydown"
        >
          <div class="relative h-full overflow-hidden rounded-md border border-accented bg-default shadow-2xl lg:rounded-lg">
            <UiButtonClose @click="onClose" />

            <div class="h-full overflow-x-clip overflow-y-auto overscroll-contain">
              <UiTitleModal hasClose>
                <div class="flex items-center gap-2">
                  <UButton
                    v-if="activePanel"
                    :aria-label="t('base.previous')"
                    class="-my-2 shrink-0"
                    color="neutral"
                    icon="i-lucide-arrow-left"
                    variant="ghost"
                    @click="back()"
                  />
                  <span class="min-w-0 truncate">{{ activePanel ? panelTitle : t('stat.config.menu.label') }}</span>
                </div>
              </UiTitleModal>

              <AnimatePresence :custom="direction" mode="wait" :initial="false">
                <Motion
                  :key="activePanel ?? 'root'"
                  animate="center"
                  class="px-3 pb-8"
                  :custom="direction"
                  exit="exit"
                  initial="enter"
                  :transition="panelTransition"
                  :variants="panelVariants"
                >
                  <StatConfigPanelScreen v-if="activePanel" :panel="activePanel" />
                  <slot v-else :close="onClose" />
                </Motion>
              </AnimatePresence>
            </div>
          </div>
        </aside>
      </Transition>
    </Teleport>
  </template>
</template>

<style>
@reference '../../../assets/css/main.css';

.statConfigSidebar-enter-active,
.statConfigSidebar-leave-active {
  @apply translate-x-0 opacity-100 transition-all duration-300 ease-in-out;
}

.statConfigSidebar-enter-from,
.statConfigSidebar-leave-to {
  @apply translate-x-full opacity-0;
}
</style>
