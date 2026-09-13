<script setup lang="ts">
import { useSyncStatus } from '~/components/app/useSyncStatus'
import { useUserStore } from '~/components/user/useUserStore'

const props = defineProps<{
  isShowSignOut?: boolean
}>()

const userStore = useUserStore()
const { t } = useI18n()
const { hasIssue, status } = useSyncStatus()
</script>

<template>
  <div>
    <div
      v-if="userStore.currentUser"
      class="flex items-center gap-3 pb-4 text-sm"
    >
      <img
        v-if="userStore.currentUser?.photoURL"
        :src="userStore.currentUser?.photoURL"
        class="size-10 rounded-full"
      >
      <div>
        <div class="font-semibold">
          {{ userStore.currentUser?.displayName }}
        </div>

        {{ userStore.currentUser?.email }}

        <div v-if="hasIssue" class="mt-1 text-xs text-warning">
          <span v-if="!status.connected">{{ t('sync.status.offline') }}</span>
          <span v-if="!status.connected && status.pending > 0"> · </span>
          <span v-if="status.pending > 0">{{ t('sync.status.pending', { count: status.pending }) }}</span>
          <div v-if="status.uploadError" class="text-error">
            {{ t('sync.status.uploadError') }}
          </div>
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
