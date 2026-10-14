<script setup lang="ts">
import { useSyncStatus } from '~/components/app/useSyncStatus'
import { useUserMenuData } from '~/components/layout/useUserMenuData'

const { collapsed = false } = defineProps<{ collapsed?: boolean }>()

const { t } = useI18n()
const { triggerAvatar, triggerLabel } = useUserMenuData()
const { hasIssue: hasSyncIssue } = useSyncStatus()
const isOpen = ref(false)
const isLaptop = useIsLaptop()
const [DefineTrigger, ReuseTrigger] = createReusableTemplate<{ isActive: boolean }>()
</script>

<template>
  <DefineTrigger v-slot="{ isActive }">
    <UTooltip :text="triggerLabel" :disabled="!collapsed">
      <UButton
        :aria-label="t('login.menu.title')"
        :avatar="triggerAvatar"
        :label="collapsed ? undefined : triggerLabel"
        :square="collapsed"
        block
        :class="cn(
          'pointer-events-auto relative min-h-12 rounded-md! bg-transparent backdrop-blur transition-colors hover:bg-elevated/50! active:bg-elevated/50!',
          isActive && 'bg-elevated/50!',
          collapsed && 'px-0!',
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
    </UTooltip>
  </DefineTrigger>

  <LayoutUserMenuDropdown
    v-if="isLaptop"
    v-model:open="isOpen"
    :align="collapsed ? 'start' : 'center'"
    contentClass="w-74"
    :sessionActions="true"
  >
    <ReuseTrigger :isActive="isOpen" />
  </LayoutUserMenuDropdown>

  <DrawerOrDropdown
    v-else
    v-model:open="isOpen"
    :align="collapsed ? 'start' : 'center'"
    popoverContentClass="w-74"
  >
    <template #trigger="{ isActive }">
      <ReuseTrigger :isActive />
    </template>

    <template #content="{ close }">
      <div class="w-full py-2">
        <LayoutUserMenuPanels sessionActions @close="close" />
      </div>
    </template>
  </DrawerOrDropdown>
</template>
