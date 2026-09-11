<script setup lang="ts">
import { useSyncStatus } from '~/components/app/useSyncStatus'
import { useUserMenuData } from '~/components/layout/useUserMenuData'

const { collapsed = false } = defineProps<{ collapsed?: boolean }>()

const { t } = useI18n()
const { triggerAvatar, triggerLabel } = useUserMenuData()
const { hasIssue: hasSyncIssue } = useSyncStatus()
const isOpen = ref(false)
</script>

<template>
  <BottomSheetOrDropdown
    :align="collapsed ? 'start' : 'center'"
    :isOpen="isOpen"
    popoverBodyClass="md:pb-0"
    popoverContentClass="w-64"
    @openModal="isOpen = true"
    @closeModal="isOpen = false"
  >
    <template #trigger="{ isActive }">
      <UButton
        :aria-label="t('login.menu.title')"
        :avatar="triggerAvatar"
        :label="collapsed ? undefined : triggerLabel"
        :square="collapsed"
        block
        :class="cn(
          'pointer-events-auto relative min-h-12 bg-transparent backdrop-blur transition-colors hover:bg-elevated/50! active:bg-elevated/50!',
          isActive && 'bg-elevated/50!',
        )"
        color="neutral"
        variant="ghost"
      >
        <template #trailing>
          <UIcon v-if="!collapsed" name="i-lucide-chevrons-up-down" class="text-dimmed" />
          <!-- Offline / unsynced-changes marker; the menu's account block carries the details. -->
          <span
            v-if="hasSyncIssue"
            data-testid="sync-issue-dot"
            class="absolute top-1.5 left-1.5 size-2 rounded-full bg-warning"
          />
        </template>
      </UButton>
    </template>

    <template #content="{ close }">
      <div class="w-full py-2">
        <LayoutUserMenuPanels sessionActions @close="close" />
      </div>
    </template>
  </BottomSheetOrDropdown>
</template>
