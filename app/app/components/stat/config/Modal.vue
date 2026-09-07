<script setup lang="ts">
import { AnimatePresence, Motion } from 'motion-v'

import { statConfigNavTitleKey, useStatConfigNav } from '~/components/stat/config/useStatConfigNav'
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

const panelTitle = computed(() => activePanel.value ? t(statConfigNavTitleKey(activePanel.value)) : '')

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
}

onDeactivated(onClose)
onBeforeUnmount(onClose)
</script>

<template>
  <BottomSheetOrDropdown
    v-if="width < 767"
    :isOpen
    :unmountOnHide="false"
    @openModal="onOpen"
    @closeModal="onClose"
  >
    <template #trigger>
      <UiTriggerButton
        icon="lucide:settings-2"
        :labelMode="props.labelMode"
        :title="t('stat.config.menu.label')"
      />
    </template>

    <template #custom>
      <UiTitleModal>
        {{ t('stat.config.menu.label') }}
      </UiTitleModal>
      <div class="bottom-sheet-content-inside scroller-block gap-4 px-3! pb-0!">
        <div class="grid min-w-0 gap-4">
          <slot :close="onClose" />
        </div>
      </div>
    </template>
  </BottomSheetOrDropdown>

  <Teleport v-if="width < 767" to="body">
    <LazyBottomSheet
      v-if="isOpen && activePanel"
      isShow
      dragClassesCustom="bottom-sheet-drag-classes-custom"
      @closed="back()"
    >
      <template #handler>
        <BottomSheetHandler />
      </template>

      <div class="bottom-sheet-content">
        <UiTitleModal>{{ panelTitle }}</UiTitleModal>
        <div class="bottom-sheet-content-inside scroller-block px-3!">
          <StatConfigPanelScreen :panel="activePanel" />
        </div>
      </div>
    </LazyBottomSheet>
  </Teleport>

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
            <div class="h-full overflow-x-clip overflow-y-auto overscroll-contain">
              <div class="sticky top-0 z-20 flex min-h-14 items-center gap-1 bg-default/90 px-2 backdrop-blur">
                <UButton
                  v-if="activePanel"
                  :aria-label="t('base.previous')"
                  class="shrink-0"
                  color="neutral"
                  icon="i-lucide-arrow-left"
                  variant="ghost"
                  @click="back()"
                />
                <UiHeaderTitle class="min-w-0 grow truncate px-2 md:text-xl">
                  {{ activePanel ? panelTitle : t('stat.config.menu.label') }}
                </UiHeaderTitle>
                <UiButtonClose class="shrink-0" @click="onClose" />
              </div>

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
