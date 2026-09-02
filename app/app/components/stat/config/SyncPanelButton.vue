<script setup lang="ts">
import type { SyncableStatConfigPanelId } from '~/components/stat/views/syncPanelConfig'

import { statViewControllerKey } from '~/components/stat/injectionKeys'
import { showSuccessToast } from '~/composables/useStoreSync'

const { panel } = defineProps<{
  panel: SyncableStatConfigPanelId
}>()

const { t } = useI18n()
const viewController = inject(statViewControllerKey, null)
const isSyncing = ref(false)

async function syncPanel(includeRules: boolean) {
  if (!viewController || isSyncing.value)
    return
  isSyncing.value = true
  try {
    await viewController.syncPanelAcrossViews(panel, includeRules)
    showSuccessToast('stat.views.blockSynced')
  }
  finally {
    isSyncing.value = false
  }
}

const items = computed(() => [[
  {
    label: t('stat.views.syncBlockSettings'),
    onSelect: () => syncPanel(false),
  },
  {
    label: t('stat.views.syncBlockWithRules'),
    onSelect: () => syncPanel(true),
  },
]])
</script>

<template>
  <UDropdownMenu v-if="viewController" :items>
    <UButton
      class="w-full justify-start rounded-sm! data-[state=open]:bg-elevated/50!"
      color="neutral"
      icon="i-lucide-copy"
      :label="t('stat.views.syncBlock')"
      size="sm"
      trailingIcon="i-lucide-chevron-down"
      variant="ghost"
      :disabled="isSyncing"
      :loading="isSyncing"
    />
  </UDropdownMenu>
</template>
