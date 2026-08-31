<script setup lang="ts">
import type { StatConfigScreen } from '~/components/stat/config/types'

import { useStatConfigOverlay } from '~/components/stat/config/useStatConfigOverlay'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const props = defineProps<{
  labelMode?: boolean
  screen?: StatConfigScreen | null
}>()

const { t } = useI18n()
const { width } = useWindowSize()
const trnsFormStore = useTrnsFormStore()
const { close: closeOverlay, isOpen, open: openOverlay } = useStatConfigOverlay()
const title = computed(() => props.screen?.title ?? t('stat.config.menu.label'))

function onClose() {
  closeOverlay()
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
      <UiTitleModal :class="props.screen && 'py-2!'">
        <div class="flex min-w-0 items-center gap-1">
          <UiActionButton
            v-if="props.screen"
            :ariaLabel="t('base.previous')"
            isActive
            @click="props.screen.onBack"
          >
            <Icon name="lucide:arrow-left" size="20" />
          </UiActionButton>
          <span class="truncate">{{ title }}</span>
        </div>
      </UiTitleModal>
      <div class="bottom-sheet-content-inside scroller-block gap-4 px-3! pb-0!">
        <div class="grid gap-4">
          <slot :close="onClose" />
        </div>
      </div>
    </template>
  </BottomSheetOrDropdown>

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
          class="@container/statConfig fixed inset-y-0 right-0 z-50 h-dvh w-90 py-4"
        >
          <div class="relative h-full overflow-hidden rounded-md border border-accented bg-default shadow-2xl lg:rounded-2xl">
            <div class="h-full overflow-y-auto overscroll-contain">
              <div class="sticky top-0 z-20 flex min-h-14 items-center gap-1 bg-default/90 px-2 backdrop-blur">
                <UiActionButton
                  v-if="props.screen"
                  :ariaLabel="t('base.previous')"
                  isActive
                  @click="props.screen.onBack"
                >
                  <Icon name="lucide:arrow-left" size="20" />
                </UiActionButton>
                <UiHeaderTitle class="min-w-0 grow truncate px-2 md:text-xl">
                  {{ title }}
                </UiHeaderTitle>
                <UiButtonClose class="shrink-0" @click="onClose" />
              </div>

              <div class="px-3 pb-6">
                <slot :close="onClose" />
              </div>
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
