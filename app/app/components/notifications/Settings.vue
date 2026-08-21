<script setup lang="ts">
import { usePushNotifications } from '~/composables/usePushNotifications'
import { showErrorToast, showSuccessToast } from '~/composables/useStoreSync'

const { t } = useI18n()
const {
  isBusy,
  isSubscribed,
  isSupported,
  needsInstallForIos,
  permission,
  refresh,
  subscribe,
  unsubscribe,
} = usePushNotifications()

onMounted(refresh)

async function toggle() {
  if (isBusy.value)
    return

  if (isSubscribed.value) {
    if (await unsubscribe())
      showSuccessToast('notifications.disabled')
    return
  }

  const ok = await subscribe()
  if (ok)
    showSuccessToast('notifications.enabled')
  else if (permission.value === 'denied')
    showErrorToast('notifications.permissionDenied')
  else
    showErrorToast('notifications.error')
}
</script>

<template>
  <UiSettingsCard :title="t('notifications.title')" :description="t('notifications.description')">
    <div v-if="!isSupported" class="text-sm text-muted">
      {{ t('notifications.unsupported') }}
    </div>

    <template v-else>
      <UiSwitchItem
        :busy="isBusy"
        :checkboxValue="isSubscribed"
        :title="isSubscribed ? t('notifications.statusOn') : t('notifications.statusOff')"
        @click="toggle"
      />

      <div v-if="needsInstallForIos" class="px-2 pt-1 text-xs text-muted">
        {{ t('notifications.iosHint') }}
      </div>
      <div v-else-if="permission === 'denied'" class="px-2 pt-1 text-xs text-error">
        {{ t('notifications.permissionDenied') }}
      </div>
    </template>
  </UiSettingsCard>
</template>
