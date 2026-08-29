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

async function syncPanel() {
  if (!viewController || isSyncing.value)
    return
  isSyncing.value = true
  try {
    await viewController.syncPanelAcrossViews(panel)
    showSuccessToast('stat.views.blockSynced')
  }
  finally {
    isSyncing.value = false
  }
}
</script>

<template>
  <UButton
    v-if="viewController"
    class="w-fit justify-self-start"
    color="neutral"
    icon="i-lucide-copy"
    :label="t('stat.views.syncBlock')"
    size="xs"
    variant="soft"
    :disabled="isSyncing"
    :loading="isSyncing"
    @click="syncPanel"
  />
</template>
