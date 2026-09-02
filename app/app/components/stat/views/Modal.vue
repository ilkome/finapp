<script setup lang="ts">
import { useStatConfigOverlay } from '~/components/stat/config/useStatConfigOverlay'

const isOpen = ref(false)
const { open: openConfig } = useStatConfigOverlay()

function onClose() {
  isOpen.value = false
}

function onOpen() {
  isOpen.value = true
}

function openSettings() {
  onClose()
  nextTick(() => openConfig())
}
</script>

<template>
  <BottomSheetOrDropdown
    :isOpen
    :title="$t('stat.views.menu.label')"
    :unmountOnHide="false"
    @openModal="onOpen"
    @closeModal="onClose"
  >
    <template #trigger>
      <UiTriggerButton
        icon="lucide:layout-panel-top"
        :labelMode="false"
        :title="$t('stat.views.menu.label')"
      />
    </template>

    <template #content>
      <div class="grid gap-3 pb-4 md:px-1 md:pb-0">
        <StatViewsList />

        <UButton block size="xl" @click="openSettings">
          {{ $t('stat.views.menu.settings') }}
        </UButton>
      </div>
    </template>
  </BottomSheetOrDropdown>
</template>
