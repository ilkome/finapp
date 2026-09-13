<script setup lang="ts">
import { useSyncStatus } from '~/components/app/useSyncStatus'

// Session actions (enable demo / sign out) are only meaningful for an authenticated
// user mid-onboarding; the login page renders this menu without them.
const { sessionActions = false } = defineProps<{ sessionActions?: boolean }>()

const { t } = useI18n()
const { hasIssue: hasSyncIssue, status: syncStatus } = useSyncStatus()
const isOpen = ref(false)
</script>

<template>
  <BottomSheetOrDropdown
    align="end"
    :isOpen="isOpen"
    popoverBodyClass="md:pb-0"
    @openModal="isOpen = true"
    @closeModal="isOpen = false"
  >
    <template #trigger="{ isActive }">
      <span class="relative inline-flex">
        <UButton
          :aria-label="t('login.menu.title')"
          :variant="isActive ? 'soft' : 'ghost'"
          class="text-muted max-md:size-12 max-md:justify-center max-md:rounded-2xl max-md:border max-md:border-default/80 max-md:bg-default/20 max-md:shadow-lg max-md:backdrop-blur-xl max-md:dark:bg-neutral-800/50"
          color="neutral"
          icon="i-lucide-menu"
          size="lg"
          square
        />
        <!-- Offline / unsynced-changes marker; details live in the menu's account block. -->
        <span
          v-if="hasSyncIssue"
          :title="t('sync.status.pending', { count: syncStatus.pending })"
          class="pointer-events-none absolute top-0.5 right-0.5 size-2 rounded-full bg-warning"
        />
      </span>
    </template>

    <template #content="{ close }">
      <div class="w-full py-2 max-md:pt-6">
        <LayoutUserMenuPanels :sessionActions @close="close" />
      </div>
    </template>
  </BottomSheetOrDropdown>
</template>
