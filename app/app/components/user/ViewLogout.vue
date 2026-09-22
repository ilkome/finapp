<script setup lang="ts">
import { useOfflineReady } from '~/components/app/useOfflineReady'
import { useSyncStatus } from '~/components/app/useSyncStatus'
import { useUserStore } from '~/components/user/useUserStore'

const props = defineProps<{
  // Desktop's user-menu trigger already shows the name; the popover row only needs a small avatar.
  compact?: boolean
  // The menu (phone and desktop alike) drops the email - only the full account page on
  // /settings shows it.
  hideEmail?: boolean
  isShowSignOut?: boolean
}>()

const userStore = useUserStore()
const { t } = useI18n()
const { hasIssue, status } = useSyncStatus()
const { applyUpdate, offlineState } = useOfflineReady()
</script>

<template>
  <div class="grid gap-4">
    <div
      v-if="userStore.currentUser"
      class="flex items-center gap-3 text-sm"
    >
      <img
        v-if="userStore.currentUser?.photoURL"
        :src="userStore.currentUser?.photoURL"
        :class="props.compact ? 'size-7' : 'size-10'"
        class="rounded-full"
      >
      <div>
        <div class="font-semibold">
          {{ userStore.currentUser?.displayName }}
        </div>

        <template v-if="!props.hideEmail">
          {{ userStore.currentUser?.email }}
        </template>

        <div v-if="hasIssue" class="mt-1 text-xs text-warning">
          <span v-if="!status.connected">{{ t('sync.status.offline') }}</span>
          <span v-if="!status.connected && status.pending > 0"> · </span>
          <span v-if="status.pending > 0">{{ t('sync.status.pending', { count: status.pending }) }}</span>
          <div v-if="status.uploadError" class="text-error">
            {{ t('sync.status.uploadError') }}
          </div>
        </div>
        <div v-else-if="offlineState === 'updateReady'" class="mt-1 flex items-center gap-1.5 text-xs text-muted">
          {{ t('sync.status.updateAvailable') }}
          <UButton
            :label="t('sync.status.updateReload')"
            color="primary"
            size="xs"
            variant="soft"
            @click="applyUpdate"
          />
        </div>
        <div v-else-if="offlineState !== 'unavailable'" class="mt-1 text-xs text-muted">
          {{ t(`sync.status.${offlineState === 'ready' ? 'offlineReady' : offlineState === 'updating' ? 'updating' : 'offlinePreparing'}`) }}
        </div>
      </div>
    </div>

    <UButton
      v-if="props.isShowSignOut"
      class="px-4"
      icon="lucide:log-out"
      @click="userStore.signOut"
    >
      {{ t('user.logout') }}
    </UButton>
  </div>
</template>
