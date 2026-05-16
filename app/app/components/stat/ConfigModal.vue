<script setup lang="ts">
import type { StatConfigPanelId } from '~/components/stat/types'

import { statConfigPanelKey } from '~/components/stat/injectionKeys'

const props = defineProps<{
  labelMode?: boolean
}>()

const { t } = useI18n()

const isOpen = ref(false)
const activePanel = ref<StatConfigPanelId>('root')

provide(statConfigPanelKey, activePanel)

function onClose() {
  isOpen.value = false
  activePanel.value = 'root'
}
</script>

<template>
  <BottomSheetOrDropdown
    :title="t('stat.config.menu.label')"
    :isOpen
    isShowCloseBtn
    @openModal="isOpen = true"
    @closeModal="onClose"
  >
    <template #trigger>
      <UiHeaderLink
        v-if="props.labelMode"
        icon="lucide:settings-2"
      >
        {{ t('stat.config.menu.label') }}
      </UiHeaderLink>

      <UTooltip
        v-else
        :text="t('stat.config.menu.label')"
      >
        <UiActionButton :ariaLabel="t('stat.config.menu.label')">
          <Icon name="lucide:settings-2" size="20" />
        </UiActionButton>
      </UTooltip>
    </template>

    <template #content="{ close }">
      <div
        class="grid gap-4 overflow-y-auto"
        style="max-height: var(--reka-popper-available-height, 80dvh)"
      >
        <BottomSheetClose @click="close" />

        <slot :close="close" />
      </div>
    </template>
  </BottomSheetOrDropdown>
</template>
